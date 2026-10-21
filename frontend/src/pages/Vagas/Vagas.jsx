import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, CalendarDays, MapPin, Plus, Search, Trash2, Users } from "lucide-react";
import Carrossel from "../../components/Carrossel";
import { Aviso, CabecalhoPagina, Carregando, Chip, Vazio } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { api, lista } from "../../services/api";
import { formatarData, formatarDia, iniciais, tempoRelativo } from "../../utils/formatar";
import "../../styles/pages/vagas.css";

// Contratantes veem a lista geral sem a ação de candidatura (função estável, fora do render).
const NINGUEM_PODE = () => false;

const STATUS_CANDIDATURA = { "Em análise": "alerta", Aprovada: "sucesso", Reprovada: "perigo", Cancelada: "neutro" };

/* ---------- Visão do candidato (pessoa física) ---------- */
function VisaoCandidato({ pode }) {
    const [vagas, setVagas] = useState(null);
    const [minhas, setMinhas] = useState(new Map());
    const [busca, setBusca] = useState("");
    const [tema, setTema] = useState("");
    const [selecionada, setSelecionada] = useState(null);
    const [mensagem, setMensagem] = useState(null);

    useEffect(() => {
        api("/vaga?per_page=100").then((r) => setVagas(lista(r))).catch(() => setVagas([]));
        if (pode("candidato")) {
            api("/candidatura").then((r) => setMinhas(new Map(lista(r).map((c) => [c.id_vaga, c])))).catch(() => {});
        }
    }, [pode]);

    const temas = useMemo(() => [...new Set((vagas ?? []).map((v) => v.tema).filter(Boolean))], [vagas]);
    const filtradas = (vagas ?? []).filter((v) => (!tema || v.tema === tema) && (!busca || `${v.titulo} ${v.cidade ?? ""} ${v.usuario?.nome ?? ""}`.toLowerCase().includes(busca.toLowerCase())));
    const atual = filtradas.find((v) => v.id === selecionada) ?? filtradas[0];
    const candidatura = atual && minhas.get(atual.id);

    const candidatar = async () => {
        try {
            const nova = await api("/candidatura", { method: "POST", body: { id_vaga: atual.id } });
            setMinhas((mapa) => new Map(mapa).set(atual.id, nova));
            setMensagem({ tom: "sucesso", texto: "Candidatura enviada! Acompanhe o status por aqui." });
        } catch (e) {
            setMensagem({ tom: "perigo", texto: e.message });
        }
    };

    const desistir = async () => {
        await api(`/candidatura/${candidatura.id}`, { method: "DELETE" });
        setMinhas((mapa) => {
            const copia = new Map(mapa);
            copia.delete(atual.id);
            return copia;
        });
    };

    if (vagas === null) return <Carregando texto="Carregando vagas..." />;

    return (
        <>
            <div className="barra-ferramentas linha" style={{ margin: "0 0 var(--esp-6)" }} data-revelar="fade">
                <label className="busca-grande" style={{ margin: 0, flex: 1, boxShadow: "none", padding: "4px 16px" }}>
                    <Search size={16} aria-hidden="true" />
                    <span className="sr-only">Buscar vagas</span>
                    <input placeholder="Cargo, cidade ou instituição" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </label>
                <div className="linha" role="group" aria-label="Área">
                    <button type="button" className="chip-filtro" aria-pressed={tema === ""} onClick={() => setTema("")}>Todas</button>
                    {temas.map((t) => (
                        <button key={t} type="button" className="chip-filtro" aria-pressed={tema === t} onClick={() => setTema(t)}>{t}</button>
                    ))}
                </div>
            </div>

            {filtradas.length === 0 ? (
                <Vazio icone={Briefcase} titulo="Nenhuma vaga encontrada" />
            ) : (
                <div className="vagas">
                    <div className="vagas__lista">
                        {filtradas.map((vaga, i) => (
                            <div key={vaga.id} data-revelar style={{ "--atraso": `${Math.min(i, 8) * 70}ms` }}>
                            <button type="button" className="vaga-item" aria-pressed={vaga.id === atual.id} onClick={() => { setSelecionada(vaga.id); setMensagem(null); }}>
                                <div className="linha linha--entre">
                                    <span className="sobrelinha">{vaga.tema ?? "Vaga"}</span>
                                    {minhas.has(vaga.id) && <Chip tom={STATUS_CANDIDATURA[minhas.get(vaga.id).status]} ponto>{minhas.get(vaga.id).status}</Chip>}
                                </div>
                                <h3>{vaga.titulo}</h3>
                                <div className="vaga-item__meta">
                                    <span><Building2 size={13} aria-hidden="true" /> {vaga.usuario?.nome}</span>
                                    {vaga.cidade && <span><MapPin size={13} aria-hidden="true" /> {vaga.cidade}</span>}
                                    <span><CalendarDays size={13} aria-hidden="true" /> {tempoRelativo(vaga.data_publicacao)}</span>
                                </div>
                            </button>
                            </div>
                        ))}
                    </div>

                    <article key={atual.id} className="cartao vaga-detalhe troca-suave" aria-live="polite">
                        <span className="sobrelinha">{atual.tema ?? "Vaga"}</span>
                        <h2>{atual.titulo}</h2>
                        <div className="vaga-item__meta" style={{ marginTop: "var(--esp-3)" }}>
                            <span><Building2 size={13} aria-hidden="true" /> {atual.usuario?.nome}</span>
                            {atual.cidade && <span><MapPin size={13} aria-hidden="true" /> {atual.cidade}{atual.cep && ` · CEP ${atual.cep}`}</span>}
                            <span><CalendarDays size={13} aria-hidden="true" /> Publicada em {formatarData(atual.data_publicacao)}</span>
                        </div>

                        <div className="linha" style={{ marginTop: "var(--esp-6)" }}>
                            {pode("candidato") && !candidatura && <button type="button" className="botao botao--grande" onClick={candidatar}>Candidatar-se</button>}
                            {candidatura && (
                                <>
                                    <Chip tom={STATUS_CANDIDATURA[candidatura.status]} ponto>Sua candidatura: {candidatura.status}</Chip>
                                    {candidatura.status === "Em análise" && <button type="button" className="botao botao--secundario botao--pequeno" onClick={desistir}>Desistir</button>}
                                </>
                            )}
                            {!pode("candidato") && <Aviso tom="info">Somente pessoas físicas se candidatam a vagas.</Aviso>}
                        </div>
                        {mensagem && <div style={{ marginTop: "var(--esp-4)" }}><Aviso tom={mensagem.tom}>{mensagem.texto}</Aviso></div>}

                        <div className="vaga-detalhe__texto">{atual.texto}</div>
                    </article>
                </div>
            )}
        </>
    );
}

