import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Briefcase, Building2, Check, Inbox, Mail, MapPin, Search, Users } from "lucide-react";
import { Chip, Contador, Vazio } from "../../components/ui";
import { OpcaoCaixa, OpcaoSeta, RgErro } from "../../components/Squarespace";
import { useAuth } from "../../contexts/AuthContext";
import { api, lista, query } from "../../services/api";
import {
    DISPONIBILIDADES,
    ESPECIALIDADES_SUGERIDAS,
    formatarData,
    formatarDia,
    formatarFaixaSalarial,
    iniciais,
    MODALIDADES_TRABALHO,
    NIVEIS_VAGA,
    STATUS_CANDIDATURA,
    tempoRelativo,
    TIPOS_CONTRATO,
    UFS,
} from "../../utils/formatar";
import "../../styles/pages/chamados.css";
import "../../styles/pages/registro.css";
import "../../styles/pages/vagas.css";

/* ==================================================================
 * Vagas e banco de currículos — visual "Browse templates" (Website
 * Templates — Squarespace), o mesmo de Chamados, Doações e Empresas:
 * Section 01 (título + texto + colunas de filtro), Section 02 (linha de
 * resultados com filtros rápidos), lista + painel de detalhe e
 * Section 04 (faixa preta com botão branco).
 *
 *   candidato (pessoa física): filtra o mural, candidata-se e acompanha o status
 *   contratante (PJ verificada): mural, "Minhas vagas" (candidatos, status,
 *     encerrar) e "Banco de currículos" (busca por especialidade, UF etc.)
 * ================================================================== */

const STATUS_DECISAO = ["Em análise", "Aprovada", "Reprovada"];

const codigo = (id) => `VG-${String(id).padStart(5, "0")}`;
const localDe = (item) => [item.cidade, item.uf].filter(Boolean).join(" / ");
const alternarNaLista = (lista, valor) => (lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]);

/** Valor que só muda depois de uma pausa na digitação (a busca vai para a API). */
function useAtrasado(valor, espera = 300) {
    const [atrasado, setAtrasado] = useState(valor);
    useEffect(() => {
        const id = setTimeout(() => setAtrasado(valor), espera);
        return () => clearTimeout(id);
    }, [valor, espera]);
    return atrasado;
}

