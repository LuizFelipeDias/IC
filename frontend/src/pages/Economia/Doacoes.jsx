import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, MapPin, Package, Plus, Truck } from "lucide-react";
import { Aviso, CabecalhoPagina, Campo, Carregando, Chip, Dialogo, Vazio } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { api, lista, query } from "../../services/api";
import { formatarDataHora, formatarPeso, STATUS_COLETA, tempoRelativo, TIPOS_DOACAO } from "../../utils/formatar";
import "../../styles/pages/economia.css";

function CartaoDoacao({ doacao, acao }) {
    const foto = doacao.fotos?.[0]?.url;
    return (
        <article className="cartao cartao-doacao">
            <div className="cartao-doacao__foto">{foto ? <img src={foto} alt="" loading="lazy" /> : <Package size={48} strokeWidth={1.2} aria-hidden="true" />}</div>
            <div className="cartao-doacao__corpo">
                <div className="linha">
                    <Chip tom="sucesso">{doacao.polimero?.sigla}</Chip>
                    <Chip>{TIPOS_DOACAO[doacao.tipo]}</Chip>
                </div>
                <h3>{doacao.titulo}</h3>
                <span className="cartao-doacao__peso">{formatarPeso(doacao.peso_estimado_g)}</span>
                <div className="cartao-doacao__rodape">
                    <span className="linha linha--compacta"><MapPin size={13} aria-hidden="true" /> {[doacao.cidade, doacao.uf].filter(Boolean).join(" / ") || "—"}</span>
                    <span>{doacao.doador?.nome ?? "Você"} · {tempoRelativo(doacao.created_at)}</span>
                </div>
                {acao}
            </div>
        </article>
    );
}

function SolicitarColeta({ doacao, aoFechar, aoSolicitar }) {
    const [modalidade, setModalidade] = useState("coleta");
    const [data, setData] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [erro, setErro] = useState("");

    const enviar = async () => {
        try {
            await api(`/doacao/${doacao.id}/coletas`, { method: "POST", body: { modalidade, agendado_para: data || null, observacoes: observacoes || null } });
            aoSolicitar();
        } catch (e) {
            setErro(e.message);
        }
    };

    return (
        <Dialogo aberto aoFechar={aoFechar} titulo="Solicitar coleta">
            <div className="pilha">
                <span className="sobrelinha">Solicitar material</span>
                <h2>{doacao.titulo}</h2>
                {erro && <Aviso tom="perigo">{erro}</Aviso>}
                <div className="segmentado" role="radiogroup" aria-label="Modalidade">
                    {[["coleta", "O laboratório busca"], ["entrega", "O doador entrega"]].map(([valor, rotulo]) => (
                        <button key={valor} type="button" role="radio" aria-checked={modalidade === valor} onClick={() => setModalidade(valor)}>{rotulo}</button>
                    ))}
                </div>
                <Campo id="data-coleta" rotulo="Data sugerida (opcional)">
                    <input id="data-coleta" type="datetime-local" className="entrada" value={data} onChange={(e) => setData(e.target.value)} />
                </Campo>
                <Campo id="obs-coleta" rotulo="Observações">
                    <textarea id="obs-coleta" className="entrada" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
                </Campo>
                <div className="linha linha--entre">
                    <button type="button" className="botao botao--secundario" onClick={aoFechar}>Cancelar</button>
                    <button type="button" className="botao botao--eco" onClick={enviar}><Truck size={16} aria-hidden="true" /> Enviar solicitação</button>
                </div>
            </div>
        </Dialogo>
    );
}

