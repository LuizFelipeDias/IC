import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Lightbulb, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import { BotaoDenunciar, BotoesModeracao } from "../../components/Curadoria";
import { Aviso, Carregando, Chip } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import { formatarData, iniciais, STATUS_PUBLICACAO, tempoRelativo } from "../../utils/formatar";
import "../../styles/pages/noticias.css";

const REACOES = [
    { tipo: "curtir", rotulo: "Curtir", icone: Heart },
    { tipo: "util", rotulo: "Útil", icone: ThumbsUp },
    { tipo: "inspirador", rotulo: "Inspirador", icone: Lightbulb },
];

export default function NoticiaDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario, pode } = useAuth();
    const [noticia, setNoticia] = useState(null);
    const [reacoes, setReacoes] = useState({ totais: {}, reacoes: { data: [] } });
    const [comentario, setComentario] = useState("");
    const [erro, setErro] = useState("");

    const carregarReacoes = useCallback(() => api(`/noticia/${id}/reacoes?per_page=50`).then(setReacoes).catch(() => {}), [id]);

    useEffect(() => {
        api(`/noticia/${id}`).then(setNoticia).catch((e) => setErro(e.message));
        carregarReacoes();
    }, [id, carregarReacoes]);

    if (erro) return <div className="container materia"><Aviso tom="perigo">{erro}</Aviso></div>;
    if (!noticia) return <Carregando />;

    const minhaReacao = reacoes.reacoes.data.find((r) => r.id_usuario === usuario?.id);
    const autor = noticia.id_usuario === usuario?.id;
    const status = STATUS_PUBLICACAO[noticia.status];

    const reagir = async (tipo) => {
        if (minhaReacao?.tipo_reacao === tipo && !comentario) {
            await api(`/noticia/${id}/reacao`, { method: "DELETE" });
        } else {
            await api(`/noticia/${id}/reacao`, { method: "PUT", body: { tipo_reacao: tipo, comentarios: comentario || minhaReacao?.comentarios || null } });
        }
        setComentario("");
        carregarReacoes();
    };

    const excluir = async () => {
        if (!window.confirm("Excluir esta notícia?")) return;
        await api(`/noticia/${id}`, { method: "DELETE" });
        navigate("/noticias", { replace: true });
    };

    return (
        <div className="jornal">
            <article className="container materia">
                <Link to="/noticias" className="botao botao--fantasma botao--pequeno">
                    <ArrowLeft size={14} aria-hidden="true" /> EcoHub Notícias
                </Link>

                {noticia.status !== "publicado" && (
                    <div style={{ marginTop: "var(--esp-6)" }}>
                        <Aviso tom={noticia.status === "rejeitado" ? "perigo" : "alerta"}>
                            <strong>{status.rotulo}.</strong>{" "}
                            {noticia.status === "rejeitado" ? `Motivo: ${noticia.motivo_rejeicao}` : "Só você e a curadoria veem esta notícia até a aprovação."}
                        </Aviso>
                    </div>
                )}

                <span className="chapeu" style={{ marginTop: "var(--esp-8)" }}>
                    {noticia.tema}
                </span>
                <h1>{noticia.titulo}</h1>
                <div className="materia__linha-fina linha linha--entre">
                    <span className="linha">
                        <span className="avatar">{iniciais(noticia.usuario?.nome)}</span>
                        <span>
                            Por <strong>{noticia.usuario?.nome ?? "Redação EcoHub"}</strong>
                            <br />
                            {formatarData(noticia.data_publicacao, { weekday: "long", month: "long" })}
                        </span>
                    </span>
                    <span className="linha">
                        {(autor || pode("moderador")) && (
                            <>
                                <Link to={`/noticias/${id}/editar`} className="botao botao--secundario botao--pequeno">
                                    <Pencil size={14} aria-hidden="true" /> Editar
                                </Link>
                                <button type="button" className="botao botao--perigo botao--pequeno" onClick={excluir}>
                                    <Trash2 size={14} aria-hidden="true" /> Excluir
                                </button>
                            </>
                        )}
                        {noticia.status === "publicado" && !autor && <BotaoDenunciar tipo="noticia" id={noticia.id} />}
                    </span>
                </div>

                {pode("moderador") && noticia.status === "em_revisao" && !autor && (
                    <div className="cartao cartao--padding" style={{ marginTop: "var(--esp-6)" }}>
                        <p className="sobrelinha" style={{ marginBottom: "var(--esp-3)" }}>Curadoria</p>
                        <BotoesModeracao recurso="noticia" id={noticia.id} aoDecidir={setNoticia} />
                    </div>
                )}

                <div className="materia__corpo">{noticia.texto}</div>

                {noticia.status === "publicado" && (
                    <section aria-labelledby="titulo-reacoes">
                        <h2 id="titulo-reacoes" className="sr-only">Reações</h2>
                        <div className="reacoes">
                            {REACOES.map(({ tipo, rotulo, icone: Icone }) => (
                                <button key={tipo} type="button" className="chip-filtro" aria-pressed={minhaReacao?.tipo_reacao === tipo} onClick={() => reagir(tipo)}>
                                    <Icone size={14} aria-hidden="true" style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} />
                                    {rotulo} · {reacoes.totais[tipo] ?? 0}
                                </button>
                            ))}
                        </div>
                        <div className="linha" style={{ marginTop: "var(--esp-4)" }}>
                            <label htmlFor="comentario" className="sr-only">Comentário</label>
                            <input id="comentario" className="entrada" style={{ flex: 1 }} maxLength={255} placeholder="Deixe um comentário curto com sua reação" value={comentario} onChange={(e) => setComentario(e.target.value)} />
                            <button type="button" className="botao botao--escuro" disabled={!comentario.trim()} onClick={() => reagir(minhaReacao?.tipo_reacao ?? "curtir")}>
                                Comentar
                            </button>
                        </div>
                        <ul className="comentarios" style={{ marginTop: "var(--esp-4)" }}>
                            {reacoes.reacoes.data.filter((r) => r.comentarios).map((r) => (
                                <li key={r.id}>
                                    <strong>{r.usuario?.nome}</strong> <span className="texto-suave">· {tempoRelativo(r.data_reacao)}</span>
                                    <p>{r.comentarios}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                {status && noticia.status === "publicado" && (
                    <p style={{ marginTop: "var(--esp-6)" }}>
                        <Chip tom={status.tom}>{status.rotulo}</Chip>
                    </p>
                )}
            </article>
        </div>
    );
}
