import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ClipboardList, Inbox, MapPin, Search } from "lucide-react";
import { Aviso, Campo, Chip, Dialogo, errosPorCampo, Vazio } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError, lista } from "../services/api";
import { formatarData, formatarDia, STATUS_CHAMADO } from "../utils/formatar";
import "../styles/pages/chamados.css";

/* ==================================================================
 * Chamados (pedidos de escolas e empresas)
 *   solicitante (escola/empresa verificada): abre, acompanha, edita enquanto aberto e cancela
 *   prestador (laboratório/maker): vê os abertos, escolhe o local de atendimento e aceita; conclui
 *   moderador: acompanha todos
 *
 * Visual: "Browse templates" do arquivo Website Templates — Squarespace
 * (título de 64 px + texto à direita, colunas de filtro com caixas de
 * seleção, linha de resultados sublinhada, cartões com borda #E8E4E4 e
 * sombra, faixa preta com botão branco) + estrutura de painel do Mockfit
 * (barra lateral, KPIs "00.000", gráfico grande e lista de linhas).
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

const KPIS = [
    ["Aberto", "Abertos"],
    ["Em Atendimento", "Em atendimento"],
    ["Resolvido", "Resolvidos"],
    ["Cancelado", "Cancelados"],
];

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// KPI no formato do Mockfit ("00,000"), com separador brasileiro.
const numeroPainel = (n) => n.toLocaleString("pt-BR", { minimumIntegerDigits: 5 });

const codigo = (id) => `CH-${String(id).padStart(5, "0")}`;

const semMovimento = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* Contagem animada (count-up) quando o elemento entra na tela; sem animação se o usuário pediu menos movimento. */
function useContagem(alvo, duracao = 1100) {
    const ref = useRef(null);
    const [valor, setValor] = useState(0);
    const [visto, setVisto] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === "undefined") {
            setVisto(true);
            return undefined;
        }
        const observador = new IntersectionObserver(([entrada]) => {
            if (entrada.isIntersecting) {
                setVisto(true);
                observador.disconnect();
            }
        }, { threshold: 0.3 });
        observador.observe(el);
        return () => observador.disconnect();
    }, []);

    useEffect(() => {
        if (!visto || alvo == null) return undefined;
        if (semMovimento()) {
            setValor(alvo);
            return undefined;
        }
        let quadro;
        const inicio = performance.now();
        const de = 0;
        const passo = (agora) => {
            const t = Math.min(1, (agora - inicio) / duracao);
            const suave = 1 - Math.pow(1 - t, 3);
            setValor(Math.round(de + (alvo - de) * suave));
            if (t < 1) quadro = requestAnimationFrame(passo);
        };
        quadro = requestAnimationFrame(passo);
        return () => cancelAnimationFrame(quadro);
    }, [visto, alvo, duracao]);

    return [ref, valor];
}

function Kpi({ rotulo, valor, indice }) {
    const [ref, exibido] = useContagem(valor);
    return (
        <div ref={ref} className="sq-cartao sq-kpi" data-revelar style={{ "--atraso": `${indice * 90}ms` }}>
            <span className="sq-rotulo">{rotulo.toUpperCase()}</span>
            <strong>{valor == null ? "—" : numeroPainel(exibido)}</strong>
        </div>
    );
}

/* Esqueleto da lista enquanto os chamados carregam. */
function EsqueletoLista() {
    return (
        <ul className="sq-cartao sq-lista sq-lista--esqueleto" aria-busy="true" aria-label="Carregando chamados">
            {[0, 1, 2, 3].map((i) => (
                <li key={i} className="sq-esqueleto-linha">
                    <span className="esqueleto sq-esqueleto-linha__marca" />
                    <span className="sq-esqueleto-linha__texto">
                        <span className="esqueleto" style={{ width: `${70 - i * 8}%` }} />
                        <span className="esqueleto" style={{ width: `${45 + i * 5}%` }} />
                    </span>
                </li>
            ))}
        </ul>
    );
}

/* Caixa de seleção quadrada de 14 px do template (cinza #CCC quando marcada). */
function OpcaoCaixa({ marcada, aoMarcar, children }) {
    return (
        <button type="button" role="radio" aria-checked={marcada} className="sq-caixa" onClick={aoMarcar}>
            <span className="sq-caixa__quadro" aria-hidden="true">{marcada && <Check size={12} strokeWidth={3} />}</span>
            {children}
        </button>
    );
}