/* ---------- Visão do contratante (instituição verificada) ---------- */
function Candidatos({ vaga }) {
    const [candidatos, setCandidatos] = useState(null);

    useEffect(() => {
        api(`/vaga/${vaga.id}/candidaturas?per_page=100`).then((r) => setCandidatos(lista(r))).catch(() => setCandidatos([]));
    }, [vaga.id]);

    const mudarStatus = async (candidatura, status) => {
        const atualizada = await api(`/candidatura/${candidatura.id}`, { method: "PATCH", body: { status } });
        setCandidatos((atual) => atual.map((c) => (c.id === candidatura.id ? { ...c, status: atualizada.status } : c)));
    };

    if (candidatos === null) return <Carregando />;
    if (candidatos.length === 0) return <Vazio icone={Users} titulo="Nenhum candidato ainda" />;

    return (
        <ul className="pilha">
            {candidatos.map((c, i) => (
                <li key={c.id} className="linha linha--entre candidato-linha" style={{ "--atraso": `${i * 60}ms` }}>
                    <span className="linha">
                        <span className="avatar">{iniciais(c.usuario?.nome)}</span>
                        <span>
                            <strong>{c.usuario?.nome}</strong>
                            <br />
                            <a href={`mailto:${c.usuario?.email}`} className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>{c.usuario?.email}</a>
                        </span>
                    </span>
                    <select className="entrada" style={{ width: 160 }} aria-label={`Status de ${c.usuario?.nome}`} value={c.status} onChange={(e) => mudarStatus(c, e.target.value)}>
                        {Object.keys(STATUS_CANDIDATURA).map((s) => <option key={s}>{s}</option>)}
                    </select>
                </li>
            ))}
        </ul>
    );
}

function BancoCurriculos() {
    const [curriculos, setCurriculos] = useState(null);
    useEffect(() => {
        api("/curriculo?per_page=100").then((r) => setCurriculos(lista(r))).catch(() => setCurriculos([]));
    }, []);

    if (curriculos === null) return <Carregando />;
    if (curriculos.length === 0) return <Vazio icone={Users} titulo="Nenhum currículo cadastrado" />;

    return (
        <Carrossel rotulo="Banco de currículos" automatico={7000} classe="carrossel-curriculos">
            {curriculos.map((c) => (
                <article key={c.id} className="cartao curriculo-cartao eleva">
                    <div className="linha">
                        <span className="avatar avatar--grande">{iniciais(c.usuario?.nome)}</span>
                        <div>
                            <strong>{c.usuario?.nome}</strong>
                            <div className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>{c.cargo}</div>
                        </div>
                    </div>
                    <p style={{ fontSize: "var(--texto-sm)" }}>{c.texto}</p>
                    {c.habilidades && (
                        <div className="linha" style={{ gap: "var(--esp-2)" }}>
                            {c.habilidades.split(",").map((h) => <Chip key={h}>{h.trim()}</Chip>)}
                        </div>
                    )}
                </article>
            ))}
        </Carrossel>
    );
}

