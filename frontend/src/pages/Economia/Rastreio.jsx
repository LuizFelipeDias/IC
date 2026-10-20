import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Download, FlaskConical, QrCode as IconeQr } from "lucide-react";
import QrCode from "../../components/QrCode";
import { Aviso, Carregando, Chip } from "../../components/ui";
import { baixarAnexo, api } from "../../services/api";
import { EVENTOS_LOTE, formatarData, formatarPeso, STATUS_LOTE, TIPOS_DOACAO } from "../../utils/formatar";
import "../../styles/pages/economia.css";

function BuscaCodigo({ inicial = "" }) {
    const navigate = useNavigate();
    const [codigo, setCodigo] = useState(inicial);
    return (
        <form className="busca-codigo" onSubmit={(e) => { e.preventDefault(); codigo.trim() && navigate(`/rastreio/${codigo.trim().toUpperCase()}`); }}>
            <label htmlFor="codigo-lote" className="sr-only">Código do lote</label>
            <input id="codigo-lote" className="entrada" placeholder="Código impresso no carretel (26 caracteres)" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            <button type="submit" className="botao">Rastrear <ArrowRight size={16} aria-hidden="true" /></button>
        </form>
    );
}

/**
 * Página pública aberta pelo QR Code do carretel: origem, produção e laudo, sem dados pessoais.
 */
