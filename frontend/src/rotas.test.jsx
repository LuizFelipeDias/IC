import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { tokenStorage } from "./services/api";

const json = (dados, status = 200) => Promise.resolve(new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } }));

const PERFIS_VAZIOS = { solicitante: false, prestador: false, contratante: false, candidato: false, publicador: false, receptor: false, moderador: false };
const USUARIOS = {
    maker: { id: 2, nome: "Rafael Kowalski", tipo_usuario: "pessoa_fisica", perfis: { ...PERFIS_VAZIOS, prestador: true, candidato: true } },
    escola: { id: 3, nome: "Colégio Estadual", tipo_usuario: "escola", verificacao_status: "verificado", perfis: { ...PERFIS_VAZIOS, solicitante: true, contratante: true, publicador: true } },
    pendente: { id: 4, nome: "Filamentos Verdes", tipo_usuario: "empresa", verificacao_status: "pendente", perfis: PERFIS_VAZIOS },
    laboratorio: { id: 5, nome: "Laboratório de Polímeros", tipo_usuario: "laboratorio", verificacao_status: "verificado", perfis: { ...PERFIS_VAZIOS, prestador: true, contratante: true, publicador: true, receptor: true } },
};

function entrarComo(chave, caminho) {
    tokenStorage.set("token");
    vi.stubGlobal("fetch", vi.fn((url) => {
        const u = String(url);
        if (u.endsWith("/usuario/me")) return json(USUARIOS[chave]);
        if (u.includes("/chamado/opcoes")) return json({ tipos_servico: [], locais_atendimento: [] });
        return json({ data: [], meta: { total: 0 } });
    }));
    window.history.pushState({}, "", caminho);
    return render(<AuthProvider><App /></AuthProvider>);
}

describe("rotas por perfil (RBAC no front)", () => {
    beforeEach(() => {
        Element.prototype.scrollIntoView = vi.fn();
        vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        localStorage.clear();
        window.history.pushState({}, "", "/");
    });

    it("maker não abre chamado: /chamados/novo mostra o bloqueio", async () => {
        entrarComo("maker", "/chamados/novo");
        expect(await screen.findByText("Seu perfil não tem acesso a esta área")).toBeInTheDocument();
    });

    it("escola verificada vê o formulário de novo chamado", async () => {
        entrarComo("escola", "/chamados/novo");
        expect(await screen.findByRole("heading", { name: /novo chamado/i })).toBeInTheDocument();
    });

    it("instituição pendente recebe a explicação da verificação", async () => {
        entrarComo("pendente", "/vagas/nova");
        expect(await screen.findByText(/ainda está em análise/i)).toBeInTheDocument();
    });

    it("só laboratório (receptor) entra em /lotes", async () => {
        entrarComo("maker", "/lotes");
        expect(await screen.findByText("Seu perfil não tem acesso a esta área")).toBeInTheDocument();
    });

    it("qualquer usuário logado abre o diretório de empresas", async () => {
        entrarComo("maker", "/instituicoes");
        expect(await screen.findByRole("heading", { name: /empresas e/i })).toBeInTheDocument();
        expect(fetch.mock.calls.some(([url]) => String(url).includes("/instituicoes"))).toBe(true);
    });

    it("link Empresas aparece na navegação e Moderação não aparece para quem não modera", async () => {
        entrarComo("laboratorio", "/home");
        expect(await screen.findByRole("link", { name: "Empresas" })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Moderação" })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Lotes" })).toBeInTheDocument();
    });
});
