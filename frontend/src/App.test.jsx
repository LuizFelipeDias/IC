import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { tokenStorage } from "./services/api";

afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    window.history.pushState({}, "", "/");
});

function renderizar(caminho) {
    window.history.pushState({}, "", caminho);
    return render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

describe("guardas de rota", () => {
    it("redireciona visitante sem token de uma rota protegida para o login", async () => {
        renderizar("/vaga");

        expect(await screen.findByRole("button", { name: /entrar|login|acessar/i })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/");
    });

    it("redireciona o endereço antigo /login para /", async () => {
        renderizar("/login");

        await screen.findByRole("button", { name: /entrar|login|acessar/i });
        expect(window.location.pathname).toBe("/");
    });

    it("usuário com token não volta para a tela de login", async () => {
        tokenStorage.set("token-valido");
        vi.spyOn(globalThis, "fetch").mockImplementation(() =>
            Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200, headers: { "Content-Type": "application/json" } }))
        );

        renderizar("/");

        await vi.waitFor(() => expect(window.location.pathname).toBe("/home"));
    });
});
