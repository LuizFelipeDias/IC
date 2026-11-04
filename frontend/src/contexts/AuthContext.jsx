import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, EVENTO_SESSAO_EXPIRADA, tokenStorage } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => tokenStorage.get());
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(() => Boolean(tokenStorage.get()));

    // Busca o usuário logado uma única vez por token (antes, cada página repetia a chamada).
    useEffect(() => {
        if (!token) {
            setUsuario(null);
            setCarregando(false);
            return undefined;
        }

        let ativo = true;
        setCarregando(true);
        api("/usuario/me")
            .then((dados) => ativo && setUsuario(dados))
            .catch((erro) => console.warn("Não foi possível carregar o usuário:", erro))
            .finally(() => ativo && setCarregando(false));

        return () => {
            ativo = false;
        };
    }, [token]);

    // Token recusado pela API em qualquer chamada: encerra a sessão local.
    useEffect(() => {
        const expirar = () => setToken(null);
        window.addEventListener(EVENTO_SESSAO_EXPIRADA, expirar);
        return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, expirar);
    }, []);

    const entrar = useCallback((novoToken) => {
        tokenStorage.set(novoToken);
        setToken(novoToken);
    }, []);

    const sair = useCallback(async () => {
        try {
            await api("/logout", { method: "POST" });
        } catch {
            // Mesmo sem resposta do servidor, a sessão local é encerrada.
        }
        tokenStorage.clear();
        setToken(null);
    }, []);

    // Perfis calculados pela API (solicitante, prestador, contratante, candidato, publicador, moderador).
    const pode = useCallback((...perfis) => perfis.some((perfil) => Boolean(usuario?.perfis?.[perfil])), [usuario]);

    const valor = useMemo(
        () => ({ token, usuario, carregando, autenticado: Boolean(token), entrar, sair, pode }),
        [token, usuario, carregando, entrar, sair, pode]
    );

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
    return contexto;
}
