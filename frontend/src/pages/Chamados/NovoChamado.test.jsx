import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NovoChamado from "./NovoChamado";

const json = (dados, status = 200) => Promise.resolve(new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } }));
const OPCOES = { tipos_servico: [{ valor: "impressao_peca", rotulo: "Impressão de peça" }, { valor: "modelagem", rotulo: "Modelagem 3D" }], locais_atendimento: [] };

function renderizar() {
    return render(
        <MemoryRouter initialEntries={["/chamados/novo"]}>
            <Routes>
                <Route path="/chamados/novo" element={<NovoChamado />} />
                <Route path="/chamados" element={<p>Painel de chamados</p>} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("Novo chamado", () => {
    beforeEach(() => {
        localStorage.setItem("@hub:token", "t");
        Element.prototype.scrollIntoView = vi.fn();
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
        localStorage.clear();
    });

    it("lista os tipos de serviço vindos da API como opções de rádio", async () => {
        vi.stubGlobal("fetch", vi.fn(() => json(OPCOES)));
        renderizar();

        expect(await screen.findByRole("radio", { name: /impressão de peça/i })).not.toBeChecked();
        expect(screen.getByLabelText("Título")).toBeInTheDocument();
        expect(screen.getByLabelText("Prazo desejado")).toHaveAttribute("type", "date");
    });

    it("mostra os erros 422 da API em cada campo e marca aria-invalid", async () => {
        vi.stubGlobal("fetch", vi.fn((url, opcoes) =>
            opcoes?.method === "POST"
                ? json({ message: "Dados inválidos.", errors: { titulo: ["O campo título é obrigatório."], data_limite: ["O campo prazo é obrigatório."] } }, 422)
                : json(OPCOES),
        ));
        renderizar();
        await screen.findByRole("radio", { name: /modelagem/i });

        fireEvent.click(screen.getByRole("button", { name: /abrir chamado/i }));

        expect(await screen.findByText("O campo título é obrigatório.")).toBeInTheDocument();
        expect(screen.getByLabelText("Título")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Prazo desejado")).toHaveAttribute("aria-invalid", "true");
    });

    it("envia os dados digitados, mostra o sucesso e volta ao painel", async () => {
        const chamadas = [];
        vi.stubGlobal("fetch", vi.fn((url, opcoes) => {
            chamadas.push([String(url), opcoes]);
            return opcoes?.method === "POST" ? json({ id: 42, titulo: "Oficina de modelagem" }, 201) : json(OPCOES);
        }));
        renderizar();
        await screen.findByRole("radio", { name: /modelagem/i });

        fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Oficina de modelagem" } });
        fireEvent.click(screen.getByRole("radio", { name: /modelagem/i }));
        expect(screen.getByRole("radio", { name: /modelagem/i })).toBeChecked();
        fireEvent.change(screen.getByLabelText("UF"), { target: { value: "p4r" } });
        fireEvent.click(screen.getByRole("button", { name: /abrir chamado/i }));

        expect(await screen.findByText(/CH-00042/)).toBeInTheDocument();
        const [, post] = chamadas.find(([, o]) => o?.method === "POST");
        expect(JSON.parse(post.body)).toMatchObject({ titulo: "Oficina de modelagem", tipo_servico: "modelagem", uf: "PR" });
        await waitFor(() => expect(screen.getByText("Painel de chamados")).toBeInTheDocument(), { timeout: 2500 });
    });
});
