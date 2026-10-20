import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDot, ClipboardList, Hourglass, Inbox, Plus, Search, XCircle } from "lucide-react";
import { Aviso, Campo, Carregando, Chip, Dialogo, errosPorCampo, Vazio } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError, lista } from "../services/api";
import { formatarData, formatarDia, STATUS_CHAMADO } from "../utils/formatar";
import "../styles/pages/chamados.css";

/* ==================================================================
 * Chamados (pedidos de escolas e empresas)
 *   solicitante (escola/empresa verificada): abre, acompanha, edita enquanto aberto e cancela
 *   prestador (laboratório/maker): vê os abertos, escolhe o local de atendimento e aceita; conclui
 *   moderador: acompanha todos
 * ================================================================== */

const ETAPAS = ["Aberto", "Em Atendimento", "Resolvido"];
const FORM_VAZIO = { titulo: "", tipo_servico: "", data_limite: "", cidade: "", uf: "", descricao: "" };

function Etapas({ status }) {
    if (status === "Cancelado") return <Chip tom="perigo" ponto>Cancelado pelo solicitante</Chip>;
    const atual = ETAPAS.indexOf(status);
    return (
        <ol className="etapas" aria-label="Andamento">
            {ETAPAS.map((etapa, i) => (
                <li key={etapa} className={`etapa ${i < atual || status === "Resolvido" ? "etapa--feita" : ""} ${i === atual && status !== "Resolvido" ? "etapa--atual" : ""}`}>
                    {etapa}
                </li>
            ))}
        </ol>
    );
}

function NovoChamado({ opcoes, aberto, aoFechar, aoCriar }) {
    const [form, setForm] = useState(FORM_VAZIO);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            const criado = await api("/chamado", { method: "POST", body: form });
            setForm(FORM_VAZIO);
            aoCriar(criado);
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) setErros(errosPorCampo(e));
            else setMensagem(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Novo chamado">
            <form className="pilha" onSubmit={enviar} noValidate>
                <div>
                    <span className="sobrelinha">Novo chamado</span>
                    <h2 style={{ marginTop: "var(--esp-2)" }}>Do que sua instituição precisa?</h2>
                </div>
                {mensagem && <Aviso tom="perigo">{mensagem}</Aviso>}
                <div className="formulario-grade">
                    <div className="inteiro">
                        <Campo id="titulo" rotulo="Título" erro={erros.titulo}>
                            <input id="titulo" className="entrada" value={form.titulo} onChange={alterar("titulo")} aria-invalid={Boolean(erros.titulo)} />
                        </Campo>
                    </div>
                    <Campo id="tipo_servico" rotulo="Tipo de serviço" erro={erros.tipo_servico}>
                        <select id="tipo_servico" className="entrada" value={form.tipo_servico} onChange={alterar("tipo_servico")} aria-invalid={Boolean(erros.tipo_servico)}>
                            <option value="">Selecione</option>
                            {opcoes.tipos_servico.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
                        </select>
                    </Campo>
                    <Campo id="data_limite" rotulo="Prazo desejado" erro={erros.data_limite}>
                        <input id="data_limite" type="date" className="entrada" value={form.data_limite} onChange={alterar("data_limite")} aria-invalid={Boolean(erros.data_limite)} />
                    </Campo>
                    <Campo id="cidade" rotulo="Cidade" erro={erros.cidade}>
                        <input id="cidade" className="entrada" value={form.cidade} onChange={alterar("cidade")} />
                    </Campo>
                    <Campo id="uf" rotulo="UF" erro={erros.uf}>
                        <input id="uf" className="entrada" maxLength={2} placeholder="PR" value={form.uf} onChange={alterar("uf")} />
                    </Campo>
                    <div className="inteiro">
                        <Campo id="descricao" rotulo="Descrição" erro={erros.descricao} ajuda="Público atendido, equipamentos disponíveis e o que precisa ser feito.">
                            <textarea id="descricao" className="entrada" value={form.descricao} onChange={alterar("descricao")} aria-invalid={Boolean(erros.descricao)} />
                        </Campo>
                    </div>
                </div>
                <div className="linha linha--entre">
                    <button type="button" className="botao botao--secundario" onClick={aoFechar}>Cancelar</button>
                    <button type="submit" className="botao" disabled={enviando}>{enviando ? "Enviando..." : "Abrir chamado"}</button>
                </div>
            </form>
        </Dialogo>
    );
}

