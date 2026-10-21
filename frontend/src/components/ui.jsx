import React, { useEffect, useRef, useState } from "react";
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
            <span className="vazio__icone">
                <Icone size={36} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <strong>{titulo}</strong>
            {children && <p>{children}</p>}
            {acao}
        </div>
    );
}

/** Estado de carregamento: texto com indicador e linhas de esqueleto brilhando. */
export function Carregando({ texto = "Carregando...", linhas = 3 }) {
    return (
        <div className="carregando" role="status">
            <span className="carregando__texto">{texto}</span>
            {linhas > 0 && (
                <div className="carregando__esqueleto" aria-hidden="true">
                    {Array.from({ length: linhas }, (_, i) => (
                        <span key={i} className="esqueleto" style={{ width: `${100 - i * 14}%`, animationDelay: `${i * 120}ms` }} />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Número que conta de 0 até o valor quando entra na tela.
 * Formata em pt-BR; com prefers-reduced-motion mostra o valor direto.
 */
export function Contador({ valor = 0, duracao = 1400, casas = 0, sufixo = "" }) {
    const ref = useRef(null);
    const [atual, setAtual] = useState(0);
    const alvo = Number(valor) || 0;

    useEffect(() => {
        const semMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (semMovimento || typeof IntersectionObserver === "undefined") {
            setAtual(alvo);
            return undefined;
        }
        let quadro;
        const observador = new IntersectionObserver(([entrada]) => {
            if (!entrada.isIntersecting) return;
            observador.disconnect();
            const inicio = performance.now();
            const passo = (agora) => {
                const t = Math.min(1, (agora - inicio) / duracao);
                const suave = 1 - Math.pow(1 - t, 4);
                setAtual(alvo * suave);
                if (t < 1) quadro = requestAnimationFrame(passo);
            };
            quadro = requestAnimationFrame(passo);
        });
        if (ref.current) observador.observe(ref.current);
        return () => {
            observador.disconnect();
            cancelAnimationFrame(quadro);
        };
    }, [alvo, duracao]);

    return (
        <span ref={ref} className="contador">
            {atual.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}
            {sufixo}
        </span>
    );
}

const DURACAO_SAIDA = 220;

export function Dialogo({ aberto, aoFechar, titulo, children }) {
    // Continua montado durante a animação de saída.
    const [montado, setMontado] = useState(aberto);
    const [saindo, setSaindo] = useState(false);
    const caixa = useRef(null);

    useEffect(() => {
        if (aberto) {
            setMontado(true);
            setSaindo(false);
            return undefined;
        }
        if (!montado) return undefined;
        setSaindo(true);
        const id = setTimeout(() => {
            setMontado(false);
            setSaindo(false);
        }, DURACAO_SAIDA);
        return () => clearTimeout(id);
    }, [aberto, montado]);

    useEffect(() => {
        if (!aberto) return undefined;
        const fechar = (evento) => evento.key === "Escape" && aoFechar();
        window.addEventListener("keydown", fechar);
        const anterior = document.activeElement;
        const corpo = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => caixa.current?.querySelector("input, select, textarea, button")?.focus({ preventScroll: true }));
        return () => {
            window.removeEventListener("keydown", fechar);
            document.body.style.overflow = corpo;
            anterior?.focus?.({ preventScroll: true });
        };
    }, [aberto, aoFechar]);

    if (!montado) return null;

    return (
        <div className={`dialogo-fundo ${saindo ? "saindo" : ""}`} onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}>
            <div ref={caixa} className="dialogo" role="dialog" aria-modal="true" aria-label={titulo}>
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

/**
 * Área de envio de arquivos: clique ou arraste. Mostra o estado de arrastar e,
 * com `enviando`, uma barra de progresso indeterminada.
 */
export function AreaEnvio({ icone: Icone, titulo, ajuda, accept, multiple = false, enviando = false, aoEscolher, classe = "", children }) {
    const [arrastando, setArrastando] = useState(false);
    const contador = useRef(0);

    const entregar = (lista) => {
        const arquivos = Array.from(lista ?? []);
        if (arquivos.length) aoEscolher(multiple ? arquivos : arquivos[0]);
    };

    return (
        <label
            className={`area-envio ${arrastando ? "area-envio--arrastando" : ""} ${classe}`}
            onDragEnter={(e) => {
                e.preventDefault();
                contador.current += 1;
                setArrastando(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => {
                contador.current -= 1;
                if (contador.current <= 0) setArrastando(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                contador.current = 0;
                setArrastando(false);
                entregar(e.dataTransfer.files);
            }}
        >
            {Icone && <Icone size={26} aria-hidden="true" />}
            <strong>{arrastando ? "Solte para enviar" : titulo}</strong>
            {ajuda && <span>{ajuda}</span>}
            {children}
            {enviando && (
                <span className="progresso" style={{ width: "100%" }} role="progressbar" aria-label="Enviando">
                    <span />
                </span>
            )}
            <input type="file" accept={accept} multiple={multiple} className="sr-only" disabled={enviando} onChange={(e) => { entregar(e.target.files); e.target.value = ""; }} />
        </label>
    );
}

/**
 * Remoção animada de itens de lista: marca a chave como "saindo",
 * espera a animação (.item-saindo) e só então executa a remoção.
 */
export function useSaida(duracao = 380) {
    const [saindo, setSaindo] = useState(() => new Set());
    const remover = (chave, aoFim) => {
        setSaindo((atual) => new Set(atual).add(chave));
        setTimeout(() => {
            aoFim();
            setSaindo((atual) => {
                const copia = new Set(atual);
                copia.delete(chave);
                return copia;
            });
        }, duracao);
    };
    return [saindo, remover];
}
