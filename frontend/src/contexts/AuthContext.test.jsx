import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { EVENTO_SESSAO_EXPIRADA, tokenStorage } from "../services/api";

const usuarioEscola = {
    id: 1,
    nome: "Colégio Estadual Professor Becker",
    perfis: { solicitante: true, prestador: false, contratante: true, candidato: false, publicador: true, receptor: false, moderador: false },
};

function Sonda() {
    const { autenticado, usuario, pode, entrar, sair, carregando } = useAuth();
    return (
        <div>
            <span data-testid="estado">{carregando ? "carregando" : autenticado ? "logado" : "anonimo"}</span>
            <span data-testid="nome">{usuario?.nome ?? "-"}</span>
            <span data-testid="pode-abrir">{String(pode("solicitante"))}</span>
            <span data-testid="pode-aceitar">{String(pode("prestador"))}</span>
            <span data-testid="pode-algum">{String(pode("prestador", "contratante"))}</span>
            <button onClick={() => entrar("token-novo")}>entrar</button>
            <button onClick={() => sair()}>sair</button>
        </div>
    );
}

const respostaJson = (dados, status = 200) => Promise.resolve(new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } }));

describe("AuthContext", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal("fetch", vi.fn((url) => (String(url).endsWith("/usuario/me") ? respostaJson(usuarioEscola) : respostaJson({}, 204))));
    });
    afterEach(() => vi.unstubAllGlobals());

    it("começa anônimo e sem permissões", () => {
        render(<AuthProvider><Sonda /></AuthProvider>);
        expect(screen.getByTestId("estado")).toHaveTextContent("anonimo");
        expect(screen.getByTestId("pode-abrir")).toHaveTextContent("false");
    });

    it("ao entrar guarda o token, carrega o usuário e calcula pode() pelos perfis da API", async () => {
        render(<AuthProvider><Sonda /></AuthProvider>);
        act(() => screen.getByText("entrar").click());

        await waitFor(() => expect(screen.getByTestId("nome")).toHaveTextContent("Colégio Estadual"));
        expect(tokenStorage.get()).toBe("token-novo");
        expect(screen.getByTestId("pode-abrir")).toHaveTextContent("true");
        expect(screen.getByTestId("pode-aceitar")).toHaveTextContent("false");
        expect(screen.getByTestId("pode-algum")).toHaveTextContent("true");
        const chamada = fetch.mock.calls.find(([url]) => String(url).endsWith("/usuario/me"));
        expect(chamada[1].headers.Authorization).toBe("Bearer token-novo");
    });

    it("ao sair chama /logout e limpa a sessão, mesmo se a API falhar", async () => {
        tokenStorage.set("token-antigo");
        fetch.mockImplementation((url) => (String(url).endsWith("/logout") ? Promise.reject(new Error("rede")) : respostaJson(usuarioEscola)));
        render(<AuthProvider><Sonda /></AuthProvider>);
        await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("logado"));

        await act(async () => screen.getByText("sair").click());

        expect(tokenStorage.get()).toBeNull();
        expect(screen.getByTestId("estado")).toHaveTextContent("anonimo");
    });

    it("encerra a sessão quando a API avisa que o token expirou", async () => {
        tokenStorage.set("token-antigo");
        render(<AuthProvider><Sonda /></AuthProvider>);
        await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("logado"));

        act(() => window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA)));

        expect(screen.getByTestId("estado")).toHaveTextContent("anonimo");
        expect(screen.getByTestId("pode-abrir")).toHaveTextContent("false");
    });
});