function PainelChamado({ chamado, usuario, pode, opcoes, aoAtualizar, aoRemover }) {
    const [local, setLocal] = useState("");
    const [erro, setErro] = useState("");
    const [processando, setProcessando] = useState(false);

    useEffect(() => {
        setLocal("");
        setErro("");
    }, [chamado.id]);

    const souSolicitante = chamado.id_usuario === usuario?.id;
    const souPrestador = chamado.id_prestador === usuario?.id;
    const aberto = chamado.status === "Aberto";
    const emAtendimento = chamado.status === "Em Atendimento";

    const executar = async (acao, corpo) => {
        setProcessando(true);
        setErro("");
        try {
            aoAtualizar(await api(`/chamado/${chamado.id}/${acao}`, { method: "POST", body: corpo }));
        } catch (e) {
            setErro(e.message);
        } finally {
            setProcessando(false);
        }
    };

    const excluir = async () => {
        if (!window.confirm(`Excluir o chamado "${chamado.titulo}"?`)) return;
        try {
            await api(`/chamado/${chamado.id}`, { method: "DELETE" });
            aoRemover(chamado.id);
        } catch (e) {
            setErro(e.message);
        }
    };

    const contato = chamado.contato && (souPrestador ? chamado.contato.solicitante : chamado.contato.prestador);
    const temAcoes = (pode("prestador") && aberto && !souSolicitante) || (souPrestador && emAtendimento) || (souSolicitante && (aberto || emAtendimento));

    return (
        <aside className="cartao painel" aria-label="Detalhes do chamado">
            <div className="painel__cabecalho">
                <div className="linha linha--entre">
                    <span className="codigo">CH-{String(chamado.id).padStart(5, "0")}</span>
                    <Chip tom={STATUS_CHAMADO[chamado.status]} ponto>{chamado.status}</Chip>
                </div>
                <h2>{chamado.titulo}</h2>
                <div style={{ marginTop: "var(--esp-4)" }}>
                    <Etapas status={chamado.status} />
                </div>
            </div>

            <div className="painel__corpo">
                <section className="painel__secao">
                    <h3>Pedido</h3>
                    <dl className="ficha-grade">
                        <div><dt>Tipo de serviço</dt><dd>{chamado.tipo_servico_rotulo ?? "—"}</dd></div>
                        <div><dt>Prazo</dt><dd>{formatarDia(chamado.data_limite)}</dd></div>
                        <div><dt>Solicitante</dt><dd>{chamado.usuario?.nome ?? "—"}</dd></div>
                        <div><dt>Local</dt><dd>{[chamado.cidade, chamado.uf].filter(Boolean).join(" / ") || "—"}</dd></div>
                        <div><dt>Aberto em</dt><dd>{formatarData(chamado.data_criacao)}</dd></div>
                    </dl>
                </section>

                <section className="painel__secao">
                    <h3>Descrição</h3>
                    <p style={{ whiteSpace: "pre-line", fontSize: "var(--texto-sm)" }}>{chamado.descricao}</p>
                </section>

                {chamado.prestador && (
                    <section className="painel__secao">
                        <h3>Atendimento</h3>
                        <dl className="ficha-grade">
                            <div><dt>Prestador</dt><dd>{chamado.prestador.nome}</dd></div>
                            <div><dt>Onde</dt><dd>{chamado.local_atendimento_rotulo}</dd></div>
                            <div><dt>Aceito em</dt><dd>{formatarData(chamado.aceito_em)}</dd></div>
                            {chamado.concluido_em && <div><dt>Concluído em</dt><dd>{formatarData(chamado.concluido_em)}</dd></div>}
                        </dl>
                    </section>
                )}

                {contato && (
                    <Aviso tom="info">
                        <strong>Contato:</strong> {contato.email} · {contato.telefone}
                    </Aviso>
                )}
                {erro && <Aviso tom="perigo">{erro}</Aviso>}
            </div>

            {temAcoes && (
                <div className="painel__rodape">
                    {pode("prestador") && aberto && !souSolicitante && (
                        <>
                            <fieldset className="opcoes-local" style={{ border: 0, padding: 0, margin: 0 }}>
                                <legend className="campo__rotulo" style={{ marginBottom: "var(--esp-2)" }}>Onde você vai atender?</legend>
                                {opcoes.locais_atendimento.map((opcao) => (
                                    <label key={opcao.valor}>
                                        <input type="radio" name={`local-${chamado.id}`} value={opcao.valor} checked={local === opcao.valor} onChange={() => setLocal(opcao.valor)} />
                                        {opcao.rotulo}
                                    </label>
                                ))}
                            </fieldset>
                            <button type="button" className="botao botao--bloco" disabled={!local || processando} onClick={() => executar("aceitar", { local_atendimento: local })}>
                                Aceitar chamado
                            </button>
                        </>
                    )}
                    {souPrestador && emAtendimento && (
                        <button type="button" className="botao botao--eco botao--bloco" disabled={processando} onClick={() => executar("concluir")}>
                            <CheckCircle2 size={16} aria-hidden="true" /> Marcar como concluído (+50 pontos)
                        </button>
                    )}
                    {souSolicitante && (aberto || emAtendimento) && (
                        <div className="linha">
                            <button type="button" className="botao botao--secundario" disabled={processando} onClick={() => executar("cancelar")}>Cancelar chamado</button>
                            {aberto && <button type="button" className="botao botao--perigo" onClick={excluir}>Excluir</button>}
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}

export default function Chamados() {
    const { usuario, pode } = useAuth();
    const [chamados, setChamados] = useState(null);
    const [opcoes, setOpcoes] = useState({ tipos_servico: [], locais_atendimento: [] });
    const [erro, setErro] = useState("");
    const [selecionado, setSelecionado] = useState(null);
    const [busca, setBusca] = useState("");
    const [status, setStatus] = useState("");
    const [tipo, setTipo] = useState("");
    const [aba, setAba] = useState("todos");
    const [novoAberto, setNovoAberto] = useState(false);

    const carregar = useCallback(async () => {
        try {
            const [respostaLista, respostaOpcoes] = await Promise.all([api("/chamado?per_page=100"), api("/chamado/opcoes")]);
            const itens = lista(respostaLista);
            setChamados(itens);
            setOpcoes(respostaOpcoes);
            setSelecionado((atual) => atual ?? itens[0]?.id ?? null);
        } catch (e) {
            setErro(e.message);
            setChamados([]);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const ehPrestador = pode("prestador");

    const visiveis = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return (chamados ?? [])
            .filter((c) => aba !== "disponiveis" || c.status === "Aberto")
            .filter((c) => aba !== "meus" || c.id_prestador === usuario?.id)
            .filter((c) => !status || c.status === status)
            .filter((c) => !tipo || c.tipo_servico === tipo)
            .filter((c) => !termo || `${c.titulo} ${c.cidade ?? ""} ${c.usuario?.nome ?? ""}`.toLowerCase().includes(termo));
    }, [chamados, aba, status, tipo, busca, usuario]);

    const contagem = (s) => (chamados ?? []).filter((c) => c.status === s).length;
    const atual = visiveis.find((c) => c.id === selecionado) ?? visiveis[0];
    const ativos = (chamados ?? []).length - contagem("Cancelado");
    const taxa = ativos ? Math.round((contagem("Resolvido") / ativos) * 100) : 0;
    const substituir = (novo) => setChamados((itens) => itens.map((c) => (c.id === novo.id ? novo : c)));

    return (
        <div className="container">
            <section className="chamados-topo">
                <div className="chamados-topo__texto">
                    <span className="sobrelinha">{pode("solicitante") ? "Pedidos da sua instituição" : ehPrestador ? "Demandas de escolas e empresas" : "Acompanhamento"}</span>
                    <h1>
                        Chamados <span>{pode("solicitante") ? "que sua escola precisa" : ehPrestador ? "esperando por você" : "da rede"}</span>
                    </h1>
                    <p>
                        {pode("solicitante")
                            ? "Peça treinamento, modelagem, digitalização ou impressão. Laboratórios e makers voluntários respondem."
                            : "Escolha um chamado aberto, defina onde vai atender e aceite."}
                    </p>
                    {pode("solicitante") && (
                        <button type="button" className="botao botao--grande" onClick={() => setNovoAberto(true)}>
                            <Plus size={18} aria-hidden="true" /> Novo chamado
                        </button>
                    )}
                </div>

                <aside className="resumo-chamados" aria-label="Taxa de atendimento">
                    <div className="resumo-chamados__anel" style={{ "--progresso": `${taxa}%` }}>
                        <strong>{chamados ? `${taxa}%` : "—"}</strong>
                        <span>atendidos</span>
                    </div>
                    <div>
                        <span className="resumo-chamados__rotulo">Taxa de atendimento</span>
                        <p>
                            {chamados ? `${contagem("Resolvido")} de ${ativos} pedidos válidos já foram resolvidos.` : "Calculando..."}
                        </p>
                        <span className="resumo-chamados__total">{chamados?.length ?? 0} chamados no total</span>
                    </div>
                </aside>
            </section>

            <div className="indicadores">
                {[
                    ["Abertos", contagem("Aberto"), "info", CircleDot],
                    ["Em atendimento", contagem("Em Atendimento"), "alerta", Hourglass],
                    ["Resolvidos", contagem("Resolvido"), "sucesso", CheckCircle2],
                    ["Cancelados", contagem("Cancelado"), "neutro", XCircle],
                ].map(([rotulo, valor, tom, Icone]) => (
                    <div key={rotulo} className={`indicador indicador--${tom}`}>
                        <span className="indicador__rotulo">
                            <Icone size={16} aria-hidden="true" /> {rotulo}
                        </span>
                        <span className="indicador__valor">{chamados ? valor : "—"}</span>
                        <span className="indicador__barra" aria-hidden="true">
                            <span style={{ width: `${chamados?.length ? (valor / chamados.length) * 100 : 0}%` }} />
                        </span>
                    </div>
                ))}
            </div>

            <div className="barra-ferramentas">
                {ehPrestador && (
                    <div className="segmentado" role="tablist">
                        {[["todos", "Todos"], ["disponiveis", "Disponíveis"], ["meus", "Meus atendimentos"]].map(([valor, rotulo]) => (
                            <button key={valor} type="button" role="tab" aria-selected={aba === valor} onClick={() => setAba(valor)}>{rotulo}</button>
                        ))}
                    </div>
                )}
                <label className="busca">
                    <Search size={16} aria-hidden="true" />
                    <span className="sr-only">Buscar</span>
                    <input className="entrada" placeholder="Buscar por título, cidade ou solicitante" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </label>
                <label className="sr-only" htmlFor="filtro-status">Status</label>
                <select id="filtro-status" className="entrada" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Todos os status</option>
                    {Object.keys(STATUS_CHAMADO).map((s) => <option key={s}>{s}</option>)}
                </select>
                <label className="sr-only" htmlFor="filtro-tipo">Tipo de serviço</label>
                <select id="filtro-tipo" className="entrada" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    <option value="">Todos os serviços</option>
                    {opcoes.tipos_servico.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
                </select>
            </div>

            {erro && <Aviso tom="perigo">{erro}</Aviso>}
            {chamados === null && <Carregando texto="Carregando chamados..." />}
            {chamados !== null && visiveis.length === 0 && (
                <Vazio icone={chamados.length ? Inbox : ClipboardList} titulo={chamados.length ? "Nenhum chamado com esses filtros" : "Nenhum chamado ainda"}>
                    {pode("solicitante") ? "Abra o primeiro pedido da sua instituição." : "Quando escolas e empresas abrirem pedidos, eles aparecem aqui."}
                </Vazio>
            )}

            {visiveis.length > 0 && atual && (
                <div className="mestre-detalhe">
                    <div className="tabela-container">
                        <table className="tabela">
                            <thead>
                                <tr>
                                    <th>Chamado</th>
                                    <th>Solicitante</th>
                                    <th>Prazo</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visiveis.map((c) => (
                                    <tr key={c.id} aria-selected={c.id === atual.id} onClick={() => setSelecionado(c.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSelecionado(c.id)}>
                                        <td className="celula-titulo">
                                            <span className="codigo">CH-{String(c.id).padStart(5, "0")}</span>
                                            <strong>{c.titulo}</strong>
                                            <span>{c.tipo_servico_rotulo}</span>
                                        </td>
                                        <td>{c.usuario?.nome}<br /><span className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>{[c.cidade, c.uf].filter(Boolean).join(" / ")}</span></td>
                                        <td style={{ whiteSpace: "nowrap" }}>{formatarDia(c.data_limite)}</td>
                                        <td><Chip tom={STATUS_CHAMADO[c.status]} ponto>{c.status}</Chip></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <PainelChamado
                        chamado={atual}
                        usuario={usuario}
                        pode={pode}
                        opcoes={opcoes}
                        aoAtualizar={substituir}
                        aoRemover={(id) => setChamados((itens) => itens.filter((c) => c.id !== id))}
                    />
                </div>
            )}

            <NovoChamado
                opcoes={opcoes}
                aberto={novoAberto}
                aoFechar={() => setNovoAberto(false)}
                aoCriar={(novo) => {
                    setChamados((itens) => [{ ...novo, usuario }, ...(itens ?? [])]);
                    setSelecionado(novo.id);
                    setNovoAberto(false);
                }}
            />
        </div>
    );
}
