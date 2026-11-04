import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, EVENTO_SESSAO_EXPIRADA, lista, tokenStorage } from "./api";

function respostaJson(status, corpo) {
    return Promise.resolve(
        new Response(corpo === null ? null : JSON.stringify(corpo), {
            status,
            headers: { "Content-Type": "application/json" },
        })
    );
}

afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
});

describe("api()", () => {
    it("envia o token salvo no cabeçalho Authorization", async () => {
        tokenStorage.set("abc");
        const fetchMock = vi.spyOn(globalThis, "fetch").mockReturnValue(respostaJson(200, { ok: true }));

        await api("/usuario/me");

        expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer abc");
    });

    it("não envia token quando auth=false", async () => {
        tokenStorage.set("abc");
        const fetchMock = vi.spyOn(globalThis, "fetch").mockReturnValue(respostaJson(200, {}));

        await api("/login", { method: "POST", body: {}, auth: false });

        expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });

    it("transforma erros de validação 422 em ApiError com os campos", async () => {
        vi.spyOn(globalThis, "fetch").mockReturnValue(
            respostaJson(422, { message: "inválido", errors: { email: ["E-mail já cadastrado."] } })
        );

        const erro = await api("/usuario", { method: "POST", body: {} }).catch((e) => e);

        expect(erro).toBeInstanceOf(ApiError);
        expect(erro.status).toBe(422);
        expect(erro.message).toBe("E-mail já cadastrado.");
        expect(erro.erros.email).toEqual(["E-mail já cadastrado."]);
    });

    it("encerra a sessão local quando o token é recusado (401)", async () => {
        tokenStorage.set("expirado");
        const ouvinte = vi.fn();
        window.addEventListener(EVENTO_SESSAO_EXPIRADA, ouvinte);
        vi.spyOn(globalThis, "fetch").mockReturnValue(respostaJson(401, { message: "Unauthenticated." }));

        await expect(api("/vaga/minhas")).rejects.toThrow(ApiError);

        expect(tokenStorage.get()).toBeNull();
        expect(ouvinte).toHaveBeenCalledOnce();
        window.removeEventListener(EVENTO_SESSAO_EXPIRADA, ouvinte);
    });

    it("devolve null em 204", async () => {
        vi.spyOn(globalThis, "fetch").mockReturnValue(Promise.resolve(new Response(null, { status: 204 })));

        expect(await api("/vaga/1", { method: "DELETE" })).toBeNull();
    });

    it("informa erro de conexão quando o servidor não responde", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

        const erro = await api("/vaga").catch((e) => e);

        expect(erro.status).toBe(0);
        expect(erro.message).toBe("Erro de conexão com o servidor.");
    });
});

describe("lista()", () => {
    it("aceita array puro ou resposta paginada", () => {
        expect(lista([1, 2])).toEqual([1, 2]);
        expect(lista({ data: [3], meta: {} })).toEqual([3]);
        expect(lista(null)).toEqual([]);
    });
});
