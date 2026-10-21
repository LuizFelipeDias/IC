import React, { Children, cloneElement, isValidElement } from "react";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";

/* ==================================================================
 * Peças do visual "Website Templates — Squarespace" compartilhadas
 * pelas listagens (Doações, Empresas) e pelos formulários de registro.
 * O estilo das listagens está em styles/pages/chamados.css (classes sq-)
 * e o dos formulários em styles/pages/registro.css (classes rg-).
 * ================================================================== */

/** Caixa de seleção quadrada de 14 px do template (cinza #CCC quando marcada). */
export function OpcaoCaixa({ marcada, aoMarcar, papel = "radio", children }) {
    return (
        <button type="button" role={papel} aria-checked={marcada} className="sq-caixa" onClick={aoMarcar}>
            <span className="sq-caixa__quadro" aria-hidden="true">{marcada && <Check size={12} strokeWidth={3} />}</span>
            {children}
        </button>
    );
}

/** Item de lista com seta (coluna "TOPIC" do template). */
export function OpcaoSeta({ marcada, aoMarcar, children }) {
    return (
        <button type="button" role="radio" aria-checked={marcada} className="sq-seta" onClick={aoMarcar}>
            {marcada && <ArrowRight size={14} aria-hidden="true" />}
            {children}
        </button>
    );
}

/* ---------------------------- Formulários ---------------------------- */

/**
 * Section 01 do template para formulários: título de 64 px à esquerda e texto
 * de 533 px à direita; abaixo, a linha de resultados com âncoras para cada bloco.
 */
export function RgCabecalho({ sobrelinha, titulo, texto, etapas = [], children }) {
    return (
        <>
            <section className="sq-secao sq-topo rg-topo">
                <div className="sq-topo__titulo" data-revelar>
                    <div className="rg-topo__titulo">
                        {sobrelinha && <p className="sq-rotulo rg-topo__sobrelinha">{sobrelinha}</p>}
                        <h1>{titulo}</h1>
                    </div>
                    <p>{texto}</p>
                </div>
                {children}
            </section>
            {etapas.length > 0 && (
                <section className="sq-secao sq-resultados rg-etapas" data-revelar="fade">
                    <p>
                        <strong>{etapas.length} {etapas.length === 1 ? "etapa" : "etapas"}</strong>
                        {etapas.map(([ancora, rotulo], i) => (
                            <React.Fragment key={ancora}>
                                {i > 0 && ", "}
                                <a className="sq-link" href={`#${ancora}`}>{rotulo}</a>
                            </React.Fragment>
                        ))}
                    </p>
                </section>
            )}
        </>
    );
}

/**
 * Linha do formulário: coluna esquerda com número, rótulo de 11 px e ajuda
 * (como as colunas de filtro do template); coluna direita com os campos.
 */
export function RgBloco({ id, numero, titulo, ajuda, indice = 0, children }) {
    return (
        <section className="rg-bloco" id={id} aria-labelledby={`${id}-titulo`} data-revelar style={{ "--atraso": `${Math.min(indice, 4) * 90}ms` }}>
            <div className="rg-bloco__info">
                {numero && <span className="rg-bloco__numero" aria-hidden="true">{numero}</span>}
                <h2 className="sq-rotulo" id={`${id}-titulo`}>{titulo}</h2>
                {ajuda && <p>{ajuda}</p>}
            </div>
            <div className="rg-campos">{children}</div>
        </section>
    );
}

/**
 * Campo com <label> real. O elemento filho recebe id, aria-invalid e
 * aria-describedby automaticamente (ajuda ou mensagem de erro da API).
 */
export function RgCampo({ id, rotulo, erro, ajuda, inteiro = false, contador, children }) {
    const idAjuda = `${id}-ajuda`;
    const idErro = `${id}-erro`;
    const descrito = [erro ? idErro : ajuda ? idAjuda : null].filter(Boolean).join(" ") || undefined;
    const filho = Children.only(children);
    const entrada = isValidElement(filho)
        ? cloneElement(filho, { id, "aria-invalid": erro ? true : undefined, "aria-describedby": descrito })
        : filho;

    return (
        <div className={`rg-campo ${inteiro ? "rg-inteiro" : ""} ${erro ? "rg-campo--erro" : ""}`}>
            <div className="rg-campo__topo">
                <label htmlFor={id} className="rg-campo__rotulo">{rotulo}</label>
                {contador}
            </div>
            {entrada}
            {ajuda && !erro && <span id={idAjuda} className="rg-campo__ajuda">{ajuda}</span>}
            {erro && <span id={idErro} className="rg-campo__erro" role="alert">{erro}</span>}
        </div>
    );
}