function ListaColetas({ papel }) {
    const [coletas, setColetas] = useState(null);
    const [pesos, setPesos] = useState({});
    const [datas, setDatas] = useState({});
    const [erro, setErro] = useState("");

    const carregar = useCallback(() => api(`/coleta${query({ papel, per_page: 100 })}`).then((r) => setColetas(lista(r))), [papel]);
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

    if (coletas === null) return <Carregando />;
    if (coletas.length === 0) {
        return <Vazio icone={Truck} titulo={papel === "doador" ? "Nenhum laboratório pediu suas doações ainda" : "Você ainda não solicitou coletas"} />;
    }

    return (
        <div className="cartao">
            {erro && <div style={{ padding: "var(--esp-4)" }}><Aviso tom="perigo">{erro}</Aviso></div>}
            {coletas.map((coleta) => {
                const status = STATUS_COLETA[coleta.status];
                const ativa = ["pendente", "aceita", "agendada"].includes(coleta.status);
                const contato = coleta.contato?.[papel === "doador" ? "laboratorio" : "doador"];
                return (
                    <div className="coleta" key={coleta.id}>
                        <div className="pilha" style={{ gap: "var(--esp-2)" }}>
                            <div className="linha">
                                <Chip tom={status.tom} ponto>{status.rotulo}</Chip>
                                <Chip>{coleta.modalidade === "coleta" ? "Laboratório busca" : "Doador entrega"}</Chip>
                            </div>
                            <strong>{coleta.doacao?.titulo}</strong>
                            <span className="texto-suave" style={{ fontSize: "var(--texto-sm)" }}>
                                {papel === "doador" ? `Solicitado por ${coleta.laboratorio?.nome}` : `Doador: ${coleta.doacao?.doador?.nome}`}
                                {coleta.agendado_para && ` · agendado para ${formatarDataHora(coleta.agendado_para)}`}
                                {coleta.peso_recebido_g && ` · recebido ${formatarPeso(coleta.peso_recebido_g)}`}
                            </span>
                            {contato && <span style={{ fontSize: "var(--texto-sm)" }}>Contato: {contato.email} · {contato.telefone}</span>}
                            {coleta.observacoes && <span className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>“{coleta.observacoes}”</span>}
                        </div>
                        <div className="coleta__acoes">
                            {papel === "doador" && coleta.status === "pendente" && (
                                <>
                                    <label className="sr-only" htmlFor={`data-${coleta.id}`}>Data</label>
                                    <input id={`data-${coleta.id}`} type="datetime-local" className="entrada" style={{ width: 210 }} value={datas[coleta.id] ?? ""} onChange={(e) => setDatas({ ...datas, [coleta.id]: e.target.value })} />
                                    <button type="button" className="botao botao--eco botao--pequeno" onClick={() => acao(coleta, "aceitar", { agendado_para: datas[coleta.id] || null })}>Aceitar</button>
                                    <button type="button" className="botao botao--perigo botao--pequeno" onClick={() => acao(coleta, "recusar", {})}>Recusar</button>
                                </>
                            )}
                            {papel === "laboratorio" && ["aceita", "agendada"].includes(coleta.status) && (
                                <>
                                    <label className="sr-only" htmlFor={`peso-${coleta.id}`}>Peso recebido em gramas</label>
                                    <input id={`peso-${coleta.id}`} type="number" min="1" className="entrada" style={{ width: 150 }} placeholder="Peso (g)" value={pesos[coleta.id] ?? ""} onChange={(e) => setPesos({ ...pesos, [coleta.id]: e.target.value })} />
                                    <button type="button" className="botao botao--eco botao--pequeno" disabled={!pesos[coleta.id]} onClick={() => acao(coleta, "concluir", { peso_recebido_g: Number(pesos[coleta.id]) })}>Concluir (+30 pts)</button>
                                </>
                            )}
                            {ativa && <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => acao(coleta, "cancelar")}>Cancelar</button>}
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
    const [solicitando, setSolicitando] = useState(null);
    const [aviso, setAviso] = useState("");

    useEffect(() => {
        api("/polimeros").then((r) => setPolimeros(r.data));
    }, []);

    useEffect(() => {
        setDoacoes(null);
        const caminho = aba === "minhas" ? "/doacao/minhas?per_page=100" : `/doacao${query({ id_polimero: polimero, per_page: 100 })}`;
        if (aba === "mural" || aba === "minhas") api(caminho).then((r) => setDoacoes(lista(r))).catch(() => setDoacoes([]));
    }, [aba, polimero]);

    const abas = [["mural", "Mural de doações"], ["minhas", "Minhas doações"], ["pedidos", "Pedidos nas minhas doações"], ...(pode("receptor") ? [["coletas", "Minhas coletas"]] : [])];

    return (
        <div className="container">
            <CabecalhoPagina sobrelinha="Doação de makers · reciclagem" titulo="Doações de resíduos" descricao="Sobras, carretéis e peças com falha viram filamento novo. Laboratórios verificados solicitam a coleta; você aceita e combina a data.">
                <Link to="/doacoes/nova" className="botao botao--eco"><Plus size={16} aria-hidden="true" /> Doar resíduos</Link>
            </CabecalhoPagina>

            <div className="abas" role="tablist" style={{ marginBottom: "var(--esp-6)" }}>
                {abas.map(([valor, rotulo]) => (
                    <button key={valor} type="button" role="tab" aria-selected={aba === valor} onClick={() => setAba(valor)}>{rotulo}</button>
                ))}
            </div>

            {aviso && <div style={{ marginBottom: "var(--esp-4)" }}><Aviso tom="sucesso">{aviso}</Aviso></div>}

            {aba === "mural" && (
                <div className="linha" style={{ marginBottom: "var(--esp-5)" }} role="group" aria-label="Polímero">
                    <button type="button" className="chip-filtro" aria-pressed={polimero === ""} onClick={() => setPolimero("")}>Todos</button>
                    {polimeros.map((p) => (
                        <button key={p.id} type="button" className="chip-filtro" aria-pressed={polimero === p.id} onClick={() => setPolimero(p.id)}>{p.sigla}</button>
                    ))}
                </div>
            )}

            {(aba === "mural" || aba === "minhas") && (
                <>
                    {doacoes === null && <Carregando />}
                    {doacoes?.length === 0 && <Vazio icone={Gift} titulo={aba === "minhas" ? "Você ainda não doou" : "Nenhuma doação disponível"} acao={<Link to="/doacoes/nova" className="botao botao--eco">Doar resíduos</Link>} />}
                    <div className="grade-doacoes">
                        {doacoes?.map((doacao) => (
                            <CartaoDoacao
                                key={doacao.id}
                                doacao={doacao}
                                acao={
                                    aba === "mural" && pode("receptor") ? (
                                        <button type="button" className="botao botao--eco botao--bloco botao--pequeno" onClick={() => setSolicitando(doacao)}>
                                            <Truck size={14} aria-hidden="true" /> Solicitar coleta
                                        </button>
                                    ) : aba === "minhas" ? (
                                        <Chip tom={doacao.status === "disponivel" ? "sucesso" : "info"} ponto>{doacao.status}</Chip>
                                    ) : null
                                }
                            />
                        ))}
                    </div>
                </>
            )}

            {aba === "pedidos" && <ListaColetas papel="doador" />}
            {aba === "coletas" && <ListaColetas papel="laboratorio" />}

            {solicitando && (
                <SolicitarColeta
                    doacao={solicitando}
                    aoFechar={() => setSolicitando(null)}
                    aoSolicitar={() => {
                        setDoacoes((atual) => atual.filter((d) => d.id !== solicitando.id));
                        setSolicitando(null);
                        setAviso("Solicitação enviada. O doador vai aceitar ou recusar; acompanhe em “Minhas coletas”.");
                    }}
                />
            )}
        </div>
    );
}