export default function Rastreio() {
    const { codigo } = useParams();
    const [lote, setLote] = useState(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        if (!codigo) return;
        setLote(null);
        setErro("");
        api(`/rastreio/${codigo}`, { auth: false }).then(setLote).catch((e) => setErro(e.status === 404 ? "Nenhum lote encontrado com esse código." : e.message));
    }, [codigo]);

    if (!codigo) {
        return (
            <section className="passaporte">
                <div className="container">
                    <span className="sobrelinha">Rastreabilidade</span>
                    <h1>De onde veio este filamento?</h1>
                    <p style={{ maxWidth: "56ch", marginTop: "var(--esp-4)", color: "#c9c8d6" }}>
                        Aponte a câmera para o QR Code do carretel ou digite o código impresso na etiqueta para ver a origem do
                        material, as etapas de produção e o laudo de qualidade.
                    </p>
                    <BuscaCodigo />
                    <p style={{ marginTop: "var(--esp-4)", fontSize: "var(--texto-sm)", color: "#a9a7bb" }}>
                        Exemplo: <Link to="/rastreio/01JECHB3DDEMNTE00000000001" style={{ color: "#fff", textDecoration: "underline" }}>01JECHB3DDEMNTE00000000001</Link>
                    </p>
                </div>
            </section>
        );
    }

    if (erro) {
        return (
            <div className="container" style={{ paddingTop: "var(--esp-12)" }}>
                <Aviso tom="perigo">{erro}</Aviso>
                <BuscaCodigo inicial={codigo} />
            </div>
        );
    }
    if (!lote) return <Carregando texto="Consultando o lote..." />;

    const status = STATUS_LOTE[lote.status];
    const laudo = lote.laudos[0];

    return (
        <>
            <section className="passaporte">
                <div className="container passaporte__grade">
                    <div>
                        <span className="sobrelinha"><IconeQr size={12} aria-hidden="true" style={{ display: "inline", verticalAlign: "-1px" }} /> Passaporte do filamento</span>
                        <h1>{lote.polimero.sigla} reciclado · {lote.diametro_nominal_mm.toLocaleString("pt-BR")} mm{lote.cor && ` · ${lote.cor}`}</h1>
                        <p className="passaporte__codigo">Lote {lote.codigo}</p>
                        <div className="linha" style={{ marginTop: "var(--esp-5)" }}>
                            <Chip tom={status?.tom} ponto>{status?.rotulo}</Chip>
                            <span style={{ color: "#c9c8d6", fontSize: "var(--texto-sm)" }}>Produzido por {lote.laboratorio.nome} em {formatarData(lote.produzido_em)}</span>
                        </div>
                    </div>
                    <QrCode codigo={lote.codigo} />
                </div>
            </section>

            <div className="container">
                <div className="numeros-lote">
                    {[
                        [formatarPeso(lote.origem.peso_reciclado_g), "de plástico desviado do aterro"],
                        [lote.origem.doacoes, "doação(ões) de origem"],
                        [formatarPeso(lote.peso_saida_g), "de filamento produzido"],
                        [lote.origem.cidades.join(", ") || "—", "cidade(s) de origem"],
                    ].map(([valor, rotulo]) => (
                        <div className="cartao estatistica" key={rotulo}>
                            <span className="estatistica__valor" style={{ fontSize: "var(--texto-2xl)" }}>{valor}</span>
                            <span className="estatistica__rotulo">{rotulo}</span>
                        </div>
                    ))}
                </div>

                <div className="dupla">
                    <section className="cartao cartao--padding" aria-labelledby="titulo-linha">
                        <h2 id="titulo-linha" style={{ marginBottom: "var(--esp-6)", fontSize: "var(--texto-xl)" }}>Linha do tempo</h2>
                        <ol className="linha-tempo">
                            {lote.eventos.map((evento, i) => (
                                <li className="linha-tempo__item" key={i}>
                                    <strong>{EVENTOS_LOTE[evento.tipo] ?? evento.tipo}</strong>
                                    <div className="texto-suave" style={{ fontSize: "var(--texto-sm)" }}>{evento.descricao}</div>
                                    <div className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>{formatarData(evento.ocorrido_em)}</div>
                                </li>
                            ))}
                        </ol>
                        <p className="texto-suave" style={{ marginTop: "var(--esp-6)", fontSize: "var(--texto-sm)" }}>
                            Origem: {Object.entries(lote.origem.por_tipo).map(([tipo, n]) => `${n} × ${TIPOS_DOACAO[tipo]?.toLowerCase()}`).join(", ") || "—"}.
                            Os doadores não são identificados nesta página.
                        </p>
                    </section>

                    <section className="cartao cartao--padding laudo" aria-labelledby="titulo-laudo">
                        <div className="linha linha--entre">
                            <h2 id="titulo-laudo" style={{ fontSize: "var(--texto-xl)" }}><FlaskConical size={18} aria-hidden="true" style={{ display: "inline", verticalAlign: "-2px" }} /> Laudo de qualidade</h2>
                            {laudo && <Chip tom={laudo.resultado === "reprovado" ? "perigo" : "sucesso"} ponto>{laudo.resultado.replace("_", " ")}</Chip>}
                        </div>
                        {!laudo && <p className="texto-suave" style={{ marginTop: "var(--esp-4)" }}>O laudo deste lote ainda não foi emitido.</p>}
                        {laudo && (
                            <>
                                <dl>
                                    <div><dt>Diâmetro médio</dt><dd>{laudo.diametro_medio_mm.toLocaleString("pt-BR")} mm</dd></div>
                                    <div><dt>Tolerância</dt><dd>± {laudo.tolerancia_mm.toLocaleString("pt-BR")} mm</dd></div>
                                    <div><dt>Resistência à tração</dt><dd>{laudo.resistencia_tracao_mpa?.toLocaleString("pt-BR") ?? "—"} MPa</dd></div>
                                    <div><dt>Temperatura de impressão</dt><dd>{laudo.temp_impressao?.[0] ?? "—"}–{laudo.temp_impressao?.[1] ?? "—"} °C</dd></div>
                                </dl>
                                <p className="texto-suave" style={{ fontSize: "var(--texto-sm)" }}>Emitido por {laudo.laboratorio} em {formatarData(laudo.emitido_em)}.</p>
                                {laudo.id_anexo && (
                                    <button type="button" className="botao botao--secundario botao--bloco" style={{ marginTop: "var(--esp-5)" }} onClick={() => baixarAnexo(laudo.id_anexo)}>
                                        <Download size={16} aria-hidden="true" /> Baixar laudo em PDF
                                    </button>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
