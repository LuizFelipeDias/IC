/* ================================================================== *
 * Cliente único da API Laravel
 * Todas as páginas devem usar api() em vez de chamar fetch diretamente.
 * ================================================================== */

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

const CHAVE_TOKEN = "@hub:token";

/** Disparado quando a API recusa o token (expirado ou revogado). */
export const EVENTO_SESSAO_EXPIRADA = "hub:sessao-expirada";

export const tokenStorage = {
    get: () => {
        const token = localStorage.getItem(CHAVE_TOKEN);
        return token && token !== "null" && token !== "undefined" ? token : null;
    },
    set: (token) => localStorage.setItem(CHAVE_TOKEN, token),
    clear: () => localStorage.removeItem(CHAVE_TOKEN),
};

export class ApiError extends Error {
    constructor(message, status, erros = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        // Erros de validação do Laravel (422): { campo: ["mensagem", ...] }
        this.erros = erros;
    }
}

export async function api(path, { method = "GET", body, auth = true } = {}) {
    const headers = { Accept: "application/json" };
    // FormData (envio de arquivos) define o próprio Content-Type com o boundary.
    const multipart = body instanceof FormData;
    if (body !== undefined && !multipart) headers["Content-Type"] = "application/json";

    const token = auth ? tokenStorage.get() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body === undefined || multipart ? body : JSON.stringify(body),
        });
    } catch {
        throw new ApiError("Erro de conexão com o servidor.", 0);
    }

    if (response.status === 401 && token) {
        tokenStorage.clear();
        window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    }

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const corpo = response.status === 204 || !isJson ? null : await response.json().catch(() => null);

    if (!response.ok) {
        const detalhe = corpo?.errors ? Object.values(corpo.errors).flat().join(" ") : corpo?.message;
        throw new ApiError(detalhe || `Erro ${response.status} ao acessar ${path}.`, response.status, corpo?.errors ?? {});
    }

    return corpo;
}

// A API devolve listas paginadas ({ data: [...], links, meta }).
export const lista = (resposta) => (Array.isArray(resposta) ? resposta : resposta?.data ?? []);

/** Monta a query string ignorando filtros vazios. */
export const query = (params) => {
    const busca = new URLSearchParams(Object.entries(params).filter(([, valor]) => valor !== "" && valor != null));
    const texto = busca.toString();
    return texto ? `?${texto}` : "";
};

/** Pede o link temporário assinado de um anexo e abre o download. */
export async function baixarAnexo(idAnexo) {
    const { url } = await api(`/anexo/${idAnexo}/link`);
    window.open(url, "_blank", "noopener");
}
