import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Flame, Gift, Inbox, MapPin, Package, Recycle, Search, Truck, X } from "lucide-react";
import Carrossel from "../../components/Carrossel";
import { Chip, Dialogo, Vazio } from "../../components/ui";
import { OpcaoCaixa, OpcaoSeta, RgCampo, RgErro, RgOpcoes } from "../../components/Squarespace";
import { useAuth } from "../../contexts/AuthContext";
import { api, lista, query } from "../../services/api";
import { formatarDataHora, formatarPeso, STATUS_COLETA, tempoRelativo, TIPOS_DOACAO } from "../../utils/formatar";
import "../../styles/pages/economia.css";
import "../../styles/pages/chamados.css";
import "../../styles/pages/registro.css";

/* ==================================================================
 * Doações de peças e filamento — listagem no visual "Browse templates"
 * (Website Templates — Squarespace), igual ao painel de chamados:
 * Section 01 (título + texto + colunas de filtro), carrossel de polímeros,
 * Section 02 (resultados sublinhados), grade de cartões de template e
 * Section 04 (faixa preta com botão branco).
 * ================================================================== */

const SITUACOES = {
    disponivel: { rotulo: "Disponível", tom: "sucesso" },
    reservada: { rotulo: "Reservada", tom: "alerta" },
    coletada: { rotulo: "Coletada", tom: "info" },
    cancelada: { rotulo: "Cancelada", tom: "neutro" },
};

function CartaoDoacao({ doacao, acao, indice, mostrarSituacao }) {
    const foto = doacao.fotos?.[0]?.url;
    const situacao = SITUACOES[doacao.status];
    return (
        <article className="dc-cartao" data-revelar style={{ "--atraso": `${(indice % 3) * 90}ms` }}>
            <div className="dc-cartao__capa zoom-imagem">
                {foto ? <img src={foto} alt="" loading="lazy" /> : (
                    <span className="dc-cartao__sigla" aria-hidden="true">
                        <Package size={28} strokeWidth={1.4} />
                        {doacao.polimero?.sigla}
                    </span>
                )}
                <span className="dc-cartao__peso">{formatarPeso(doacao.peso_estimado_g)}</span>
                {mostrarSituacao && situacao && (
                    <span className="dc-cartao__situacao"><Chip tom={situacao.tom} ponto>{situacao.rotulo}</Chip></span>
                )}
            </div>
            <div className="sq-legenda dc-cartao__legenda">
                <h3>{doacao.titulo}</h3>
                <span className="sq-legenda__icone" title={TIPOS_DOACAO[doacao.tipo]}><Recycle size={20} aria-hidden="true" /></span>
            </div>
            <dl className="dc-cartao__ficha">
                <div><dt>POLÍMERO</dt><dd>{doacao.polimero?.sigla ?? "—"}</dd></div>
                <div><dt>TIPO</dt><dd>{TIPOS_DOACAO[doacao.tipo]}</dd></div>
                <div><dt>LOCAL</dt><dd><MapPin size={12} aria-hidden="true" /> {[doacao.cidade, doacao.uf].filter(Boolean).join(" / ") || "—"}</dd></div>
                <div><dt>DOADOR</dt><dd>{doacao.doador?.nome ?? "Você"} · {tempoRelativo(doacao.created_at)}</dd></div>
            </dl>
            {acao && <div className="dc-cartao__acao">{acao}</div>}
        </article>
    );
}

