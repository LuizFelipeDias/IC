import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, Inbox, XCircle } from "lucide-react";

/* Peças de interface compartilhadas. O visual está em styles/componentes.css. */

export function Campo({ id, rotulo, erro, ajuda, children }) {
    return (
        <div className="campo">
            {rotulo && (
                <label htmlFor={id} className="campo__rotulo">
                    {rotulo}
                </label>
            )}
            {children}
            {ajuda && !erro && <span className="campo__ajuda">{ajuda}</span>}
            {erro && (
                <span className="campo__erro" role="alert">
                    {erro}
                </span>
            )}
        </div>
    );
}

export function Chip({ tom = "neutro", ponto = false, children }) {
    const classes = ["chip", tom !== "neutro" && `chip--${tom}`, ponto && "chip--ponto"].filter(Boolean).join(" ");
    return <span className={classes}>{children}</span>;
}

const ICONES_AVISO = { info: Info, alerta: AlertTriangle, perigo: XCircle, sucesso: CheckCircle2 };

export function Aviso({ tom = "info", children }) {
    const Icone = ICONES_AVISO[tom];
    return (
        <div className={`aviso aviso--${tom}`} role={tom === "perigo" ? "alert" : "status"}>
            <Icone size={18} aria-hidden="true" />
            <div>{children}</div>
        </div>
    );
}

export function Vazio({ icone: Icone = Inbox, titulo, children, acao }) {
    return (
        <div className="vazio">
            <Icone size={36} strokeWidth={1.5} aria-hidden="true" />
            <strong>{titulo}</strong>
            {children && <p>{children}</p>}
            {acao}
        </div>
    );
}

export function Carregando({ texto = "Carregando..." }) {
    return (
        <div className="carregando" role="status">
            {texto}
        </div>
    );
}

export function Dialogo({ aberto, aoFechar, titulo, children }) {
    useEffect(() => {
        if (!aberto) return undefined;
        const fechar = (evento) => evento.key === "Escape" && aoFechar();
        window.addEventListener("keydown", fechar);
        return () => window.removeEventListener("keydown", fechar);
    }, [aberto, aoFechar]);

    if (!aberto) return null;

    return (
        <div className="dialogo-fundo" onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}>
            <div className="dialogo" role="dialog" aria-modal="true" aria-label={titulo}>
                {children}
            </div>
        </div>
    );
}

export function CabecalhoPagina({ sobrelinha, titulo, descricao, children }) {
    return (
        <header className="cabecalho-pagina">
            <div>
                {sobrelinha && <span className="sobrelinha">{sobrelinha}</span>}
                <h1>{titulo}</h1>
                {descricao && <p>{descricao}</p>}
            </div>
            {children && <div className="linha">{children}</div>}
        </header>
    );
}

/** Converte os erros 422 da API ({ campo: [mensagens] }) em { campo: primeiraMensagem }. */
export const errosPorCampo = (erro) =>
    Object.fromEntries(Object.entries(erro?.erros ?? {}).map(([campo, mensagens]) => [campo, mensagens[0]]));
