import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import RequirePerfil from "./RequirePerfil";
import { AuthProvider } from "../contexts/AuthContext";
import { tokenStorage } from "../services/api";

function usuarioComPerfis(perfis) {
    tokenStorage.set("token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ id: 1, nome: "Teste", perfis }), { status: 200, headers: { "Content-Type": "application/json" } })
    );
}

function renderizar() {
    return render(
        <MemoryRouter>
            <AuthProvider>
                <RequirePerfil perfis={["solicitante", "prestador"]}>
                    <p>Área de chamados</p>
                </RequirePerfil>
            </AuthProvider>
        </MemoryRouter>
    );
}

afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
});

describe("RequirePerfil", () => {
    it("mostra o conteúdo para quem tem um dos perfis", async () => {
        usuarioComPerfis({ solicitante: false, prestador: true });
        renderizar();

        expect(await screen.findByText("Área de chamados")).toBeInTheDocument();
    });

    it("bloqueia quem não tem nenhum dos perfis", async () => {
        usuarioComPerfis({ solicitante: false, prestador: false, candidato: true });
        renderizar();

        expect(await screen.findByText(/não tem acesso a esta área/i)).toBeInTheDocument();
        expect(screen.queryByText("Área de chamados")).not.toBeInTheDocument();
    });
});