/** Contador de caracteres discreto ao lado do rótulo. */
export function RgContagem({ valor = "", maximo }) {
    return (
        <span className={`rg-contagem ${valor.length > maximo * 0.9 ? "rg-contagem--perto" : ""}`} aria-live="polite">
            {valor.length}/{maximo}
        </span>
    );
}

/**
 * Grupo de opções (radio) com as caixas quadradas do template.
 * opcoes: [[valor, rotulo, descricao?]]
 */
export function RgOpcoes({ nome, rotulo, opcoes, valor, aoMudar, erro, ajuda, cartoes = false, inteiro = true }) {
    const idErro = `${nome}-erro`;
    const idAjuda = `${nome}-ajuda`;
    return (
        <fieldset className={`rg-campo rg-grupo ${inteiro ? "rg-inteiro" : ""} ${erro ? "rg-campo--erro" : ""}`} aria-describedby={erro ? idErro : ajuda ? idAjuda : undefined}>
            <legend className="rg-campo__rotulo">{rotulo}</legend>
            <div className={cartoes ? "rg-cartoes" : "rg-opcoes"}>
                {opcoes.map(([v, r, descricao]) => (
                    <label key={v} className={cartoes ? "rg-cartao-opcao" : "sq-caixa"}>
                        <input type="radio" name={nome} value={v} checked={valor === v} onChange={() => aoMudar(v)} aria-invalid={erro ? true : undefined} />
                        {cartoes ? (
                            <>
                                <span className="rg-cartao-opcao__topo">
                                    <strong>{r}</strong>
                                    <span className="sq-caixa__quadro" aria-hidden="true">{valor === v && <Check size={12} strokeWidth={3} />}</span>
                                </span>
                                {descricao && <span className="rg-cartao-opcao__texto">{descricao}</span>}
                            </>
                        ) : (
                            <>
                                <span className="sq-caixa__quadro" aria-hidden="true">{valor === v && <Check size={12} strokeWidth={3} />}</span>
                                {r}
                            </>
                        )}
                    </label>
                ))}
            </div>
            {ajuda && !erro && <span id={idAjuda} className="rg-campo__ajuda">{ajuda}</span>}
            {erro && <span id={idErro} className="rg-campo__erro" role="alert">{erro}</span>}
        </fieldset>
    );
}

/** Rodapé do formulário: botão contornado de 2 px (voltar) e preto preenchido (enviar). */
export function RgAcoes({ aoCancelar, rotuloCancelar = "CANCELAR", enviando, rotulo, rotuloEnviando, nota, desabilitado = false, sucesso = false }) {
    return (
        <div className="rg-acoes" data-revelar>
            <p className="rg-acoes__nota">{nota}</p>
            <div className="rg-acoes__botoes">
                {aoCancelar && (
                    <button type="button" className="sq-botao rg-contorno" onClick={aoCancelar}>{rotuloCancelar}</button>
                )}
                <button type="submit" className={`sq-botao sq-botao--preto rg-enviar ${sucesso ? "rg-enviar--ok" : ""}`} disabled={enviando || desabilitado || sucesso} aria-busy={enviando || undefined}>
                    {sucesso ? <><Check size={18} aria-hidden="true" /> ENVIADO</> : enviando ? rotuloEnviando : rotulo}
                </button>
            </div>
        </div>
    );
}

/** Estado de sucesso: faixa preta da Section 04 com o resultado do envio. */
export function RgSucesso({ titulo, children, acao }) {
    return (
        <div className="rg-sucesso" role="status" aria-live="polite">
            <span className="rg-sucesso__icone" aria-hidden="true"><CheckCircle2 size={28} /></span>
            <div>
                <strong>{titulo}</strong>
                {children && <p>{children}</p>}
            </div>
            {acao}
        </div>
    );
}

/** Mensagem geral de erro (falha de rede, 403 etc.) no estilo do template. */
export function RgErro({ children }) {
    if (!children) return null;
    return <div className="rg-erro-geral" role="alert">{children}</div>;
}

/** Ao receber 422, rola até o primeiro campo com erro e dá foco nele. */
export function focarPrimeiroErro(erros) {
    const primeiro = Object.keys(erros)[0];
    if (!primeiro) return;
    requestAnimationFrame(() => {
        const el = document.getElementById(primeiro) ?? document.querySelector(`[name="${primeiro}"]`);
        if (!el) return;
        const semMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: semMovimento ? "auto" : "smooth", block: "center" });
        el.focus({ preventScroll: true });
    });
}