function VisaoContratante() {
    const [aba, setAba] = useState("vagas");
    const [vagas, setVagas] = useState(null);
    const [selecionada, setSelecionada] = useState(null);

    const carregar = useCallback(() => api("/vaga/minhas?per_page=100").then((r) => setVagas(lista(r))).catch(() => setVagas([])), []);
    useEffect(() => {
        carregar();
    }, [carregar]);

    const excluir = async (vaga) => {
        if (!window.confirm(`Excluir a vaga "${vaga.titulo}"? As candidaturas também serão apagadas.`)) return;
        await api(`/vaga/${vaga.id}`, { method: "DELETE" });
        setVagas((atual) => atual.filter((v) => v.id !== vaga.id));
    };

    const atual = vagas?.find((v) => v.id === selecionada) ?? vagas?.[0];

    return (
        <>
            <div className="abas" role="tablist" style={{ marginBottom: "var(--esp-6)" }}>
                {[["vagas", "Minhas vagas"], ["curriculos", "Banco de currículos"], ["todas", "Todas as vagas"]].map(([valor, rotulo]) => (
                    <button key={valor} type="button" role="tab" aria-selected={aba === valor} onClick={() => setAba(valor)}>{rotulo}</button>
                ))}
            </div>

            <div key={aba} className="troca-suave">
            {aba === "curriculos" && <BancoCurriculos />}
            {aba === "todas" && <VisaoCandidato pode={NINGUEM_PODE} />}
            {aba === "vagas" && vagas === null && <Carregando />}
            {aba === "vagas" && vagas?.length === 0 && (
                <Vazio icone={Briefcase} titulo="Você ainda não publicou vagas" acao={<Link to="/vagas/nova" className="botao">Publicar vaga</Link>} />
            )}
            {aba === "vagas" && vagas?.length > 0 && (
                <div className="vagas">
                    <div className="tabela-container">
                        <table className="tabela">
                            <thead>
                                <tr><th>Vaga</th><th>Candidatos</th><th>Publicada</th><th /></tr>
                            </thead>
                            <tbody>
                                {vagas.map((vaga, i) => (
                                    <tr key={vaga.id} className="linha-entra" aria-selected={vaga.id === atual?.id} onClick={() => setSelecionada(vaga.id)} style={{ cursor: "pointer", "--atraso": `${i * 60}ms` }}>
                                        <td><strong>{vaga.titulo}</strong><br /><span className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>{vaga.tema}</span></td>
                                        <td><Chip tom="primaria">{vaga.candidaturas_count ?? 0}</Chip></td>
                                        <td className="texto-suave">{formatarDia(vaga.data_publicacao?.slice(0, 10))}</td>
                                        <td>
                                            <button type="button" className="botao botao--fantasma botao--pequeno" aria-label={`Excluir ${vaga.titulo}`} onClick={(e) => { e.stopPropagation(); excluir(vaga); }}>
                                                <Trash2 size={14} aria-hidden="true" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {atual && (
                        <section key={atual.id} className="cartao vaga-detalhe troca-suave" aria-label="Candidatos">
                            <span className="sobrelinha">Candidatos</span>
                            <h2 style={{ marginBottom: "var(--esp-6)" }}>{atual.titulo}</h2>
                            <Candidatos vaga={atual} />
                        </section>
                    )}
                </div>
            )}
            </div>
        </>
    );
}

export default function Vagas() {
    const { pode } = useAuth();
    const contratante = pode("contratante");

    return (
        <div className="container">
            <CabecalhoPagina
                sobrelinha="Banco de currículos e vagas"
                titulo={contratante ? "Painel do contratante" : "Vagas em manufatura aditiva"}
                descricao={contratante ? "Publique vagas, acompanhe candidaturas e consulte o banco de currículos." : "Oportunidades em modelagem, pós-processamento, manutenção, pesquisa e educação."}
            >
                {contratante && <Link to="/vagas/nova" className="botao"><Plus size={16} aria-hidden="true" /> Publicar vaga</Link>}
                {pode("candidato") && <Link to="/curriculo" className="botao botao--secundario">Meu currículo</Link>}
            </CabecalhoPagina>
            {contratante ? <VisaoContratante /> : <VisaoCandidato pode={pode} />}
        </div>
    );
}