function SolicitarColeta({ doacao, aberto, aoFechar, aoSolicitar }) {
    const [modalidade, setModalidade] = useState("coleta");
    const [data, setData] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErro("");
        try {
            await api(`/doacao/${doacao.id}/coletas`, { method: "POST", body: { modalidade, agendado_para: data || null, observacoes: observacoes || null } });
            aoSolicitar();
        } catch (e) {
            setErro(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Solicitar coleta">
            <form className="sq rg dc-dialogo" onSubmit={enviar} noValidate>
                <div className="dc-dialogo__topo">
                    <p className="sq-rotulo">SOLICITAR MATERIAL</p>
                    <button type="button" className="rg-remover" aria-label="Fechar" onClick={aoFechar}><X size={16} aria-hidden="true" /></button>
                </div>
                <h2>{doacao.titulo}</h2>
                <p className="dc-dialogo__resumo">{doacao.polimero?.sigla} · {TIPOS_DOACAO[doacao.tipo]} · {formatarPeso(doacao.peso_estimado_g)} · {[doacao.cidade, doacao.uf].filter(Boolean).join(" / ") || "—"}</p>
                <RgErro>{erro}</RgErro>
                <RgOpcoes nome="modalidade" rotulo="Modalidade" opcoes={[["coleta", "O laboratório busca"], ["entrega", "O doador entrega"]]} valor={modalidade} aoMudar={setModalidade} />
                <RgCampo id="data-coleta" rotulo="Data sugerida (opcional)">
                    <input type="datetime-local" className="rg-entrada" value={data} onChange={(e) => setData(e.target.value)} />
                </RgCampo>
                <RgCampo id="obs-coleta" rotulo="Observações">
                    <textarea className="rg-entrada" style={{ minHeight: 120 }} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
                </RgCampo>
                <div className="rg-acoes__botoes">
                    <button type="button" className="sq-botao rg-contorno" onClick={aoFechar}>CANCELAR</button>
                    <button type="submit" className="sq-botao sq-botao--preto rg-enviar" disabled={enviando}>
                        <Truck size={16} aria-hidden="true" /> {enviando ? "ENVIANDO..." : "ENVIAR SOLICITAÇÃO"}
                    </button>
                </div>
            </form>
        </Dialogo>
    );
}

function ListaColetas({ papel }) {
    const [coletas, setColetas] = useState(null);
    const [pesos, setPesos] = useState({});
    const [datas, setDatas] = useState({});
    const [erro, setErro] = useState("");

    const carregar = useCallback(() => api(`/coleta${query({ papel, per_page: 100 })}`).then((r) => setColetas(lista(r))).catch((e) => { setErro(e.message); setColetas([]); }), [papel]);
    useEffect(() => {
        carregar();
    }, [carregar]);

    const acao = async (coleta, nome, corpo) => {
        setErro("");
        try {
            const atualizada = await api(`/coleta/${coleta.id}/${nome}`, { method: "POST", body: corpo });
            setColetas((atual) => atual.map((c) => (c.id === coleta.id ? atualizada : c)));
        } catch (e) {
            setErro(e.message);
        }
    };

    if (coletas === null) {
        return (
            <ul className="sq-cartao sq-lista" aria-busy="true" aria-label="Carregando coletas">
                {[0, 1, 2].map((i) => (
                    <li key={i} className="sq-esqueleto-linha">
                        <span className="esqueleto sq-esqueleto-linha__marca" />
                        <span className="sq-esqueleto-linha__texto"><span className="esqueleto" style={{ width: "60%" }} /><span className="esqueleto" style={{ width: "40%" }} /></span>
                    </li>
                ))}
            </ul>
        );
    }
    if (coletas.length === 0) {
        return <Vazio icone={Truck} titulo={papel === "doador" ? "Nenhum laboratório pediu suas doações ainda" : "Você ainda não solicitou coletas"} />;
    }

    return (
        <div className="sq-cartao dc-coletas" data-revelar>
            {erro && <div style={{ padding: 20 }}><RgErro>{erro}</RgErro></div>}
            {coletas.map((coleta, i) => {
                const status = STATUS_COLETA[coleta.status];
                const ativa = ["pendente", "aceita", "agendada"].includes(coleta.status);
                const contato = coleta.contato?.[papel === "doador" ? "laboratorio" : "doador"];
                return (
                    <div className={`coleta coleta--${coleta.status} dc-coleta`} key={coleta.id} style={{ "--atraso": `${i * 70}ms` }}>
                        <span className="sq-linha-item__marca" aria-hidden="true">{coleta.doacao?.polimero?.sigla?.slice(0, 3) ?? <Truck size={18} />}</span>
                        <div className="dc-coleta__texto">
                            <div className="sq-linha">
                                <Chip tom={status.tom} ponto>{status.rotulo}</Chip>
                                <span className="sq-rotulo">{coleta.modalidade === "coleta" ? "LABORATÓRIO BUSCA" : "DOADOR ENTREGA"}</span>
                            </div>
                            <strong>{coleta.doacao?.titulo}</strong>
                            <span>
                                {papel === "doador" ? `Solicitado por ${coleta.laboratorio?.nome}` : `Doador: ${coleta.doacao?.doador?.nome}`}
                                {coleta.agendado_para && ` · agendado para ${formatarDataHora(coleta.agendado_para)}`}
                                {coleta.peso_recebido_g && ` · recebido ${formatarPeso(coleta.peso_recebido_g)}`}
                            </span>
                            {contato && <span>Contato: {contato.email} · {contato.telefone}</span>}
                            {coleta.observacoes && <span className="dc-coleta__obs">“{coleta.observacoes}”</span>}
                        </div>
                        <div className="coleta__acoes dc-coleta__acoes">
                            {papel === "doador" && coleta.status === "pendente" && (
                                <>
                                    <label className="sr-only" htmlFor={`data-${coleta.id}`}>Data da coleta</label>
                                    <input id={`data-${coleta.id}`} type="datetime-local" className="rg-entrada dc-entrada" value={datas[coleta.id] ?? ""} onChange={(e) => setDatas({ ...datas, [coleta.id]: e.target.value })} />
                                    <button type="button" className="sq-botao sq-botao--preto dc-botao" onClick={() => acao(coleta, "aceitar", { agendado_para: datas[coleta.id] || null })}>ACEITAR</button>
                                    <button type="button" className="sq-botao sq-botao--perigo dc-botao" onClick={() => acao(coleta, "recusar", {})}>RECUSAR</button>
                                </>
                            )}
                            {papel === "doador" && coleta.status === "aceita" && (
                                <>
                                    <label className="sr-only" htmlFor={`agenda-${coleta.id}`}>Agendar coleta</label>
                                    <input id={`agenda-${coleta.id}`} type="datetime-local" className="rg-entrada dc-entrada" value={datas[coleta.id] ?? ""} onChange={(e) => setDatas({ ...datas, [coleta.id]: e.target.value })} />
                                    <button type="button" className="sq-botao dc-botao rg-contorno" disabled={!datas[coleta.id]} onClick={() => acao(coleta, "agendar", { agendado_para: datas[coleta.id] })}>AGENDAR</button>
                                </>
                            )}
                            {papel === "laboratorio" && ["aceita", "agendada"].includes(coleta.status) && (
                                <>
                                    <label className="sr-only" htmlFor={`peso-${coleta.id}`}>Peso recebido em gramas</label>
                                    <input id={`peso-${coleta.id}`} type="number" min="1" className="rg-entrada dc-entrada dc-entrada--peso" placeholder="Peso (g)" value={pesos[coleta.id] ?? ""} onChange={(e) => setPesos({ ...pesos, [coleta.id]: e.target.value })} />
                                    <button type="button" className="sq-botao sq-botao--preto dc-botao" disabled={!pesos[coleta.id]} onClick={() => acao(coleta, "concluir", { peso_recebido_g: Number(pesos[coleta.id]) })}>CONCLUIR (+30 PTS)</button>
                                </>
                            )}
                            {ativa && <button type="button" className="sq-botao dc-botao" onClick={() => acao(coleta, "cancelar")}>CANCELAR</button>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Doacoes() {
    const { pode } = useAuth();
    const [aba, setAba] = useState("mural");
    const [doacoes, setDoacoes] = useState(null);
    const [polimeros, setPolimeros] = useState([]);
    const [polimero, setPolimero] = useState("");
    const [situacao, setSituacao] = useState("disponivel");
    const [tipos, setTipos] = useState([]);
    const [busca, setBusca] = useState("");
    const [solicitando, setSolicitando] = useState(null);
    // Mantém a última doação para o diálogo animar a saída depois de fechado.
    const [alvo, setAlvo] = useState(null);
    const [aviso, setAviso] = useState("");
    const receptor = pode("receptor");

    useEffect(() => {
        api("/polimeros").then((r) => setPolimeros(r.data)).catch(() => setPolimeros([]));
    }, []);

    // O mural filtra polímero e situação na API; "minhas doações" traz todas e filtra aqui.
    useEffect(() => {
        if (aba !== "mural" && aba !== "minhas") return;
        setDoacoes(null);
        const caminho = aba === "minhas" ? "/doacao/minhas?per_page=100" : `/doacao${query({ id_polimero: polimero, status: situacao, per_page: 100 })}`;
        api(caminho).then((r) => setDoacoes(lista(r))).catch(() => setDoacoes([]));
    }, [aba, polimero, situacao]);

    const trocarAba = (valor) => {
        setAba(valor);
        setSituacao(valor === "mural" ? "disponivel" : "");
    };

    const ehListaDoacoes = aba === "mural" || aba === "minhas";
    const termo = busca.trim().toLowerCase();
    const filtradas = useMemo(
        () =>
            (doacoes ?? [])
                .filter((d) => aba === "mural" || !polimero || d.polimero?.id === polimero)
                .filter((d) => aba === "mural" || !situacao || d.status === situacao)
                .filter((d) => !termo || `${d.titulo} ${d.cidade ?? ""} ${d.doador?.nome ?? ""}`.toLowerCase().includes(termo)),
        [doacoes, aba, polimero, situacao, termo],
    );
    const visiveis = filtradas.filter((d) => !tipos.length || tipos.includes(d.tipo));
    const contagemTipo = (t) => filtradas.filter((d) => d.tipo === t).length;
    const pesoTotal = visiveis.reduce((soma, d) => soma + (d.peso_estimado_g ?? 0), 0);
    const alternarTipo = (t) => setTipos((atual) => (atual.includes(t) ? atual.filter((x) => x !== t) : [...atual, t]));

    const abas = [["mural", "Mural de doações"], ["minhas", "Minhas doações"], ["pedidos", "Pedidos nas minhas doações"], ...(receptor ? [["coletas", "Minhas coletas"]] : [])];
    const situacoes = aba === "mural" ? ["disponivel", "reservada", "coletada"] : Object.keys(SITUACOES);

    return (
        <div className="sq dc">
            {/* Section 01 — título + texto e colunas de filtro */}
            <section className="sq-secao sq-topo">
                <div className="sq-topo__titulo" data-revelar>
                    <h1>Doações de peças e filamento.</h1>
                    <p>
                        Sobras, carretéis e peças com falha viram filamento novo. Registre o que você tem separado por polímero;
                        {receptor ? " como laboratório verificado, você solicita a coleta e o doador combina a data." : " laboratórios verificados solicitam a coleta e você aceita e combina a data."}
                    </p>
                </div>

                <div className="sq-filtros" data-revelar style={{ "--atraso": "120ms" }}>
                    <div className="sq-filtros__coluna" role="radiogroup" aria-label="Visão">
                        <p className="sq-rotulo">VISÃO</p>
                        {abas.map(([valor, rotulo]) => (
                            <OpcaoSeta key={valor} marcada={aba === valor} aoMarcar={() => trocarAba(valor)}>{rotulo}</OpcaoSeta>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna" role="group" aria-label="Tipo de resíduo">
                        <p className="sq-rotulo">TIPO</p>
                        <OpcaoCaixa papel="checkbox" marcada={tipos.length === 0} aoMarcar={() => setTipos([])}>Todos os tipos</OpcaoCaixa>
                        {Object.entries(TIPOS_DOACAO).map(([valor, rotulo]) => (
                            <OpcaoCaixa key={valor} papel="checkbox" marcada={tipos.includes(valor)} aoMarcar={() => alternarTipo(valor)}>{rotulo}</OpcaoCaixa>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna" role="radiogroup" aria-label="Polímero">
                        <p className="sq-rotulo">POLÍMERO</p>
                        <OpcaoSeta marcada={polimero === ""} aoMarcar={() => setPolimero("")}>Todos os polímeros</OpcaoSeta>
                        {polimeros.map((p) => (
                            <OpcaoSeta key={p.id} marcada={polimero === p.id} aoMarcar={() => setPolimero(p.id)}>{p.sigla}</OpcaoSeta>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna" role="radiogroup" aria-label="Situação">
                        <p className="sq-rotulo">SITUAÇÃO</p>
                        {aba !== "mural" && <OpcaoCaixa marcada={situacao === ""} aoMarcar={() => setSituacao("")}>Todas</OpcaoCaixa>}
                        {situacoes.map((s) => (
                            <OpcaoCaixa key={s} marcada={situacao === s} aoMarcar={() => setSituacao(s)}>{SITUACOES[s].rotulo}</OpcaoCaixa>
                        ))}
                        <label className="sq-rotulo dc-busca-rotulo" htmlFor="busca-doacoes">BUSCAR</label>
                        <span className="sq-busca">
                            <Search size={14} aria-hidden="true" />
                            <input id="busca-doacoes" placeholder="Título, cidade ou doador" value={busca} onChange={(e) => setBusca(e.target.value)} />
                        </span>
                    </div>
                    <div className="sq-filtros__acoes">
                        <p className="sq-rotulo">{ehListaDoacoes && doacoes ? `${formatarPeso(pesoTotal).toUpperCase()} NA LISTA` : "ECONOMIA CIRCULAR"}</p>
                        <Link to="/doacoes/nova" className="sq-botao">REGISTRAR DOAÇÃO</Link>
                    </div>
                </div>
            </section>

            {/* Polímeros aceitos: carrossel (também filtra o mural) */}
            {polimeros.length > 0 && (
                <section className="sq-secao dc-polimeros" aria-label="Polímeros aceitos" data-revelar>
                    <div className="dc-polimeros__topo">
                        <p className="sq-rotulo">POLÍMEROS QUE VIRAM FILAMENTO NOVO</p>
                        <span className="dc-polimeros__dica">Toque para filtrar o mural</span>
                    </div>
                    <Carrossel rotulo="Polímeros aceitos" automatico={5000} classe="carrossel-polimeros">
                        {polimeros.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                className="polimero-cartao"
                                aria-pressed={aba === "mural" && polimero === p.id}
                                onClick={() => {
                                    if (aba !== "mural") trocarAba("mural");
                                    setPolimero((atual) => (atual === p.id ? "" : p.id));
                                }}
                            >
                                <span className="polimero-cartao__sigla">{p.sigla}</span>
                                <span className="polimero-cartao__nome">{p.nome}</span>
                                <span className="polimero-cartao__dados">
                                    {p.temp_extrusao_min && <span><Flame size={13} aria-hidden="true" /> {p.temp_extrusao_min}–{p.temp_extrusao_max} °C</span>}
                                    {p.reciclavel && <span><Recycle size={13} aria-hidden="true" /> reciclável</span>}
                                </span>
                            </button>
                        ))}
                    </Carrossel>
                </section>
            )}

            {/* Section 02 — linha de resultados */}
            <section className="sq-secao sq-resultados dc-resultados" data-revelar="fade">
                {ehListaDoacoes ? (
                    <p>
                        <strong>{doacoes ? visiveis.length : "—"} {visiveis.length === 1 ? "doação encontrada" : "doações encontradas"}</strong>
                        {Object.entries(TIPOS_DOACAO).map(([valor, rotulo], i) => (
                            <React.Fragment key={valor}>
                                {i > 0 && ", "}
                                <button type="button" className="sq-link" aria-pressed={tipos.includes(valor)} onClick={() => alternarTipo(valor)}>
                                    {rotulo} ({contagemTipo(valor)})
                                </button>
                            </React.Fragment>
                        ))}
                    </p>
                ) : (
                    <p>
                        <strong>{aba === "pedidos" ? "Pedidos de coleta nas suas doações" : "Coletas solicitadas pelo seu laboratório"}</strong>
                        <button type="button" className="sq-link" onClick={() => trocarAba("mural")}>Voltar ao mural</button>
                    </p>
                )}
            </section>

            <div className="sq-secao dc-conteudo">
                {aviso && (
                    <div className="rg-sucesso dc-aviso" role="status">
                        <span className="rg-sucesso__icone" aria-hidden="true"><Truck size={24} /></span>
                        <div><strong>Solicitação enviada.</strong><p>{aviso}</p></div>
                        <button type="button" className="sq-botao sq-botao--branco" onClick={() => setAviso("")}>OK</button>
                    </div>
                )}

                <div key={aba} className="troca-suave">
                    {ehListaDoacoes && (
                        <>
                            {doacoes === null && (
                                <div className="dc-grade" aria-busy="true" aria-label="Carregando doações">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="dc-cartao dc-cartao--esqueleto">
                                            <span className="esqueleto dc-cartao__capa" />
                                            <span className="esqueleto" style={{ height: 14, width: "70%" }} />
                                            <span className="esqueleto" style={{ height: 12, width: "45%" }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {doacoes !== null && visiveis.length === 0 && (
                                <Vazio
                                    icone={doacoes.length ? Inbox : Gift}
                                    titulo={doacoes.length ? "Nenhuma doação com esses filtros" : aba === "minhas" ? "Você ainda não doou" : "Nenhuma doação disponível"}
                                    acao={<Link to="/doacoes/nova" className="sq-botao sq-botao--preto dc-botao-vazio">REGISTRAR DOAÇÃO</Link>}
                                />
                            )}
                            {visiveis.length > 0 && (
                                <div className="dc-grade">
                                    {visiveis.map((doacao, i) => (
                                        <CartaoDoacao
                                            key={doacao.id}
                                            doacao={doacao}
                                            indice={i}
                                            mostrarSituacao={aba === "minhas" || situacao !== "disponivel"}
                                            acao={
                                                aba === "mural" && receptor && doacao.status === "disponivel" ? (
                                                    <button type="button" className="sq-botao sq-botao--preto" onClick={() => { setAlvo(doacao); setSolicitando(doacao); }}>
                                                        <Truck size={16} aria-hidden="true" /> SOLICITAR COLETA
                                                    </button>
                                                ) : null
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {aba === "pedidos" && <ListaColetas papel="doador" />}
                    {aba === "coletas" && <ListaColetas papel="laboratorio" />}
                </div>
            </div>

            {/* Section 04 — faixa preta com botão branco + passos */}
            <section className="sq-secao sq-faixa">
                <div className="sq-faixa__preta" data-revelar="esquerda">
                    <div>
                        <h2>Tem sobras de impressão paradas?</h2>
                        <p>Registre a doação em menos de um minuto. Separar por polímero permite que o laboratório transforme o material em filamento novo, com laudo e QR Code de rastreio.</p>
                    </div>
                    <Link to="/doacoes/nova" className="sq-botao sq-botao--branco">REGISTRAR DOAÇÃO <ArrowUpRight size={16} aria-hidden="true" style={{ marginLeft: 8 }} /></Link>
                </div>
                <ol className="sq-faixa__passos" data-revelar="direita" style={{ "--atraso": "120ms" }}>
                    {[
                        ["01", "Registrar", "O maker informa polímero, tipo, peso e fotos do material."],
                        ["02", "Solicitar", "Um laboratório verificado pede a coleta; você aceita e combina a data."],
                        ["03", "Reciclar", "O material vira filamento com laudo e cada coleta concluída rende pontos."],
                    ].map(([n, titulo, texto], i) => (
                        <li key={n} style={{ "--i": i }}>
                            <span>{n}</span>
                            <strong>{titulo}</strong>
                            <p>{texto}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {alvo && (
                <SolicitarColeta
                    key={alvo.id}
                    doacao={alvo}
                    aberto={Boolean(solicitando)}
                    aoFechar={() => setSolicitando(null)}
                    aoSolicitar={() => {
                        setDoacoes((atual) => atual.filter((d) => d.id !== alvo.id));
                        setSolicitando(null);
                        setAviso("O doador vai aceitar ou recusar; acompanhe em “Minhas coletas”.");
                    }}
                />
            )}
        </div>
    );
}
