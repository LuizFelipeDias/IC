import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import CadastroUsuario from "./CadastroUsuario";
import { AuthProvider } from "../../contexts/AuthContext";

const json = (dados, status = 200) => Promise.resolve(new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } }));

function renderizar() {
    return render(
        <MemoryRouter>
            <AuthProvider>
                <CadastroUsuario />
            </AuthProvider>
        </MemoryRouter>,
    );
}

describe("Cadastro", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        localStorage.clear();
    });

    it("oferece os cinco tipos de conta, incluindo Estabelecimento", () => {
        renderizar();
        for (const tipo of ["Pessoa física", "Empresa", "Escola", "Laboratório", "Estabelecimento"]) {
            expect(screen.getByRole("radio", { name: new RegExp(tipo, "i") })).toBeInTheDocument();
        }
    });

    it("estabelecimento pede CNPJ (e não CPF) e envia o tipo certo, com máscara", async () => {
        const enviados = [];
        vi.stubGlobal("fetch", vi.fn((url, opcoes) => {
            if (opcoes?.method === "POST") enviados.push(JSON.parse(opcoes.body));
            return json({ message: "Dados inválidos.", errors: { cnpj: ["O CNPJ informado não é válido."] } }, 422);
        }));
        renderizar();

        fireEvent.click(screen.getByRole("radio", { name: /estabelecimento/i }));
        expect(screen.queryByLabelText("CPF")).not.toBeInTheDocument();
        fireEvent.change(screen.getByLabelText("CNPJ"), { target: { value: "11222333000181" } });
        expect(screen.getByLabelText("CNPJ")).toHaveValue("11.222.333/0001-81");

        fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "Senha@123" } });
        fireEvent.change(screen.getByLabelText("Confirme a senha"), { target: { value: "Senha@123" } });
        fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

        await waitFor(() => expect(enviados).toHaveLength(1));
        expect(enviados[0]).toMatchObject({ tipo_usuario: "estabelecimento", cnpj: "11.222.333/0001-81" });
        expect(enviados[0]).not.toHaveProperty("cpf");
        expect(await screen.findByText("O CNPJ informado não é válido.")).toBeInTheDocument();
    });

    it("não envia quando as senhas não coincidem", () => {
        vi.stubGlobal("fetch", vi.fn());
        renderizar();
        fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "Senha@123" } });
        fireEvent.change(screen.getByLabelText("Confirme a senha"), { target: { value: "Outra@123" } });
        fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

        expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
    });
});
