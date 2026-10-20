import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";
import { Carregando, Vazio } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { api, lista } from "../../services/api";
import { AREAS_PROJETO, formatarData, tempoRelativo } from "../../utils/formatar";
import "../../styles/pages/noticias.css";

const resumir = (texto, tamanho) => (texto.length > tamanho ? `${texto.slice(0, tamanho).trim()}…` : texto);

function Credito({ noticia }) {
    return (
        <p className="credito">
            {noticia.usuario?.nome ?? "Redação EcoHub"} · {tempoRelativo(noticia.data_publicacao)}
        </p>
    );
}

export default function Noticias() {
    const { pode } = useAuth();
    const [noticias, setNoticias] = useState([]);
    const [projetos, setProjetos] = useState([]);
    const [editoria, setEditoria] = useState("Todas");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        Promise.allSettled([api("/noticia?per_page=50"), api("/projeto?per_page=5")]).then(([n, p]) => {
            if (n.status === "fulfilled") setNoticias(lista(n.value));
            if (p.status === "fulfilled") setProjetos(lista(p.value));
            setCarregando(false);
        });
    }, []);

    const editorias = useMemo(() => ["Todas", ...new Set(noticias.map((n) => n.tema).filter(Boolean))], [noticias]);
    const filtradas = editoria === "Todas" ? noticias : noticias.filter((n) => n.tema === editoria);
    const [manchete, ...demais] = filtradas;
    const secundarias = demais.slice(0, 3);
    const colunas = demais.slice(3);

    return (
        <div className="jornal">
            <div className="container jornal__topo">
                <div className="jornal__barra">
                    <span>{formatarData(new Date(), { weekday: "long", month: "long" })}</span>
                    <div className="linha">
                        {pode("publicador") && (
                            <Link to="/noticias/nova" className="botao botao--escuro botao--pequeno">
                                <PenLine size={14} aria-hidden="true" /> Escrever notícia
                            </Link>
                        )}
                        <Link to="/noticias/minhas" className="botao botao--secundario botao--pequeno">
                            Minhas publicações
                        </Link>
                    </div>
                </div>

                <header className="jornal__cabecalho">
                    <h1 className="jornal__nome">EcoHub Notícias</h1>
                    <p className="jornal__slogan">Pesquisa, mercado e educação na impressão 3D sustentável</p>
                </header>
                <div className="jornal__edicao">
                    <span>Ponta Grossa · Paraná</span>
                    <span>Edição digital</span>
                    <span>{noticias.length} reportagens</span>
                </div>

                <nav className="editorias" aria-label="Editorias">
                    {editorias.map((nome) => (
                        <button key={nome} type="button" aria-pressed={editoria === nome} onClick={() => setEditoria(nome)}>
                            {nome}
                        </button>
                    ))}
                </nav>

                {carregando && <Carregando texto="Montando a edição..." />}
                {!carregando && !manchete && <Vazio titulo="Nenhuma notícia nesta editoria">As notícias aparecem aqui depois de aprovadas pela curadoria.</Vazio>}

                {manchete && (
                    <div className="capa">
                        <div>
                            <div className="capa__principal">
                                <article className="manchete">
                                    <Link to={`/noticias/${manchete.id}`}>
                                        <div className="manchete__ilustracao" aria-hidden="true">
                                            {manchete.tema}
                                        </div>
                                        <span className="chapeu">{manchete.tema}</span>
                                        <h2 className="materia-titulo">{manchete.titulo}</h2>
                                        <p className="resumo">{resumir(manchete.texto, 260)}</p>
                                    </Link>
                                    <Credito noticia={manchete} />
                                </article>

                                <ul className="secundarias">
                                    {secundarias.map((noticia) => (
                                        <li key={noticia.id}>
                                            <Link to={`/noticias/${noticia.id}`}>
                                                <span className="chapeu">{noticia.tema}</span>
                                                <h3 className="materia-titulo">{noticia.titulo}</h3>
                                                <p className="resumo">{resumir(noticia.texto, 140)}</p>
                                            </Link>
                                            <Credito noticia={noticia} />
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {colunas.length > 0 && (
                                <div className="colunas">
                                    {colunas.map((noticia) => (
                                        <article key={noticia.id}>
                                            <Link to={`/noticias/${noticia.id}`}>
                                                <span className="chapeu">{noticia.tema}</span>
                                                <h3 className="materia-titulo">{noticia.titulo}</h3>
                                                <p className="resumo">{resumir(noticia.texto, 120)}</p>
                                            </Link>
                                            <Credito noticia={noticia} />
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>

                        <aside className="lateral" aria-labelledby="titulo-repositorio">
                            <h2 id="titulo-repositorio">Do repositório</h2>
                            <ul>
                                {projetos.map((projeto) => (
                                    <li key={projeto.id}>
                                        <Link to={`/projetos/${projeto.id}`}>
                                            <span className="chapeu">{AREAS_PROJETO[projeto.area] ?? "Projeto"}</span>
                                            <h3>{projeto.titulo}</h3>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/projetos" className="botao botao--secundario botao--bloco">
                                Ver todos os projetos
                            </Link>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}
