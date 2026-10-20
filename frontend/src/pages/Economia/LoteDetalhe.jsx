import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, FileUp } from "lucide-react";
import QrCode from "../../components/QrCode";
import { Aviso, CabecalhoPagina, Campo, Carregando, Chip, errosPorCampo } from "../../components/ui";
import { api, ApiError, baixarAnexo } from "../../services/api";
import { EVENTOS_LOTE, formatarData, formatarPeso, STATUS_LOTE } from "../../utils/formatar";
import "../../styles/pages/economia.css";

const LAUDO_VAZIO = { resultado: "aprovado", diametro_medio_mm: "", tolerancia_mm: "", resistencia_tracao_mpa: "", temp_impressao_min: "", temp_impressao_max: "", observacoes: "" };

export default function LoteDetalhe() {
    const { id } = useParams();
    const [lote, setLote] = useState(null);
    const [evento, setEvento] = useState({ tipo: "triturado", descricao: "" });
    const [producao, setProducao] = useState({ peso_saida_g: "" });
    const [laudo, setLaudo] = useState(LAUDO_VAZIO);
    const [pdf, setPdf] = useState(null);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState(null);

    const carregar = () => api(`/lote/${id}`).then(setLote);
    useEffect(() => {
        carregar();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!lote) return <Carregando />;

    const executar = async (promessa, sucesso) => {
        setErros({});
        setMensagem(null);
        try {
            await promessa;
            setMensagem({ tom: "sucesso", texto: sucesso });
            carregar();
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) setErros(errosPorCampo(e));
            setMensagem({ tom: "perigo", texto: e.message });
        }
    };

    const emitirLaudo = (evt) => {
        evt.preventDefault();
        const dados = new FormData();
        Object.entries(laudo).forEach(([chave, valor]) => valor !== "" && dados.append(chave, valor));
        if (pdf) dados.append("arquivo", pdf);
        executar(api(`/lote/${id}/laudos`, { method: "POST", body: dados }), "Laudo emitido e publicado na página de rastreio.");
    };

    const status = STATUS_LOTE[lote.status];

    return (
        <div className="container">
            <CabecalhoPagina sobrelinha={`Lote ${lote.codigo}`} titulo={`${lote.polimero?.sigla} · ${lote.diametro_nominal_mm.toLocaleString("pt-BR")} mm`} descricao={`Entrada de ${formatarPeso(lote.peso_entrada_g)} vinda de ${lote.coletas.length} coleta(s).`}>
                <Chip tom={status?.tom} ponto>{status?.rotulo}</Chip>
                <Link to={`/rastreio/${lote.codigo}`} className="botao botao--secundario"><ExternalLink size={16} aria-hidden="true" /> Página pública</Link>
            </CabecalhoPagina>

            {mensagem && <div style={{ marginBottom: "var(--esp-5)" }}><Aviso tom={mensagem.tom}>{mensagem.texto}</Aviso></div>}

            <div className="dupla" style={{ marginTop: 0 }}>
                <div className="pilha" style={{ gap: "var(--esp-6)" }}>
                    <section className="cartao cartao--padding">
                        <h2 style={{ fontSize: "var(--texto-xl)", marginBottom: "var(--esp-6)" }}>Linha do tempo</h2>
                        <ol className="linha-tempo">
                            {lote.eventos.map((e) => (
                                <li className="linha-tempo__item" key={e.id}>
                                    <strong>{EVENTOS_LOTE[e.tipo]}</strong>
                                    <div className="texto-suave" style={{ fontSize: "var(--texto-sm)" }}>{e.descricao} · {formatarData(e.ocorrido_em)}</div>
                                </li>
                            ))}
                        </ol>
                        <form className="linha" style={{ marginTop: "var(--esp-6)" }} onSubmit={(e) => { e.preventDefault(); executar(api(`/lote/${id}/eventos`, { method: "POST", body: evento }), "Etapa registrada."); }}>
                            <label className="sr-only" htmlFor="tipo-evento">Etapa</label>
                            <select id="tipo-evento" className="entrada" style={{ width: 180 }} value={evento.tipo} onChange={(e) => setEvento({ ...evento, tipo: e.target.value })}>
                                {["triturado", "extrudado", "enviado", "utilizado"].map((t) => <option key={t} value={t}>{EVENTOS_LOTE[t]}</option>)}
                            </select>
                            <label className="sr-only" htmlFor="desc-evento">Descrição</label>
                            <input id="desc-evento" className="entrada" style={{ flex: 1, minWidth: 180 }} placeholder="Ex.: extrusão a 195 °C" value={evento.descricao} onChange={(e) => setEvento({ ...evento, descricao: e.target.value })} />
                            <button type="submit" className="botao botao--escuro">Registrar etapa</button>
                        </form>
                    </section>

                    <section className="cartao cartao--padding">
                        <h2 style={{ fontSize: "var(--texto-xl)", marginBottom: "var(--esp-4)" }}>Produção</h2>
                        <div className="linha">
                            <label className="sr-only" htmlFor="peso-saida">Peso de filamento produzido (g)</label>
                            <input id="peso-saida" type="number" min="1" className="entrada" style={{ width: 220 }} placeholder="Filamento produzido (g)" value={producao.peso_saida_g} onChange={(e) => setProducao({ peso_saida_g: e.target.value })} />
                            <button type="button" className="botao botao--secundario" disabled={!producao.peso_saida_g} onClick={() => executar(api(`/lote/${id}`, { method: "PATCH", body: { peso_saida_g: Number(producao.peso_saida_g), produzido_em: new Date().toISOString() } }), "Produção registrada.")}>Salvar peso</button>
                            {lote.status === "em_processamento" && <button type="button" className="botao botao--secundario" onClick={() => executar(api(`/lote/${id}`, { method: "PATCH", body: { status: "aguardando_laudo" } }), "Lote enviado para laudo.")}>Enviar para laudo</button>}
                            {lote.status === "aprovado" && <button type="button" className="botao botao--eco" onClick={() => executar(api(`/lote/${id}`, { method: "PATCH", body: { status: "distribuido" } }), "Lote marcado como distribuído.")}>Marcar como distribuído</button>}
                        </div>
                        {erros.peso_saida_g && <p className="campo__erro">{erros.peso_saida_g}</p>}
                    </section>
                </div>

                <div className="pilha" style={{ gap: "var(--esp-6)" }}>
                    <section className="cartao cartao--padding linha" style={{ alignItems: "center" }}>
                        <QrCode codigo={lote.codigo} tamanho={128} />
                        <div style={{ flex: 1 }}>
                            <strong>Etiqueta do carretel</strong>
                            <p className="texto-suave" style={{ fontSize: "var(--texto-sm)" }}>Imprima este QR Code na embalagem. Ele leva à página pública com a origem e o laudo.</p>
                        </div>
                    </section>

                    {lote.laudos.map((l) => (
                        <section className="cartao cartao--padding" key={l.id}>
                            <div className="linha linha--entre">
                                <strong>Laudo · {formatarData(l.emitido_em)}</strong>
                                <Chip tom={l.resultado === "reprovado" ? "perigo" : "sucesso"} ponto>{l.resultado.replace("_", " ")}</Chip>
                            </div>
                            <p className="texto-suave" style={{ fontSize: "var(--texto-sm)", marginTop: "var(--esp-2)" }}>Ø {l.diametro_medio_mm.toLocaleString("pt-BR")} mm ± {l.tolerancia_mm.toLocaleString("pt-BR")} · {l.resistencia_tracao_mpa?.toLocaleString("pt-BR") ?? "—"} MPa</p>
                            {l.id_anexo && <button type="button" className="botao botao--secundario botao--pequeno" style={{ marginTop: "var(--esp-3)" }} onClick={() => baixarAnexo(l.id_anexo)}>Baixar PDF</button>}
                        </section>
                    ))}

                    {lote.status !== "distribuido" && (
                        <form className="cartao cartao--padding pilha" onSubmit={emitirLaudo} noValidate>
                            <h2 style={{ fontSize: "var(--texto-xl)" }}>Emitir laudo de qualidade</h2>
                            <div className="formulario-grade">
                                <Campo id="resultado" rotulo="Resultado" erro={erros.resultado}>
                                    <select id="resultado" className="entrada" value={laudo.resultado} onChange={(e) => setLaudo({ ...laudo, resultado: e.target.value })}>
                                        <option value="aprovado">Aprovado</option>
                                        <option value="uso_restrito">Uso restrito</option>
                                        <option value="reprovado">Reprovado</option>
                                    </select>
                                </Campo>
                                {[["diametro_medio_mm", "Diâmetro médio (mm)"], ["tolerancia_mm", "Tolerância (mm)"], ["resistencia_tracao_mpa", "Tração (MPa)"], ["temp_impressao_min", "Temp. mín. (°C)"], ["temp_impressao_max", "Temp. máx. (°C)"]].map(([campo, rotulo]) => (
                                    <Campo key={campo} id={campo} rotulo={rotulo} erro={erros[campo]}>
                                        <input id={campo} type="number" step="any" className="entrada" value={laudo[campo]} onChange={(e) => setLaudo({ ...laudo, [campo]: e.target.value })} aria-invalid={Boolean(erros[campo])} />
                                    </Campo>
                                ))}
                            </div>
                            <label className="area-envio">
                                <FileUp size={24} aria-hidden="true" />
                                <strong>{pdf ? pdf.name : "Anexar laudo em PDF"}</strong>
                                <span>Até 10 MB, sem scripts. O PDF fica público na página de rastreio.</span>
                                <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => setPdf(e.target.files[0] ?? null)} />
                            </label>
                            {erros.arquivo && <span className="campo__erro">{erros.arquivo}</span>}
                            <button type="submit" className="botao" disabled={!pdf}>Emitir laudo</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
