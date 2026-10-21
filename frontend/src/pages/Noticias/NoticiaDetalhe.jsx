import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Lightbulb, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import { BotaoDenunciar, BotoesModeracao } from "../../components/Curadoria";
import { Aviso, Carregando } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { api, lista } from "../../services/api";
import { formatarData, iniciais, STATUS_PUBLICACAO, tempoRelativo } from "../../utils/formatar";
import { Cabecalho, imagemDe, minutosDeLeitura, Tag } from "./Jornal";
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
    const [outras, setOutras] = useState([]);
    const [temas, setTemas] = useState([]);

    const carregarReacoes = useCallback(() => api(`/noticia/${id}/reacoes?per_page=50`).then(setReacoes).catch(() => {}), [id]);

    useEffect(() => {
        api(`/noticia/${id}`).then(setNoticia).catch((e) => setErro(e.message));
        carregarReacoes();
        api("/noticia?per_page=100")
            .then((r) => {
                const todas = lista(r);
                setOutras(todas.filter((n) => String(n.id) !== String(id)).slice(0, 3));
                setTemas([...new Set(todas.map((n) => n.tema).filter(Boolean))]);
            })
            .catch(() => {});
    }, [id, carregarReacoes]);

    if (erro) return <div className="container" style={{ paddingTop: 40 }}><Aviso tom="perigo">{erro}</Aviso></div>;
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
        <div className="nyt">
            <div className="nyt__pagina">
                <Cabecalho temas={temas} />

                <div className="nyt-materia">
                    <article className="nyt-materia__artigo">
                        <Link to="/noticias" className="nyt-materia__voltar">
                            <ArrowLeft size={12} aria-hidden="true" /> TODAS AS NOTÍCIAS
                        </Link>

                        {noticia.status !== "publicado" && (
                            <Aviso tom={noticia.status === "rejeitado" ? "perigo" : "alerta"}>
                                <strong>{status.rotulo}.</strong>{" "}
                                {noticia.status === "rejeitado" ? `Motivo: ${noticia.motivo_rejeicao}` : "Só você e a curadoria veem esta notícia até a aprovação."}
                            </Aviso>
                        )}

                        <p className="nyt-tags">
                            <Tag forte>{(noticia.tema ?? "NOTÍCIA").toUpperCase()}</Tag>
                            <Tag claro>{minutosDeLeitura(noticia.texto)}</Tag>
                        </p>
                        <h1>{noticia.titulo}</h1>

                        <div className="nyt-materia__linha">
                            <span className="nyt-materia__autor">
                                <span className="nyt-coluna__avatar">{iniciais(noticia.usuario?.nome)}</span>
                                <span>
                                    Por <strong>{noticia.usuario?.nome ?? "Redação EcoHub"}</strong>
                                    <br />
                                    {formatarData(noticia.data_publicacao, { weekday: "long", month: "long" })}
                                </span>
                            </span>
                            <span className="nyt-materia__acoes">
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
                            <div className="nyt-materia__curadoria">
                                <p className="nyt-rotulo" style={{ marginBottom: 12 }}>Curadoria</p>
                                <BotoesModeracao recurso="noticia" id={noticia.id} aoDecidir={setNoticia} />
                            </div>
                        )}

                        <figure className="nyt-foto">
                            <img src={imagemDe(noticia)} alt="" />
                            <figcaption>{noticia.usuario?.nome ?? "Redação EcoHub"}/EcoHub Notícias</figcaption>
                        </figure>

                        <div className="nyt-materia__corpo materia__corpo">{noticia.texto}</div>

                        {noticia.status === "publicado" && (
                            <section className="nyt-reacoes" aria-labelledby="titulo-reacoes">
                                <h2 id="titulo-reacoes" className="nyt-rotulo">Reações e comentários</h2>
                                <div className="nyt-reacoes__botoes">
                                    {REACOES.map(({ tipo, rotulo, icone: Icone }) => (
                                        <button key={tipo} type="button" aria-pressed={minhaReacao?.tipo_reacao === tipo} onClick={() => reagir(tipo)}>
                                            <Icone size={16} aria-hidden="true" />
                                            {rotulo} · {reacoes.totais[tipo] ?? 0}
                                        </button>
                                    ))}
                                </div>
                                <div className="nyt-comentar">
                                    <label htmlFor="comentario" className="sr-only">Comentário</label>
                                    <input id="comentario" maxLength={255} placeholder="Deixe um comentário curto com sua reação" value={comentario} onChange={(e) => setComentario(e.target.value)} />
                                    <button type="button" className="nyt-botao" disabled={!comentario.trim()} onClick={() => reagir(minhaReacao?.tipo_reacao ?? "curtir")}>
                                        COMENTAR
                                    </button>
                                </div>
                                <ul className="nyt-comentarios">
                                    {reacoes.reacoes.data.filter((r) => r.comentarios).map((r) => (
                                        <li key={r.id}>
                                            <strong>{r.usuario?.nome}</strong> <span>· {tempoRelativo(r.data_reacao)}</span>
                                            <p>{r.comentarios}</p>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </article>

                    <aside className="nyt__lateral" aria-label="Mais notícias">
                        <section className="nyt-perdido">
                            <h2 className="nyt-rotulo">Você pode ter perdido</h2>
                            <p className="nyt-perdido__sub">Seleção da redação do EcoHub para você</p>
                            {outras.map((outra, i) => (
                                <article key={outra.id} className="nyt-coluna nyt-coluna--alta">
                                    <div>
                                        <h3>
                                            <Link to={`/noticias/${outra.id}`}>{outra.titulo}</Link>
                                        </h3>
                                        <Tag>{minutosDeLeitura(outra.texto)}</Tag>
                                    </div>
                                    <img src={imagemDe(outra, i)} alt="" loading="lazy" />
                                </article>
                            ))}
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