/* Esqueleto da lista enquanto as vagas carregam. */
function EsqueletoLista({ rotulo }) {
    return (
        <ul className="sq-cartao sq-lista sq-lista--esqueleto" aria-busy="true" aria-label={rotulo}>
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

/* Linha de vaga (lista do mural e de "Minhas vagas"). */
function LinhaVaga({ vaga, indice, atual, aoEscolher, extra }) {
    return (
        <li className="sq-lista__item" style={{ "--i": Math.min(indice, 12) }}>
            <button type="button" className="sq-linha-item" aria-current={atual} onClick={aoEscolher}>
                <span className="sq-linha-item__marca" aria-hidden="true">{(vaga.tema ?? vaga.titulo)?.[0] ?? "V"}</span>
                <span className="sq-linha-item__texto">
                    <strong>{vaga.titulo}</strong>
                    <span>{[vaga.usuario?.nome, localDe(vaga), vaga.tipo_contrato_rotulo, vaga.nivel_rotulo].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="sq-linha-item__valor">
                    {extra ?? (vaga.modalidade_rotulo && <span className={`vg-selo vg-selo--${vaga.modalidade}`}>{vaga.modalidade_rotulo}</span>)}
                    <span>{formatarFaixaSalarial(vaga.salario_min, vaga.salario_max)}</span>
                </span>
            </button>
        </li>
    );
}

/* Ficha comum do detalhe da vaga. */
function FichaVaga({ vaga }) {
    return (
        <dl className="sq-ficha">
            <div><dt>INSTITUIÇÃO</dt><dd>{vaga.usuario?.nome ?? "Você"}</dd></div>
            <div><dt>LOCAL</dt><dd>{localDe(vaga) || "—"}{vaga.cep && ` · CEP ${vaga.cep}`}</dd></div>
            <div><dt>MODALIDADE</dt><dd>{vaga.modalidade_rotulo ?? "—"}</dd></div>
            <div><dt>CONTRATO</dt><dd>{vaga.tipo_contrato_rotulo ?? "—"}</dd></div>
            <div><dt>NÍVEL</dt><dd>{vaga.nivel_rotulo ?? "—"}</dd></div>
            <div><dt>FAIXA SALARIAL</dt><dd>{formatarFaixaSalarial(vaga.salario_min, vaga.salario_max)}</dd></div>
            <div><dt>PUBLICADA</dt><dd>{formatarData(vaga.data_publicacao)}</dd></div>
            <div><dt>{vaga.aceita_candidaturas ? "ENCERRA EM" : "ENCERRADA"}</dt><dd>{vaga.aceita_candidaturas ? (vaga.encerra_em ? formatarDia(vaga.encerra_em) : "Sem data") : formatarData(vaga.encerrada_em ?? vaga.encerra_em)}</dd></div>
        </dl>
    );
}

function CapaVaga({ vaga, children }) {
    return (
        <>
            <div className="sq-cartao sq-detalhe__capa vg-capa">
                <div className="sq-detalhe__topo">
                    <Chip tom={vaga.aceita_candidaturas ? "sucesso" : "neutro"} ponto>{vaga.status_rotulo ?? "Aberta"}</Chip>
                    <span className="sq-rotulo">{vaga.tema ?? "Vaga"}</span>
                </div>
                <h3>{vaga.titulo}</h3>
                {vaga.habilidades?.length > 0 && (
                    <ul className="vg-chips" aria-label="Habilidades pedidas">
                        {vaga.habilidades.map((h, i) => <li key={h} style={{ "--i": i }}>{h}</li>)}
                    </ul>
                )}
                {children}
            </div>
            <div className="sq-legenda">
                <span>{codigo(vaga.id)}</span>
                <span className="sq-legenda__icone" title={vaga.usuario?.nome}><Building2 size={20} aria-hidden="true" /></span>
            </div>
        </>
    );
}

/* Painel de detalhe do mural. */
function DetalheVaga({ vaga, candidatura, pode, usuario, aoCandidatar, aoDesistir, aoVerCandidatos }) {
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");

    useEffect(() => {
        setErro("");
        setAviso("");
    }, [vaga.id]);

    const executar = async (acao, sucesso) => {
        setProcessando(true);
        setErro("");
        setAviso("");
        try {
            await acao();
            if (sucesso) setAviso(sucesso);
        } catch (e) {
            setErro(e.message);
        } finally {
            setProcessando(false);
        }
    };

    const souDono = vaga.id_usuario === usuario?.id;

    return (
        <aside key={vaga.id} className="sq-detalhe sq-detalhe--troca" aria-label="Detalhes da vaga">
            <CapaVaga vaga={vaga} />
            <div className="sq-detalhe__corpo">
                <FichaVaga vaga={vaga} />
                <p className="sq-detalhe__descricao">{vaga.texto}</p>
                <RgErro>{erro}</RgErro>
                {aviso && <p className="vg-aviso" role="status"><Check size={16} aria-hidden="true" /> {aviso}</p>}

                <div className="sq-detalhe__acoes">
                    {pode("candidato") && !candidatura && vaga.aceita_candidaturas && (
                        <button type="button" className="sq-botao sq-botao--preto" disabled={processando} onClick={() => executar(aoCandidatar, "Candidatura enviada! Acompanhe o status em Meu currículo.")}>
                            CANDIDATAR-SE
                        </button>
                    )}
                    {candidatura && (
                        <div className="vg-candidatado">
                            <p className="sq-rotulo">VOCÊ JÁ SE CANDIDATOU</p>
                            <div className="sq-linha">
                                <Chip tom={STATUS_CANDIDATURA[candidatura.status]} ponto>{candidatura.status}</Chip>
                                {candidatura.status === "Em análise" && (
                                    <button type="button" className="sq-link" disabled={processando} onClick={() => executar(aoDesistir)}>Desistir</button>
                                )}
                            </div>
                        </div>
                    )}
                    {pode("candidato") && !candidatura && !vaga.aceita_candidaturas && <p className="rg-info">Esta vaga está encerrada e não recebe novas candidaturas.</p>}
                    {souDono && (
                        <button type="button" className="sq-botao" onClick={() => aoVerCandidatos(vaga.id)}>
                            VER CANDIDATOS
                        </button>
                    )}
                    {!pode("candidato") && !souDono && <p className="rg-info">Somente pessoas físicas se candidatam a vagas.</p>}
                </div>
            </div>
        </aside>
    );
}

/* ------------------------------ Mural ------------------------------ */
function Mural({ cabecalho, pode, usuario, aoVerCandidatos }) {
    const [todas, setTodas] = useState(null);
    const [vagas, setVagas] = useState(null);
    const [erro, setErro] = useState("");
    const [minhas, setMinhas] = useState(new Map());
    const [selecionada, setSelecionada] = useState(null);
    const [temas, setTemas] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [contrato, setContrato] = useState("");
    const [nivel, setNivel] = useState("");
    const [busca, setBusca] = useState("");
    const [uf, setUf] = useState("");
    const [cidade, setCidade] = useState("");
    const termo = useAtrasado(busca.trim());
    const cidadeAtrasada = useAtrasado(cidade.trim());
    const candidato = pode("candidato");

    // Lista completa (só abertas): alimenta as contagens dos filtros rápidos e as áreas.
    useEffect(() => {
        api("/vaga?per_page=100").then((r) => setTodas(lista(r))).catch(() => setTodas([]));
        if (candidato) {
            api("/candidatura?per_page=100").then((r) => setMinhas(new Map(lista(r).map((c) => [c.id_vaga, c])))).catch(() => {});
        }
    }, [candidato]);

    // Lista filtrada pela API.
    const filtros = query({ q: termo, tema: temas.join(","), modalidade: modalidades.join(","), tipo_contrato: contrato, nivel, uf, cidade: cidadeAtrasada, per_page: 100 });
    useEffect(() => {
        let ativo = true;
        setErro("");
        api(`/vaga${filtros}`)
            .then((r) => ativo && setVagas(lista(r)))
            .catch((e) => {
                if (!ativo) return;
                setErro(e.message);
                setVagas([]);
            });
        return () => {
            ativo = false;
        };
    }, [filtros]);

    const areas = useMemo(() => [...new Set((todas ?? []).map((v) => v.tema).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")), [todas]);
    const contar = (campo, valor) => (todas ?? []).filter((v) => v[campo] === valor).length;
    const atual = vagas?.find((v) => v.id === selecionada) ?? vagas?.[0];
    const temFiltro = temas.length || modalidades.length || contrato || nivel || busca || uf || cidade;
    const limpar = () => {
        setTemas([]);
        setModalidades([]);
        setContrato("");
        setNivel("");
        setBusca("");
        setUf("");
        setCidade("");
    };

    const candidatar = async () => {
        const nova = await api("/candidatura", { method: "POST", body: { id_vaga: atual.id } });
        setMinhas((mapa) => new Map(mapa).set(atual.id, nova));
    };
    const desistir = async () => {
        const c = minhas.get(atual.id);
        await api(`/candidatura/${c.id}`, { method: "DELETE" });
        setMinhas((mapa) => {
            const copia = new Map(mapa);
            copia.delete(atual.id);
            return copia;
        });
    };

    const rapidos = [
        ["modalidade", "remoto", "Remoto"],
        ["modalidade", "hibrido", "Híbrido"],
        ["modalidade", "presencial", "Presencial"],
        ["tipo_contrato", "estagio", "Estágio"],
        ["tipo_contrato", "clt", "CLT"],
        ["tipo_contrato", "bolsa", "Bolsa"],
    ];
    const rapidoAtivo = (campo, valor) => (campo === "modalidade" ? modalidades.length === 1 && modalidades[0] === valor : contrato === valor);
    const aplicarRapido = (campo, valor) => {
        if (campo === "modalidade") setModalidades((atualM) => (atualM.length === 1 && atualM[0] === valor ? [] : [valor]));
        else setContrato((c) => (c === valor ? "" : valor));
    };

    return (
        <>
            <section className="sq-secao sq-topo">
                {cabecalho}
                <div className="sq-filtros vg-filtros" data-revelar style={{ "--atraso": "120ms" }}>
                    <div className="sq-filtros__coluna" role="group" aria-label="Área">
                        <p className="sq-rotulo">ÁREA</p>
                        <OpcaoCaixa papel="checkbox" marcada={temas.length === 0} aoMarcar={() => setTemas([])}>Todas as áreas</OpcaoCaixa>
                        {areas.map((t) => (
                            <OpcaoCaixa key={t} papel="checkbox" marcada={temas.includes(t)} aoMarcar={() => setTemas((atualT) => alternarNaLista(atualT, t))}>{t}</OpcaoCaixa>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna" role="group" aria-label="Modalidade">
                        <p className="sq-rotulo">MODALIDADE</p>
                        <OpcaoCaixa papel="checkbox" marcada={modalidades.length === 0} aoMarcar={() => setModalidades([])}>Todas</OpcaoCaixa>
                        {Object.entries(MODALIDADES_TRABALHO).map(([valor, rotulo]) => (
                            <OpcaoCaixa key={valor} papel="checkbox" marcada={modalidades.includes(valor)} aoMarcar={() => setModalidades((atualM) => alternarNaLista(atualM, valor))}>{rotulo}</OpcaoCaixa>
                        ))}
                        <p className="sq-rotulo vg-subrotulo">NÍVEL</p>
                        <div role="radiogroup" aria-label="Nível" className="vg-coluna">
                            <OpcaoSeta marcada={nivel === ""} aoMarcar={() => setNivel("")}>Todos os níveis</OpcaoSeta>
                            {Object.entries(NIVEIS_VAGA).map(([valor, rotulo]) => (
                                <OpcaoSeta key={valor} marcada={nivel === valor} aoMarcar={() => setNivel(valor)}>{rotulo}</OpcaoSeta>
                            ))}
                        </div>
                    </div>
                    <div className="sq-filtros__coluna" role="radiogroup" aria-label="Contrato">
                        <p className="sq-rotulo">CONTRATO</p>
                        <OpcaoSeta marcada={contrato === ""} aoMarcar={() => setContrato("")}>Todos os contratos</OpcaoSeta>
                        {Object.entries(TIPOS_CONTRATO).map(([valor, rotulo]) => (
                            <OpcaoSeta key={valor} marcada={contrato === valor} aoMarcar={() => setContrato(valor)}>{rotulo}</OpcaoSeta>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna">
                        <label className="sq-rotulo" htmlFor="busca-vagas">BUSCAR</label>
                        <span className="sq-busca">
                            <Search size={14} aria-hidden="true" />
                            <input id="busca-vagas" type="search" placeholder="Cargo, área ou habilidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
                        </span>
                        <label className="sq-rotulo vg-subrotulo" htmlFor="uf-vagas">UF E CIDADE</label>
                        <span className="vg-local">
                            <select id="uf-vagas" className="vg-select" aria-label="UF" value={uf} onChange={(e) => setUf(e.target.value)}>
                                <option value="">UF</option>
                                {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <span className="sq-busca">
                                <MapPin size={14} aria-hidden="true" />
                                <input type="search" aria-label="Cidade" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                            </span>
                        </span>
                    </div>
                    <div className="sq-filtros__acoes">
                        <p className="sq-rotulo">{todas ? `${todas.length} ABERTAS NO MURAL` : "MURAL"}</p>
                        {temFiltro ? <button type="button" className="sq-botao" onClick={limpar}>LIMPAR FILTROS</button> : null}
                    </div>
                </div>
            </section>

            <section className="sq-secao sq-resultados vg-resultados" data-revelar="fade">
                <p aria-live="polite">
                    <strong>{vagas ? <Contador valor={vagas.length} duracao={700} /> : "—"} {vagas?.length === 1 ? "vaga aberta" : "vagas abertas"}</strong>
                    {" · "}
                    {rapidos.map(([campo, valor, rotulo], i) => (
                        <React.Fragment key={valor}>
                            {i > 0 && ", "}
                            <button type="button" className="sq-link" aria-pressed={rapidoAtivo(campo, valor)} onClick={() => aplicarRapido(campo, valor)}>
                                {rotulo} ({contar(campo, valor)})
                            </button>
                        </React.Fragment>
                    ))}
                </p>
            </section>

            <div className="sq-secao vg-conteudo">
                <RgErro>{erro}</RgErro>
                {vagas === null && <EsqueletoLista rotulo="Carregando vagas" />}
                {vagas !== null && vagas.length === 0 && !erro && (
                    <Vazio icone={todas?.length ? Inbox : Briefcase} titulo={todas?.length ? "Nenhuma vaga com esses filtros" : "Nenhuma vaga aberta no momento"}>
                        {todas?.length ? "Tente outra modalidade ou limpe a busca." : "Novas oportunidades aparecem aqui assim que as instituições publicarem."}
                    </Vazio>
                )}
                {vagas?.length > 0 && atual && (
                    <div className="sq-mestre">
                        <ul key={filtros} className="sq-cartao sq-lista vg-lista" data-revelar aria-label="Vagas">
                            {vagas.map((v, i) => (
                                <LinhaVaga
                                    key={v.id}
                                    vaga={v}
                                    indice={i}
                                    atual={v.id === atual.id}
                                    aoEscolher={() => setSelecionada(v.id)}
                                    extra={minhas.has(v.id) ? <Chip tom={STATUS_CANDIDATURA[minhas.get(v.id).status]} ponto>{minhas.get(v.id).status}</Chip> : undefined}
                                />
                            ))}
                        </ul>
                        <DetalheVaga
                            vaga={atual}
                            candidatura={minhas.get(atual.id)}
                            pode={pode}
                            usuario={usuario}
                            aoCandidatar={candidatar}
                            aoDesistir={desistir}
                            aoVerCandidatos={aoVerCandidatos}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

/* ------------------------- Minhas vagas (contratante) ------------------------- */
function Candidatos({ vaga, aoMudarTotal }) {
    const [candidatos, setCandidatos] = useState(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        setCandidatos(null);
        api(`/vaga/${vaga.id}/candidaturas?per_page=100`).then((r) => setCandidatos(lista(r))).catch((e) => {
            setErro(e.message);
            setCandidatos([]);
        });
    }, [vaga.id]);

    const mudarStatus = async (candidatura, status) => {
        if (candidatura.status === status) return;
        setErro("");
        try {
            const atualizada = await api(`/candidatura/${candidatura.id}`, { method: "PATCH", body: { status } });
            setCandidatos((atual) => atual.map((c) => (c.id === candidatura.id ? { ...c, status: atualizada.status } : c)));
        } catch (e) {
            setErro(e.message);
        }
    };

    useEffect(() => {
        if (candidatos) aoMudarTotal?.(vaga.id, candidatos.length);
    }, [candidatos, vaga.id, aoMudarTotal]);

    if (candidatos === null) return <p className="rg-campo__ajuda" role="status">Carregando candidatos...</p>;

    return (
        <div className="vg-candidatos">
            <RgErro>{erro}</RgErro>
            {candidatos.length === 0 ? (
                <p className="rg-info">Nenhum candidato ainda. Quando alguém se candidatar, aparece aqui com o e-mail para contato.</p>
            ) : (
                <ul className="vg-candidatos__lista" aria-label={`Candidatos de ${vaga.titulo}`}>
                    {candidatos.map((c, i) => (
                        <li key={c.id} className="vg-candidato" style={{ "--i": i }}>
                            <div className="vg-candidato__topo">
                                <span className="vg-avatar" aria-hidden="true">{iniciais(c.usuario?.nome)}</span>
                                <span className="vg-candidato__nome">
                                    <strong>{c.usuario?.nome}</strong>
                                    <a href={`mailto:${c.usuario?.email}`}><Mail size={12} aria-hidden="true" /> {c.usuario?.email}</a>
                                </span>
                                <Chip tom={STATUS_CANDIDATURA[c.status]} ponto>{c.status}</Chip>
                            </div>
                            <div className="vg-decisao" role="radiogroup" aria-label={`Status de ${c.usuario?.nome}`}>
                                {STATUS_DECISAO.map((s) => (
                                    <button key={s} type="button" role="radio" aria-checked={c.status === s} className={`vg-decisao__botao vg-decisao__botao--${STATUS_CANDIDATURA[s]}`} onClick={() => mudarStatus(c, s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <span className="vg-candidato__data">Candidatura em {formatarData(c.data_candidatura)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function MinhasVagas({ cabecalho, vagaInicial }) {
    const [vagas, setVagas] = useState(null);
    const [erro, setErro] = useState("");
    const [selecionada, setSelecionada] = useState(vagaInicial);
    const [situacao, setSituacao] = useState("");
    const [busca, setBusca] = useState("");
    const [processando, setProcessando] = useState(false);

    useEffect(() => {
        api("/vaga/minhas?per_page=100").then((r) => setVagas(lista(r))).catch((e) => {
            setErro(e.message);
            setVagas([]);
        });
    }, []);

    const visiveis = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return (vagas ?? [])
            .filter((v) => !situacao || v.status === situacao)
            .filter((v) => !termo || `${v.titulo} ${v.tema ?? ""} ${v.cidade ?? ""}`.toLowerCase().includes(termo));
    }, [vagas, situacao, busca]);
    const atual = visiveis.find((v) => v.id === selecionada) ?? visiveis[0];
    const contar = (s) => (vagas ?? []).filter((v) => v.status === s).length;
    const totalCandidatos = (vagas ?? []).reduce((soma, v) => soma + (v.candidaturas_count ?? 0), 0);
    const atualizarTotal = useCallback((id, total) => setVagas((itens) => itens?.map((v) => (v.id === id && v.candidaturas_count !== total ? { ...v, candidaturas_count: total } : v))), []);

    const encerrar = async () => {
        if (!window.confirm(`Encerrar a vaga "${atual.titulo}"? Ela sai do mural e deixa de receber candidaturas.`)) return;
        setProcessando(true);
        try {
            const nova = await api(`/vaga/${atual.id}/encerrar`, { method: "POST" });
            setVagas((itens) => itens.map((v) => (v.id === nova.id ? { ...v, ...nova } : v)));
        } catch (e) {
            setErro(e.message);
        } finally {
            setProcessando(false);
        }
    };

    const excluir = async () => {
        if (!window.confirm(`Excluir a vaga "${atual.titulo}"? As candidaturas também serão apagadas.`)) return;
        try {
            await api(`/vaga/${atual.id}`, { method: "DELETE" });
            setVagas((itens) => itens.filter((v) => v.id !== atual.id));
        } catch (e) {
            setErro(e.message);
        }
    };

    const kpis = [
        ["VAGAS ABERTAS", contar("aberta")],
        ["ENCERRADAS", contar("encerrada")],
        ["CANDIDATURAS RECEBIDAS", totalCandidatos],
    ];

    return (
        <>
            <section className="sq-secao sq-topo">
                {cabecalho}
                <div className="sq-filtros vg-filtros" data-revelar style={{ "--atraso": "120ms" }}>
                    <div className="sq-filtros__coluna" role="radiogroup" aria-label="Situação">
                        <p className="sq-rotulo">SITUAÇÃO</p>
                        {[["", "Todas as minhas vagas"], ["aberta", "Abertas"], ["encerrada", "Encerradas"]].map(([valor, rotulo]) => (
                            <OpcaoCaixa key={valor} marcada={situacao === valor} aoMarcar={() => setSituacao(valor)}>{rotulo}</OpcaoCaixa>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna">
                        <label className="sq-rotulo" htmlFor="busca-minhas">BUSCAR</label>
                        <span className="sq-busca">
                            <Search size={14} aria-hidden="true" />
                            <input id="busca-minhas" type="search" placeholder="Título, área ou cidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
                        </span>
                    </div>
                    <div className="sq-filtros__acoes">
                        <p className="sq-rotulo">{vagas ? `${vagas.length} PUBLICADAS` : "PAINEL"}</p>
                        <Link to="/vagas/nova" className="sq-botao">PUBLICAR VAGA</Link>
                    </div>
                </div>
            </section>

            <div className="sq-secao vg-conteudo">
                <div className="sq-kpis vg-kpis">
                    {kpis.map(([rotulo, valor], i) => (
                        <div key={rotulo} className="sq-cartao sq-kpi" data-revelar style={{ "--atraso": `${i * 90}ms` }}>
                            <span className="sq-rotulo">{rotulo}</span>
                            <strong>{vagas ? <Contador valor={valor} duracao={900} /> : "—"}</strong>
                        </div>
                    ))}
                </div>

                <RgErro>{erro}</RgErro>
                {vagas === null && <EsqueletoLista rotulo="Carregando suas vagas" />}
                {vagas?.length === 0 && !erro && (
                    <Vazio icone={Briefcase} titulo="Você ainda não publicou vagas" acao={<Link to="/vagas/nova" className="sq-botao sq-botao--preto">PUBLICAR VAGA</Link>} />
                )}
                {vagas?.length > 0 && visiveis.length === 0 && <Vazio icone={Inbox} titulo="Nenhuma vaga com esses filtros" />}
                {atual && (
                    <div className="sq-mestre">
                        <ul key={`${situacao}-${busca}`} className="sq-cartao sq-lista vg-lista" data-revelar aria-label="Minhas vagas">
                            {visiveis.map((v, i) => (
                                <LinhaVaga
                                    key={v.id}
                                    vaga={v}
                                    indice={i}
                                    atual={v.id === atual.id}
                                    aoEscolher={() => setSelecionada(v.id)}
                                    extra={
                                        <span className="vg-contagem-candidatos">
                                            <Users size={13} aria-hidden="true" /> {v.candidaturas_count ?? 0}
                                            <Chip tom={v.aceita_candidaturas ? "sucesso" : "neutro"} ponto>{v.status_rotulo}</Chip>
                                        </span>
                                    }
                                />
                            ))}
                        </ul>

                        <aside key={atual.id} className="sq-detalhe sq-detalhe--troca" aria-label="Candidatos da vaga">
                            <CapaVaga vaga={atual} />
                            <div className="sq-detalhe__corpo">
                                <FichaVaga vaga={atual} />
                                <div>
                                    <p className="sq-rotulo vg-titulo-candidatos">CANDIDATOS ({atual.candidaturas_count ?? 0})</p>
                                    <Candidatos vaga={atual} aoMudarTotal={atualizarTotal} />
                                </div>
                                <div className="sq-linha">
                                    {atual.aceita_candidaturas && (
                                        <button type="button" className="sq-botao" disabled={processando} onClick={encerrar}>ENCERRAR VAGA</button>
                                    )}
                                    <button type="button" className="sq-botao sq-botao--perigo" onClick={excluir}>EXCLUIR</button>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </>
    );
}

/* ------------------------- Banco de currículos (contratante) ------------------------- */
function CartaoCurriculo({ curriculo, indice, destaque }) {
    return (
        <article className="vg-cv" data-revelar style={{ "--atraso": `${(indice % 3) * 90}ms` }}>
            <div className={`vg-cv__capa vg-cv__capa--${curriculo.modalidade_preferida ?? "qualquer"}`}>
                <span className="vg-cv__monograma" aria-hidden="true">{iniciais(curriculo.usuario?.nome)}</span>
                {curriculo.disponibilidade_rotulo && <span className="vg-cv__selo">{curriculo.disponibilidade_rotulo.toUpperCase()}</span>}
                {curriculo.modalidade_preferida_rotulo && <span className="vg-cv__modalidade">{curriculo.modalidade_preferida_rotulo.toUpperCase()}</span>}
            </div>
            <div className="sq-legenda vg-cv__legenda">
                <div className="vg-cv__nome">
                    <h3>{curriculo.usuario?.nome}</h3>
                    <span className="sq-rotulo">{curriculo.cargo ?? "Sem cargo informado"}</span>
                </div>
                <span className="sq-legenda__icone" title={localDe(curriculo)}><MapPin size={20} aria-hidden="true" /></span>
            </div>
            {curriculo.especialidades?.length > 0 && (
                <ul className="vg-chips vg-chips--claro" aria-label="Especialidades">
                    {curriculo.especialidades.map((e, i) => (
                        <li key={e} className={destaque && e.toLowerCase() === destaque.toLowerCase() ? "vg-chips__destaque" : ""} style={{ "--i": i }}>{e}</li>
                    ))}
                </ul>
            )}
            <dl className="vg-cv__ficha">
                <div><dt>LOCAL</dt><dd>{localDe(curriculo) || "—"}</dd></div>
                <div><dt>DISPONIBILIDADE</dt><dd>{curriculo.disponibilidade_rotulo ?? "—"}</dd></div>
                <div><dt>ATUALIZADO</dt><dd>{tempoRelativo(curriculo.atualizado_em) || "—"}</dd></div>
            </dl>
            {curriculo.texto && <p className="vg-cv__resumo">{curriculo.texto}</p>}
            <div className="vg-cv__acoes">
                {curriculo.portfolio_url && (
                    <a className="sq-botao" href={curriculo.portfolio_url} target="_blank" rel="noopener noreferrer">
                        PORTFÓLIO <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                )}
                {curriculo.contato?.email && (
                    <a className="sq-botao sq-botao--preto" href={`mailto:${curriculo.contato.email}`} aria-label={`Enviar e-mail para ${curriculo.usuario?.nome}`}>
                        <Mail size={16} aria-hidden="true" /> CONTATO
                    </a>
                )}
            </div>
        </article>
    );
}

function BancoCurriculos({ cabecalho }) {
    const [curriculos, setCurriculos] = useState(null);
    const [todos, setTodos] = useState(null);
    const [erro, setErro] = useState("");
    const [especialidade, setEspecialidade] = useState("");
    const [modalidade, setModalidade] = useState("");
    const [disponibilidade, setDisponibilidade] = useState("");
    const [busca, setBusca] = useState("");
    const [uf, setUf] = useState("");
    const termo = useAtrasado(busca.trim());

    useEffect(() => {
        api("/curriculo?per_page=100").then((r) => setTodos(lista(r))).catch(() => setTodos([]));
    }, []);

    const filtros = query({ q: termo, especialidade, modalidade, disponibilidade, uf, per_page: 100 });
    useEffect(() => {
        let ativo = true;
        setErro("");
        api(`/curriculo${filtros}`)
            .then((r) => ativo && setCurriculos(lista(r)))
            .catch((e) => {
                if (!ativo) return;
                setErro(e.message);
                setCurriculos([]);
            });
        return () => {
            ativo = false;
        };
    }, [filtros]);

    // Sugestões + especialidades informadas pelos candidatos.
    const especialidades = useMemo(() => {
        const extras = (todos ?? []).flatMap((c) => c.especialidades ?? []);
        const vistas = new Set();
        return [...ESPECIALIDADES_SUGERIDAS, ...extras].filter((e) => {
            const chave = e.toLowerCase();
            if (vistas.has(chave)) return false;
            vistas.add(chave);
            return true;
        });
    }, [todos]);
    const contarDisponibilidade = (d) => (todos ?? []).filter((c) => c.disponibilidade === d).length;
    const temFiltro = especialidade || modalidade || disponibilidade || busca || uf;

    return (
        <>
            <section className="sq-secao sq-topo">
                {cabecalho}
                <div className="sq-filtros vg-filtros" data-revelar style={{ "--atraso": "120ms" }}>
                    <div className="sq-filtros__coluna vg-coluna--larga" role="radiogroup" aria-label="Especialidade">
                        <p className="sq-rotulo">ESPECIALIDADE</p>
                        <OpcaoSeta marcada={especialidade === ""} aoMarcar={() => setEspecialidade("")}>Todas as especialidades</OpcaoSeta>
                        {especialidades.map((e) => (
                            <OpcaoSeta key={e} marcada={especialidade === e} aoMarcar={() => setEspecialidade(e)}>{e}</OpcaoSeta>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna" role="radiogroup" aria-label="Modalidade preferida">
                        <p className="sq-rotulo">MODALIDADE</p>
                        <OpcaoCaixa marcada={modalidade === ""} aoMarcar={() => setModalidade("")}>Qualquer</OpcaoCaixa>
                        {Object.entries(MODALIDADES_TRABALHO).map(([valor, rotulo]) => (
                            <OpcaoCaixa key={valor} marcada={modalidade === valor} aoMarcar={() => setModalidade(valor)}>{rotulo}</OpcaoCaixa>
                        ))}
                        <p className="sq-rotulo vg-subrotulo">DISPONIBILIDADE</p>
                        <div role="radiogroup" aria-label="Disponibilidade" className="vg-coluna">
                            <OpcaoCaixa marcada={disponibilidade === ""} aoMarcar={() => setDisponibilidade("")}>Qualquer prazo</OpcaoCaixa>
                            {Object.entries(DISPONIBILIDADES).map(([valor, rotulo]) => (
                                <OpcaoCaixa key={valor} marcada={disponibilidade === valor} aoMarcar={() => setDisponibilidade(valor)}>{rotulo}</OpcaoCaixa>
                            ))}
                        </div>
                    </div>
                    <div className="sq-filtros__coluna">
                        <label className="sq-rotulo" htmlFor="busca-banco">BUSCAR</label>
                        <span className="sq-busca">
                            <Search size={14} aria-hidden="true" />
                            <input id="busca-banco" type="search" placeholder="Cargo, ferramenta ou especialidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
                        </span>
                        <label className="sq-rotulo vg-subrotulo" htmlFor="uf-banco">UF</label>
                        <select id="uf-banco" className="vg-select" value={uf} onChange={(e) => setUf(e.target.value)}>
                            <option value="">Todas as UFs</option>
                            {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div className="sq-filtros__acoes">
                        <p className="sq-rotulo">{todos ? `${todos.length} CURRÍCULOS VISÍVEIS` : "BANCO"}</p>
                        {temFiltro ? (
                            <button type="button" className="sq-botao" onClick={() => { setEspecialidade(""); setModalidade(""); setDisponibilidade(""); setBusca(""); setUf(""); }}>LIMPAR FILTROS</button>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="sq-secao sq-resultados vg-resultados" data-revelar="fade">
                <p aria-live="polite">
                    <strong>{curriculos ? <Contador valor={curriculos.length} duracao={700} /> : "—"} {curriculos?.length === 1 ? "currículo encontrado" : "currículos encontrados"}</strong>
                    {" · "}
                    {Object.entries(DISPONIBILIDADES).map(([valor, rotulo], i) => (
                        <React.Fragment key={valor}>
                            {i > 0 && ", "}
                            <button type="button" className="sq-link" aria-pressed={disponibilidade === valor} onClick={() => setDisponibilidade((d) => (d === valor ? "" : valor))}>
                                {rotulo} ({contarDisponibilidade(valor)})
                            </button>
                        </React.Fragment>
                    ))}
                </p>
            </section>

            <div className="sq-secao vg-conteudo">
                <RgErro>{erro}</RgErro>
                {curriculos === null && (
                    <div className="vg-grade" aria-busy="true" aria-label="Carregando currículos">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="vg-cv">
                                <span className="esqueleto vg-cv__capa" />
                                <span className="esqueleto" style={{ height: 14, width: "65%" }} />
                                <span className="esqueleto" style={{ height: 12, width: "35%" }} />
                            </div>
                        ))}
                    </div>
                )}
                {curriculos?.length === 0 && !erro && (
                    <Vazio icone={Users} titulo={todos?.length ? "Nenhum currículo com esses filtros" : "Nenhum currículo visível no banco"}>
                        {todos?.length ? "Tente outra especialidade ou limpe a busca." : "Os currículos aparecem aqui quando as pessoas os deixam visíveis no banco."}
                    </Vazio>
                )}
                {curriculos?.length > 0 && (
                    <div key={filtros} className="vg-grade troca-suave">
                        {curriculos.map((c, i) => <CartaoCurriculo key={c.id} curriculo={c} indice={i} destaque={especialidade} />)}
                    </div>
                )}
            </div>
        </>
    );
}

/* ------------------------------ Página ------------------------------ */
const VISOES = [
    ["mural", "Mural de vagas"],
    ["minhas", "Minhas vagas"],
    ["banco", "Banco de currículos"],
];

export default function Vagas() {
    const { usuario, pode } = useAuth();
    const contratante = pode("contratante");
    const candidato = pode("candidato");
    const [visao, setVisao] = useState("mural");
    const [vagaFoco, setVagaFoco] = useState(null);

    const verCandidatos = useCallback((id) => {
        setVagaFoco(id);
        setVisao("minhas");
        const semMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo?.({ top: 0, behavior: semMovimento ? "auto" : "smooth" });
    }, []);

    const textos = {
        mural: candidato
            ? "Oportunidades em modelagem, pós-processamento, manutenção, pesquisa e educação publicadas por empresas, escolas e laboratórios verificados. Filtre por modalidade, contrato e nível e candidate-se com o currículo da plataforma."
            : "Oportunidades em manufatura aditiva e reciclagem publicadas por instituições verificadas. Filtre por área, modalidade, contrato, nível e local.",
        minhas: "Acompanhe as vagas que você publicou, veja quem se candidatou, responda cada pessoa e encerre a vaga quando ela for preenchida.",
        banco: "Pessoas que deixaram o currículo visível para empresas, escolas e laboratórios verificados. Busque por especialidade, UF, modalidade e disponibilidade e entre em contato.",
    };

    const cabecalho = (
        <>
            <div className="sq-topo__titulo" data-revelar>
                <h1>Vagas e banco de currículos.</h1>
                <p>{textos[contratante ? visao : "mural"]}</p>
            </div>
            {contratante && (
                <div className="sq-abas vg-visoes" role="tablist" aria-label="Visão">
                    {VISOES.map(([valor, rotulo]) => (
                        <button key={valor} type="button" role="tab" aria-selected={visao === valor} onClick={() => { setVagaFoco(null); setVisao(valor); }}>
                            {rotulo}
                        </button>
                    ))}
                </div>
            )}
        </>
    );

    const passos = contratante
        ? [
              ["01", "Publicar", "Descreva a vaga com modalidade, contrato, nível, local e habilidades."],
              ["02", "Receber", "Pessoas físicas se candidatam com o currículo da plataforma."],
              ["03", "Responder", "Marque cada candidatura como aprovada ou reprovada e encerre a vaga."],
          ]
        : [
              ["01", "Currículo", "Informe especialidades, portfólio, cidade e disponibilidade."],
              ["02", "Candidatar", "Filtre o mural e candidate-se às vagas abertas."],
              ["03", "Acompanhar", "Veja o status de cada candidatura em Meu currículo."],
          ];

    return (
        <div className="sq vg">
            <div key={visao} className="vg-visao">
                {(!contratante || visao === "mural") && <Mural cabecalho={cabecalho} pode={pode} usuario={usuario} aoVerCandidatos={verCandidatos} />}
                {contratante && visao === "minhas" && <MinhasVagas cabecalho={cabecalho} vagaInicial={vagaFoco} />}
                {contratante && visao === "banco" && <BancoCurriculos cabecalho={cabecalho} />}
            </div>

            {/* Section 04 — faixa preta com botão branco + passos */}
            <section className="sq-secao sq-faixa">
                <div className="sq-faixa__preta" data-revelar="esquerda">
                    <div>
                        <h2>{contratante ? "Contrate quem já imprime em 3D" : candidato ? "Seu currículo é a sua candidatura" : "Vagas para pessoas físicas"}</h2>
                        <p>
                            {contratante
                                ? "Publique vagas de modelagem, manutenção, pós-processamento ou pesquisa e encontre no banco de currículos pessoas com as especialidades de que você precisa."
                                : candidato
                                  ? "As instituições recebem o currículo cadastrado na plataforma. Mantenha especialidades, portfólio e disponibilidade em dia para aparecer nas buscas do banco de currículos."
                                  : "Somente pessoas físicas se candidatam às vagas. Instituições verificadas publicam vagas e consultam o banco de currículos."}
                        </p>
                    </div>
                    {contratante && <Link to="/vagas/nova" className="sq-botao sq-botao--branco">PUBLICAR VAGA</Link>}
                    {candidato && <Link to="/curriculo" className="sq-botao sq-botao--branco">MANTER MEU CURRÍCULO</Link>}
                </div>
                <ol className="sq-faixa__passos" data-revelar="direita" style={{ "--atraso": "120ms" }}>
                    {passos.map(([n, titulo, texto], i) => (
                        <li key={n} style={{ "--i": i }}>
                            <span>{n}</span>
                            <strong>{titulo}</strong>
                            <p>{texto}</p>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}