/* Item de lista com seta (coluna "TOPIC" do template). */
function OpcaoSeta({ marcada, aoMarcar, children }) {
    return (
        <button type="button" role="radio" aria-checked={marcada} className="sq-seta" onClick={aoMarcar}>
            {marcada && <ArrowRight size={14} aria-hidden="true" />}
            {children}
        </button>
    );
}

/* Gráfico de barras em SVG puro: chamados por mês (últimos 6) ou por tipo de serviço. */
function Grafico({ chamados, opcoes }) {
    const [modo, setModo] = useState("mes");
    const [foco, setFoco] = useState(null);

    const dados = useMemo(() => {
        if (modo === "tipo") {
            return opcoes.tipos_servico.map((t) => ({ rotulo: t.rotulo, valor: chamados.filter((c) => c.tipo_servico === t.valor).length }));
        }
        const hoje = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + i, 1);
            const valor = chamados.filter((c) => {
                const criado = new Date(c.data_criacao);
                return criado.getFullYear() === d.getFullYear() && criado.getMonth() === d.getMonth();
            }).length;
            return { rotulo: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, valor };
        });
    }, [modo, chamados, opcoes]);

    const L = 720, A = 280, base = 240, topo = 24;
    const maximo = Math.max(1, ...dados.map((d) => d.valor));
    const passo = L / dados.length;
    const largura = Math.min(64, passo * 0.5);
    const linhas = [0, 0.25, 0.5, 0.75, 1];

    return (
        <section className="sq-cartao sq-grafico" aria-labelledby="titulo-grafico" data-revelar>
            <div className="sq-grafico__topo">
                <p className="sq-rotulo" id="titulo-grafico">{modo === "mes" ? "CHAMADOS POR MÊS" : "CHAMADOS POR TIPO DE SERVIÇO"}</p>
                <div className="sq-abas" role="tablist" aria-label="Agrupar gráfico">
                    <button type="button" role="tab" aria-selected={modo === "mes"} onClick={() => setModo("mes")}>Por mês</button>
                    <button type="button" role="tab" aria-selected={modo === "tipo"} onClick={() => setModo("tipo")}>Por serviço</button>
                </div>
            </div>
            <div className="sq-grafico__area">
            {foco !== null && dados[foco] && (
                <span
                    className="sq-grafico__dica"
                    style={{ left: `${((foco * passo + passo / 2) / L) * 100}%`, top: `${((base - (dados[foco].valor / maximo) * (base - topo)) / (A + 30)) * 100}%` }}
                    role="status"
                >
                    <strong>{dados[foco].valor}</strong> {dados[foco].valor === 1 ? "chamado" : "chamados"} · {dados[foco].rotulo}
                </span>
            )}
            <svg key={modo} viewBox={`0 0 ${L} ${A + 30}`} className="sq-grafico__svg" role="img" aria-label={dados.map((d) => `${d.rotulo}: ${d.valor}`).join(", ")}>
                {linhas.map((f) => {
                    const y = base - f * (base - topo);
                    return (
                        <g key={f}>
                            <line x1="0" x2={L} y1={y} y2={y} className="sq-grafico__grade" />
                            <text x="0" y={y - 6} className="sq-grafico__eixo">{Math.round(f * maximo)}</text>
                        </g>
                    );
                })}
                {dados.map((d, i) => {
                    const h = (d.valor / maximo) * (base - topo);
                    const x = i * passo + (passo - largura) / 2;
                    return (
                        <g
                            key={d.rotulo}
                            className={`sq-grafico__coluna ${foco === i ? "sq-grafico__coluna--foco" : ""}`}
                            style={{ "--i": i }}
                            onMouseEnter={() => setFoco(i)}
                            onMouseLeave={() => setFoco(null)}
                        >
                            <rect x={i * passo} y={topo} width={passo} height={base - topo} className="sq-grafico__alvo" />
                            <rect x={x} y={base - h} width={largura} height={Math.max(h, d.valor ? 2 : 0)} className="sq-grafico__barra" />
                            {d.valor > 0 && <text x={x + largura / 2} y={base - h - 8} textAnchor="middle" className="sq-grafico__valor">{d.valor}</text>}
                            <text x={i * passo + passo / 2} y={base + 24} textAnchor="middle" className="sq-grafico__eixo">
                                {d.rotulo.length > 18 ? `${d.rotulo.slice(0, 17)}…` : d.rotulo}
                            </text>
                        </g>
                    );
                })}
            </svg>
            </div>
        </section>
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
    const podeAceitar = pode("prestador") && aberto && !souSolicitante;
    const temAcoes = podeAceitar || (souPrestador && emAtendimento) || (souSolicitante && (aberto || emAtendimento));

    return (
        <aside key={chamado.id} className="sq-detalhe sq-detalhe--troca" aria-label="Detalhes do chamado">
            <div className="sq-cartao sq-detalhe__capa">
                <div className="sq-detalhe__topo">
                    <Chip tom={STATUS_CHAMADO[chamado.status]} ponto>{chamado.status}</Chip>
                    <span className="sq-rotulo">{chamado.tipo_servico_rotulo ?? "Serviço"}</span>
                </div>
                <h3>{chamado.titulo}</h3>
                <Etapas status={chamado.status} />
            </div>
            <div className="sq-legenda">
                <span>{codigo(chamado.id)}</span>
                <span className="sq-legenda__icone" title={[chamado.cidade, chamado.uf].filter(Boolean).join(" / ")}>
                    <MapPin size={20} aria-hidden="true" />
                </span>
            </div>

            <div className="sq-detalhe__corpo">
                <dl className="sq-ficha">
                    <div><dt>PRAZO</dt><dd>{formatarDia(chamado.data_limite)}</dd></div>
                    <div><dt>SOLICITANTE</dt><dd>{chamado.usuario?.nome ?? "—"}</dd></div>
                    <div><dt>LOCAL</dt><dd>{[chamado.cidade, chamado.uf].filter(Boolean).join(" / ") || "—"}</dd></div>
                    <div><dt>ABERTO EM</dt><dd>{formatarData(chamado.data_criacao)}</dd></div>
                    {chamado.prestador && (
                        <>
                            <div><dt>PRESTADOR</dt><dd>{chamado.prestador.nome}</dd></div>
                            <div><dt>ONDE</dt><dd>{chamado.local_atendimento_rotulo}</dd></div>
                            <div><dt>ACEITO EM</dt><dd>{formatarData(chamado.aceito_em)}</dd></div>
                            {chamado.concluido_em && <div><dt>CONCLUÍDO EM</dt><dd>{formatarData(chamado.concluido_em)}</dd></div>}
                        </>
                    )}
                </dl>

                <p className="sq-detalhe__descricao">{chamado.descricao}</p>

                {contato && (
                    <Aviso tom="info">
                        <strong>Contato:</strong> {contato.email} · {contato.telefone}
                    </Aviso>
                )}
                {erro && <Aviso tom="perigo">{erro}</Aviso>}

                {temAcoes && (
                    <div className="sq-detalhe__acoes">
                        {podeAceitar && (
                            <>
                                <fieldset className="sq-locais">
                                    <legend className="sq-rotulo">ONDE VOCÊ VAI ATENDER?</legend>
                                    {opcoes.locais_atendimento.map((opcao) => (
                                        <label key={opcao.valor} className="sq-caixa">
                                            <input type="radio" name={`local-${chamado.id}`} value={opcao.valor} checked={local === opcao.valor} onChange={() => setLocal(opcao.valor)} />
                                            <span className="sq-caixa__quadro" aria-hidden="true">{local === opcao.valor && <Check size={12} strokeWidth={3} />}</span>
                                            {opcao.rotulo}
                                        </label>
                                    ))}
                                </fieldset>
                                <button type="button" className="sq-botao sq-botao--preto" disabled={!local || processando} onClick={() => executar("aceitar", { local_atendimento: local })}>
                                    ACEITAR CHAMADO
                                </button>
                            </>
                        )}
                        {souPrestador && emAtendimento && (
                            <button type="button" className="sq-botao sq-botao--preto" disabled={processando} onClick={() => executar("concluir")}>
                                MARCAR COMO CONCLUÍDO (+50 PONTOS)
                            </button>
                        )}
                        {souSolicitante && (aberto || emAtendimento) && (
                            <div className="sq-linha">
                                <button type="button" className="sq-botao" disabled={processando} onClick={() => executar("cancelar")}>CANCELAR CHAMADO</button>
                                {aberto && <button type="button" className="sq-botao sq-botao--perigo" onClick={excluir}>EXCLUIR</button>}
                            </div>
                        )}
                    </div>
                )}
            </div>
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
    const ehSolicitante = pode("solicitante");

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
        <div className="sq">
            {/* Section 01 — título + texto e colunas de filtro */}
            <section className="sq-secao sq-topo">
                <div className="sq-topo__titulo" data-revelar>
                    <h1>Meu painel de chamados.</h1>
                    <p>
                        {ehSolicitante
                            ? "Peça treinamento, modelagem, digitalização ou impressão 3D para a sua instituição. Laboratórios e makers voluntários da rede respondem e você acompanha cada etapa por aqui."
                            : ehPrestador
                              ? "Pedidos de escolas públicas e empresas esperando atendimento. Escolha um chamado aberto, diga onde vai atender e aceite."
                              : "Acompanhamento de todos os chamados da rede EcoHub 3D."}
                    </p>
                </div>

                <div className="sq-filtros" data-revelar style={{ "--atraso": "120ms" }}>
                    {ehPrestador && (
                        <div className="sq-filtros__coluna" role="radiogroup" aria-label="Visão">
                            <p className="sq-rotulo">VISÃO</p>
                            {[["todos", "Todos os chamados"], ["disponiveis", "Disponíveis"], ["meus", "Meus atendimentos"]].map(([valor, rotulo]) => (
                                <OpcaoSeta key={valor} marcada={aba === valor} aoMarcar={() => setAba(valor)}>{rotulo}</OpcaoSeta>
                            ))}
                        </div>
                    )}
                    <div className="sq-filtros__coluna" role="radiogroup" aria-label="Status">
                        <p className="sq-rotulo">STATUS</p>
                        <OpcaoCaixa marcada={status === ""} aoMarcar={() => setStatus("")}>Todos</OpcaoCaixa>
                        {Object.keys(STATUS_CHAMADO).map((s) => (
                            <OpcaoCaixa key={s} marcada={status === s} aoMarcar={() => setStatus(s)}>{s}</OpcaoCaixa>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna" role="radiogroup" aria-label="Tipo de serviço">
                        <p className="sq-rotulo">SERVIÇO</p>
                        <OpcaoSeta marcada={tipo === ""} aoMarcar={() => setTipo("")}>Todos os serviços</OpcaoSeta>
                        {opcoes.tipos_servico.map((t) => (
                            <OpcaoSeta key={t.valor} marcada={tipo === t.valor} aoMarcar={() => setTipo(t.valor)}>{t.rotulo}</OpcaoSeta>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna">
                        <label className="sq-rotulo" htmlFor="busca-chamados">BUSCAR</label>
                        <span className="sq-busca">
                            <Search size={14} aria-hidden="true" />
                            <input id="busca-chamados" placeholder="Título, cidade ou solicitante" value={busca} onChange={(e) => setBusca(e.target.value)} />
                        </span>
                    </div>
                    <div className="sq-filtros__acoes">
                        <p className="sq-rotulo">TAXA DE ATENDIMENTO · {chamados ? `${taxa}%` : "—"}</p>
                        {ehSolicitante && (
                            <button type="button" className="sq-botao" onClick={() => setNovoAberto(true)}>
                                NOVO CHAMADO
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Section 02 — linha de resultados */}
            <section className="sq-secao sq-resultados" data-revelar="fade">
                <p>
                    <strong>{visiveis.length} {visiveis.length === 1 ? "chamado encontrado" : "chamados encontrados"}</strong>
                    {KPIS.map(([valor, rotulo], i) => (
                        <React.Fragment key={valor}>
                            {i > 0 && ", "}
                            <button type="button" className="sq-link" onClick={() => setStatus(status === valor ? "" : valor)}>
                                {rotulo} ({contagem(valor)})
                            </button>
                        </React.Fragment>
                    ))}
                </p>
            </section>

            {/* Painel (Mockfit): barra lateral + conteúdo */}
            <div className="sq-secao sq-painel">
                <nav className="sq-lateral" aria-label="Seções do painel" data-revelar="esquerda">
                    <p className="sq-rotulo">PAINEL</p>
                    <a href="#visao-geral">Visão geral</a>
                    <a href="#lista-chamados">Chamados</a>
                    <a href="#como-funciona">Como funciona</a>
                    <div className="sq-lateral__taxa">
                        <span className="sq-rotulo">ATENDIDOS</span>
                        <strong>{chamados ? `${taxa}%` : "—"}</strong>
                        <span className="sq-lateral__barra"><span style={{ "--taxa": `${taxa}%` }} /></span>
                    </div>
                </nav>

                <div className="sq-principal">
                    <h2 className="sq-titulo-secao" id="visao-geral" data-revelar>Visão geral</h2>
                    <div className="sq-kpis">
                        {KPIS.map(([valor, rotulo], i) => (
                            <Kpi key={valor} rotulo={rotulo} valor={chamados ? contagem(valor) : null} indice={i} />
                        ))}
                    </div>

                    {chamados !== null && <Grafico chamados={chamados} opcoes={opcoes} />}

                    <h2 className="sq-titulo-secao" id="lista-chamados" data-revelar>Chamados ({visiveis.length})</h2>

                    {erro && <Aviso tom="perigo">{erro}</Aviso>}
                    {chamados === null && <EsqueletoLista />}
                    {chamados !== null && visiveis.length === 0 && (
                        <Vazio icone={chamados.length ? Inbox : ClipboardList} titulo={chamados.length ? "Nenhum chamado com esses filtros" : "Nenhum chamado ainda"}>
                            {ehSolicitante ? "Abra o primeiro pedido da sua instituição." : "Quando escolas e empresas abrirem pedidos, eles aparecem aqui."}
                        </Vazio>
                    )}

                    {visiveis.length > 0 && atual && (
                        <div className="sq-mestre">
                                <ul className="sq-cartao sq-lista" data-revelar>
                                {visiveis.map((c, i) => (
                                    <li key={c.id} className="sq-lista__item" style={{ "--i": Math.min(i, 12) }}>
                                        <button type="button" className="sq-linha-item" aria-current={c.id === atual.id} onClick={() => setSelecionado(c.id)}>
                                            <span className="sq-linha-item__marca" aria-hidden="true">{c.tipo_servico_rotulo?.[0] ?? "C"}</span>
                                            <span className="sq-linha-item__texto">
                                                <strong>{c.titulo}</strong>
                                                <span>{codigo(c.id)} · {c.usuario?.nome} · {[c.cidade, c.uf].filter(Boolean).join(" / ")}</span>
                                            </span>
                                            <span className="sq-linha-item__valor">
                                                <Chip tom={STATUS_CHAMADO[c.status]} ponto>{c.status}</Chip>
                                                <span>{formatarDia(c.data_limite)}</span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>

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
                </div>
            </div>

            {/* Section 04 — faixa preta com botão branco + painel claro */}
            <section className="sq-secao sq-faixa" id="como-funciona">
                <div className="sq-faixa__preta" data-revelar="esquerda">
                    <div>
                        <h2>{ehPrestador ? "Atenda escolas da sua região" : "Precisa de impressão 3D na escola?"}</h2>
                        <p>
                            {ehPrestador
                                ? "Laboratórios e makers voluntários levam treinamento, modelagem e peças impressas para quem mais precisa — e cada atendimento concluído rende pontos e selos no ranking."
                                : "Descreva o que sua instituição precisa, defina um prazo e acompanhe o atendimento do aceite à conclusão. O contato do prestador aparece assim que ele aceitar."}
                        </p>
                    </div>
                    {ehSolicitante && (
                        <button type="button" className="sq-botao sq-botao--branco" onClick={() => setNovoAberto(true)}>ABRIR CHAMADO</button>
                    )}
                    {ehPrestador && !ehSolicitante && (
                        <button type="button" className="sq-botao sq-botao--branco" onClick={() => { setAba("disponiveis"); document.getElementById("lista-chamados")?.scrollIntoView({ behavior: "smooth" }); }}>
                            VER DISPONÍVEIS
                        </button>
                    )}
                </div>
                <ol className="sq-faixa__passos" data-revelar="direita" style={{ "--atraso": "120ms" }}>
                    {[
                        ["01", "Abrir", "A escola ou empresa verificada descreve o pedido, o tipo de serviço e o prazo."],
                        ["02", "Aceitar", "Um laboratório ou maker escolhe onde vai atender e assume o chamado."],
                        ["03", "Concluir", "O prestador marca como resolvido e ganha 50 pontos no ranking."],
                    ].map(([n, titulo, texto], i) => (
                        <li key={n} style={{ "--i": i }}>
                            <span>{n}</span>
                            <strong>{titulo}</strong>
                            <p>{texto}</p>
                        </li>
                    ))}
                </ol>
            </section>

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
