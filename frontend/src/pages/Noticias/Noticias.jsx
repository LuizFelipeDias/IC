import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, CirclePlay, VolumeX } from "lucide-react";
import { Vazio } from "../../components/ui";
import { api, lista } from "../../services/api";
import { AREAS_PROJETO, iniciais, tempoRelativo } from "../../utils/formatar";
import { Cabecalho, doisParagrafos, imagemDe, minutosDeLeitura, resumir, RodapeJornal, Tag } from "./Jornal";
import "../../styles/pages/noticias.css";

/*
 * Portal de notícias — clone do frame "NYTimes Home Page" (Figma 1:131, 1440 px):
 * coluna principal de 976 px (1:132), fio vertical (1:284) e barra lateral de
 * 335 px (1:285); depois as grades de 4 colunas (1:406, 1:440), as faixas
 * cinza (1:437, 1:471) e o rodapé do jornal (1:482, 1:588).
 */

const urlDe = (noticia) => `/noticias/${noticia.id}`;
const autorDe = (noticia) => noticia.usuario?.nome ?? "Redação EcoHub";

/** "Head Pic": foto 592 × 356 com crédito alinhado à direita. */
function Foto({ noticia, src, legenda = true, className = "" }) {
    return (
        <figure className={`nyt-foto ${className}`}>
            <span className="nyt-foto__quadro">
                <img src={src} alt="" loading="lazy" />
            </span>
            {legenda && <figcaption>{autorDe(noticia)}/EcoHub Notícias</figcaption>}
        </figure>
    );
}

/** "Headline 1/2/3" (1:133, 1:156, 1:239): título e resumo à esquerda, foto à direita. */
function Manchete({ noticia, foto, grande = false, className = "" }) {
    const [p1, p2] = doisParagrafos(resumir(noticia.texto, 420));
    return (
        <article className={`nyt-manchete ${grande ? "nyt-manchete--grande" : ""} ${className}`} data-revelar>
            <div className="nyt-manchete__texto">
                <h2>
                    <Link to={urlDe(noticia)}>{noticia.titulo}</Link>
                </h2>
                <p>{p1}</p>
                {grande && p2 && <p>{p2}</p>}
                <Tag>{minutosDeLeitura(noticia.texto)}</Tag>
            </div>
            <Link to={urlDe(noticia)} tabIndex={-1} aria-hidden="true" className="nyt-manchete__foto">
                <Foto noticia={noticia} src={foto} />
            </Link>
        </article>
    );
}

/** "Audio Headline" (1:142): miniatura 96 px, etiquetas, título e "ouvir". */
function Destaque({ noticia }) {
    return (
        <section className="nyt-destaque" data-revelar>
            <Link to={urlDe(noticia)} tabIndex={-1} aria-hidden="true" className="nyt-destaque__foto">
                <img src={imagemDe(noticia, 5, "pequena")} alt="" />
            </Link>
            <div>
                <p className="nyt-tags">
                    <Tag forte>EM DESTAQUE</Tag>
                    <Tag claro>{(noticia.tema ?? "RESUMO").toUpperCase()}</Tag>
                </p>
                <h3>
                    <Link to={urlDe(noticia)}>{noticia.titulo}</Link>
                </h3>
                <p className="nyt-ouvir">
                    <CirclePlay size={16} strokeWidth={1.75} aria-hidden="true" />
                    <Tag claro>{minutosDeLeitura(noticia.texto)}</Tag>
                </p>
            </div>
        </section>
    );
}

const INTERVALO_VIVO = 7000;

/** Bloco "Live" (1:165, 1:248): links da cobertura, selo AO VIVO e carrossel com pontos e setas (avança sozinho; pausa no hover/foco). */
function AoVivo({ titulo, links, noticias, deslocamento = 0, final = false }) {
    const [indice, setIndice] = useState(0);
    const [direcao, setDirecao] = useState(1);
    const [pausado, setPausado] = useState(false);
    const total = noticias.length;
    const semMovimento = useRef(typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

    useEffect(() => {
        if (total < 2 || pausado || semMovimento.current) return undefined;
        const id = setTimeout(() => {
            setDirecao(1);
            setIndice((i) => (i + 1) % total);
        }, INTERVALO_VIVO);
        return () => clearTimeout(id);
    }, [indice, pausado, total]);

    const arrasto = useRef(null);

    if (!total) return null;
    const posicao = (indice + deslocamento) % total;
    const atual = noticias[posicao];
    const ir = (passo) => {
        setDirecao(passo);
        setIndice((i) => (i + passo + total) % total);
    };

    // Toque e arraste (dedo ou mouse): um gesto horizontal de 50 px troca de matéria.
    const iniciarArrasto = (evento) => {
        arrasto.current = { x: evento.clientX, y: evento.clientY, gesto: false };
    };
    const terminarArrasto = (evento) => {
        const inicio = arrasto.current;
        if (!inicio) return;
        const dx = evento.clientX - inicio.x;
        const dy = evento.clientY - inicio.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            inicio.gesto = true;
            ir(dx < 0 ? 1 : -1);
        }
        arrasto.current = inicio.gesto ? { gesto: true } : null;
    };
    // Um arrasto não deve virar clique no link da matéria.
    const bloquearCliqueAposArrasto = (evento) => {
        if (arrasto.current?.gesto) {
            evento.preventDefault();
            evento.stopPropagation();
        }
        arrasto.current = null;
    };
    const teclado = (evento) => {
        if (evento.key === "ArrowRight") ir(1);
        if (evento.key === "ArrowLeft") ir(-1);
    };

    return (
        <section
            className={`nyt-vivo ${pausado ? "nyt-vivo--pausado" : ""} ${final ? "nyt-vivo--final" : ""}`}
            aria-roledescription="carrossel"
            aria-label={titulo}
            data-revelar
            style={{ "--intervalo": `${INTERVALO_VIVO}ms` }}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocus={() => setPausado(true)}
            onBlur={() => setPausado(false)}
        >
            <nav className="nyt-vivo__links">
                <strong>{titulo}</strong>
                <span>
                    {links.map((link) => (
                        <Link key={link.rotulo} to={link.para}>
                            {link.rotulo}
                        </Link>
                    ))}
                </span>
            </nav>

            <div
                className={`nyt-vivo__corpo ${direcao > 0 ? "nyt-vivo__corpo--avanca" : "nyt-vivo__corpo--volta"}`}
                key={`${atual.id}-${indice}`}
                aria-live="polite"
                tabIndex={0}
                onKeyDown={teclado}
                onPointerDown={iniciarArrasto}
                onPointerUp={terminarArrasto}
                onPointerCancel={() => (arrasto.current = null)}
                onClickCapture={bloquearCliqueAposArrasto}
                onDragStart={(evento) => evento.preventDefault()}
            >
                <div className="nyt-vivo__texto">
                    <p className="nyt-vivo__selo">
                        <strong>AO VIVO</strong> <span>{tempoRelativo(atual.data_publicacao)}</span>
                    </p>
                    <h3>
                        <Link to={urlDe(atual)}>{atual.titulo}</Link>
                    </h3>
                    <p>{resumir(atual.texto, 200)}</p>
                    <Link to={urlDe(atual)} className="nyt-vivo__mais">
                        Ver mais atualizações <span>{Math.max(total - 1, 1)}+</span>
                    </Link>
                </div>
                <Link to={urlDe(atual)} tabIndex={-1} aria-hidden="true" className="nyt-vivo__foto">
                    <img src={imagemDe(atual, posicao + 3)} alt="" key={atual.id} />
                </Link>
            </div>

            <div className="nyt-vivo__controles">
                <div className="nyt-vivo__pontos" role="tablist" aria-label="Escolher matéria">
                    {noticias.map((n, i) => (
                        <button
                            key={n.id}
                            type="button"
                            role="tab"
                            aria-selected={i === posicao}
                            aria-label={`Matéria ${i + 1}`}
                            onClick={() => {
                                const destino = (i - deslocamento + total) % total;
                                setDirecao(destino >= indice ? 1 : -1);
                                setIndice(destino);
                            }}
                        />
                    ))}
                </div>
                <div className="nyt-vivo__setas">
                    <button type="button" aria-label="Anterior" onClick={() => ir(-1)}>
                        <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <button type="button" aria-label="Próxima" onClick={() => ir(1)}>
                        <ChevronRight size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
}

/** Bloco "Food" (1:201): abas em pílula e fileira de cinco cards com divisores. */
function Fileira({ temas, noticias }) {
    const [aba, setAba] = useState("");
    const itens = (aba ? noticias.filter((n) => n.tema === aba) : noticias).slice(0, 5);
    return (
        <section className="nyt-fileira" data-revelar>
            <div className="nyt-abas" role="tablist" aria-label="Filtrar a fileira">
                {["", ...temas.slice(0, 3)].map((tema) => (
                    <button key={tema || "destaques"} type="button" role="tab" aria-selected={aba === tema} onClick={() => setAba(tema)}>
                        {tema || "Destaques"}
                    </button>
                ))}
            </div>
            <div className="nyt-fileira__itens" key={aba || "destaques"}>
                {itens.map((noticia, i) => (
                    <Link key={noticia.id} to={urlDe(noticia)} className="nyt-mini" style={{ "--i": i }}>
                        <span className="nyt-mini__foto">
                            <img src={imagemDe(noticia, i, "pequena")} alt="" loading="lazy" />
                        </span>
                        <h4>{noticia.titulo}</h4>
                    </Link>
                ))}
                {itens.length === 0 && <p className="nyt-vazio">Sem matérias nesta aba.</p>}
            </div>
        </section>
    );
}

/**
 * Itens da coluna de opinião (1:306): "simples" (autor + título), "grande"
 * (texto à esquerda e foto 144 × 160) e "avatar" (círculo de 48 px).
 */
function Coluna({ noticia, foto, variante, divisor = false }) {
    return (
        <article className={`nyt-coluna nyt-coluna--${variante} ${divisor ? "nyt-coluna--divisor" : ""}`} data-revelar="fade">
            <div className="nyt-coluna__texto">
                <p className="nyt-coluna__autor">{autorDe(noticia).toUpperCase()}</p>
                <h3>
                    <Link to={urlDe(noticia)}>{noticia.titulo}</Link>
                </h3>
                <Tag>{minutosDeLeitura(noticia.texto)}</Tag>
            </div>
            {variante === "grande" && (
                <Link to={urlDe(noticia)} tabIndex={-1} aria-hidden="true" className="nyt-coluna__foto">
                    <img src={foto} alt="" loading="lazy" />
                </Link>
            )}
            {variante === "avatar" && (
                <span className="nyt-coluna__avatar" aria-hidden="true">
                    {iniciais(autorDe(noticia))}
                </span>
            )}
        </article>
    );
}

/** Seções "Well/Cooking" (1:406, 1:440): título e grade de quatro colunas com divisores. */
function Grade({ titulo, itens }) {
    if (!itens.length) return null;
    return (
        <section className="nyt-grade">
            <h2 data-revelar>{titulo}</h2>
            <div className="nyt-grade__itens">
                {itens.map((item, i) => (
                    <Link key={item.chave} to={item.url} className="nyt-grade__item" data-revelar style={{ "--atraso": `${i * 90}ms` }}>
                        <figure className="nyt-foto">
                            <span className="nyt-foto__quadro">
                                <img src={item.imagem} alt="" loading="lazy" />
                            </span>
                            <figcaption>{item.credito}</figcaption>
                        </figure>
                        <h3>{item.titulo}</h3>
                    </Link>
                ))}
            </div>
        </section>
    );
}

/** Esqueleto da capa enquanto a edição carrega. */
function EsqueletoEdicao() {
    return (
        <div className="nyt__capa nyt-esqueleto" aria-busy="true" aria-label="Montando a edição">
            <div className="nyt__principal">
                {[0, 1].map((i) => (
                    <div key={i} className="nyt-esqueleto__manchete">
                        <div>
                            <span className="esqueleto" style={{ height: 32, width: "92%" }} />
                            <span className="esqueleto" style={{ height: 32, width: "70%" }} />
                            <span className="esqueleto" style={{ height: 16, width: "80%" }} />
                            <span className="esqueleto" style={{ height: 16, width: "76%" }} />
                            <span className="esqueleto" style={{ height: 16, width: "60%" }} />
                        </div>
                        <span className="esqueleto nyt-esqueleto__foto" />
                    </div>
                ))}
            </div>
            <div className="nyt__lateral">
                <span className="esqueleto nyt-esqueleto__foto nyt-esqueleto__foto--lateral" />
                <span className="esqueleto" style={{ height: 32, width: "90%" }} />
                <span className="esqueleto" style={{ height: 16, width: "80%" }} />
            </div>
        </div>
    );
}

export default function Noticias() {
    const [noticias, setNoticias] = useState([]);
    const [projetos, setProjetos] = useState([]);
    const [parametros, setParametros] = useSearchParams();
    const tema = parametros.get("tema") ?? "";
    const setTema = (valor) => setParametros(valor ? { tema: valor } : {}, { replace: true });
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        Promise.allSettled([api("/noticia?per_page=100"), api("/projeto?per_page=8")]).then(([n, p]) => {
            if (n.status === "fulfilled") setNoticias(lista(n.value));
            if (p.status === "fulfilled") setProjetos(lista(p.value));
            setCarregando(false);
        });
    }, []);

    const temas = useMemo(() => [...new Set(noticias.map((n) => n.tema).filter(Boolean))], [noticias]);
    const filtradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return noticias
            .filter((n) => !tema || n.tema === tema)
            .filter((n) => !termo || `${n.titulo} ${n.texto}`.toLowerCase().includes(termo));
    }, [noticias, tema, busca]);

    // Cada posição do layout pega a próxima matéria; com poucas matérias, a edição recomeça do início.
    const n = (i) => filtradas[i % filtradas.length];

    const repositorio = projetos.slice(0, 4).map((p, i) => ({
        chave: `p${p.id}`,
        url: `/projetos/${p.id}`,
        imagem: p.capa ?? imagemDe(p, i + 1, "media"),
        credito: p.usuario?.nome ?? AREAS_PROJETO[p.area],
        titulo: p.titulo,
    }));
    const oficinas = [0, 1, 2, 3].map((i) => {
        const noticia = n(i + 2) ?? {};
        return { chave: `o${i}`, url: urlDe(noticia), imagem: imagemDe(noticia, [5, 0, 6, 7][i], "media"), credito: autorDe(noticia), titulo: noticia.titulo };
    });

    return (
        <div className="nyt">
            <div className="nyt__pagina">
                <Cabecalho noticias={noticias} tema={tema} aoEscolherTema={setTema} busca={busca} aoBuscar={setBusca} />

                {carregando && <EsqueletoEdicao />}
                {!carregando && filtradas.length === 0 && (
                    <Vazio titulo="Nenhuma notícia encontrada">As notícias aparecem aqui depois de aprovadas pela curadoria.</Vazio>
                )}

                {filtradas.length > 0 && (
                    <div className="nyt__capa">
                        <main className="nyt__principal">
                            <Manchete noticia={n(0)} foto={imagemDe(n(0), 0)} grande />
                            <Destaque noticia={n(1)} />
                            <Manchete noticia={n(2)} foto={imagemDe(n(2), 1)} className="nyt-manchete--fio" />
                            <AoVivo
                                titulo="Economia circular"
                                links={[
                                    { para: "/doacoes", rotulo: "Doações" },
                                    { para: "/lotes", rotulo: "Lotes" },
                                    { para: "/rastreio", rotulo: "Rastreio" },
                                    { para: "/projetos", rotulo: "Projetos" },
                                    { para: "/ranking", rotulo: "Ranking de impacto" },
                                    { para: "/instituicoes", rotulo: "Instituições parceiras" },
                                ]}
                                noticias={filtradas}
                            />
                            <Fileira temas={temas} noticias={filtradas} />
                            <Manchete noticia={n(3)} foto={imagemDe(n(3), 2)} className="nyt-manchete--fio nyt-manchete--afastada" />
                            <AoVivo
                                titulo="Pesquisa e ensino"
                                links={[
                                    { para: "/projetos", rotulo: "Repositório" },
                                    { para: "/vagas", rotulo: "Vagas" },
                                    { para: "/chamados", rotulo: "Chamados" },
                                    { para: "/instituicoes", rotulo: "Instituições" },
                                    { para: "/curriculo", rotulo: "Currículo" },
                                    { para: "/noticias", rotulo: "Todas as notícias" },
                                ]}
                                noticias={filtradas}
                                deslocamento={1}
                                final
                            />
                        </main>

                        <aside className="nyt__lateral" aria-label="Mais notícias">
                            {/* Side Main Story (1:286) */}
                            <article className="nyt-lateral-principal" data-revelar="direita">
                                <Link to={urlDe(n(4))} tabIndex={-1} aria-hidden="true" className="nyt-lateral-principal__foto">
                                    <img src={imagemDe(n(4), 0, "media")} alt="" />
                                </Link>
                                <h2>
                                    <Link to={urlDe(n(4))}>{n(4).titulo}</Link>
                                </h2>
                                <p>{resumir(n(4).texto, 170)}</p>
                                <Tag>{minutosDeLeitura(n(4).texto)}</Tag>
                            </article>

                            {/* Side Sub-Headers (1:293) */}
                            <div className="nyt-par" data-revelar>
                                {[5, 6].map((i, k) => (
                                    <Link key={i} to={urlDe(n(i))} className="nyt-mini">
                                        <span className="nyt-mini__foto">
                                            <img src={imagemDe(n(i), 3 + k, "pequena")} alt="" loading="lazy" />
                                        </span>
                                        <h4>{n(i).titulo}</h4>
                                        <Tag>{(n(i).tema ?? "").toUpperCase() || minutosDeLeitura(n(i).texto)}</Tag>
                                    </Link>
                                ))}
                            </div>

                            {/* Opinions & Features 1 (1:306) */}
                            <section className="nyt-opiniao" aria-labelledby="titulo-opiniao">
                                <div className="nyt-opiniao__abre nyt-coluna--divisor" data-revelar="fade">
                                    <h2 id="titulo-opiniao" className="nyt-rotulo">
                                        Opinião
                                    </h2>
                                    <div className="nyt-coluna__texto">
                                        <p className="nyt-coluna__autor">{autorDe(n(7)).toUpperCase()}</p>
                                        <h3>
                                            <Link to={urlDe(n(7))}>{n(7).titulo}</Link>
                                        </h3>
                                        <Tag>{minutosDeLeitura(n(7).texto)}</Tag>
                                    </div>
                                </div>
                                <Coluna noticia={n(8)} foto={imagemDe(n(8), 0, "alta")} variante="grande" />
                                <Coluna noticia={n(9)} variante="avatar" divisor />
                                <Coluna noticia={n(10)} variante="avatar" divisor />
                                <Coluna noticia={n(11)} variante="simples" divisor />
                                <Coluna noticia={n(12)} foto={imagemDe(n(12), 2, "alta")} variante="grande" />
                            </section>

                            {/* Audio Episode (1:377) */}
                            <section className="nyt-rastreio" data-revelar>
                                <Link to="/rastreio" className="nyt-rastreio__cartao">
                                    <p className="nyt-tags">
                                        <Tag forte>O RASTREIO</Tag>
                                        <Tag claro>QR CODE</Tag>
                                    </p>
                                    <h3>Do resíduo ao carretel: veja a origem e o laudo de um lote reciclado.</h3>
                                    <span className="nyt-rastreio__onda" aria-hidden="true">
                                        <VolumeX size={24} strokeWidth={2} />
                                        <span className="nyt-rastreio__barras">
                                            {Array.from({ length: 34 }, (_, i) => (
                                                <i key={i} style={{ height: `${2 + ((i * 7) % 15)}px` }} />
                                            ))}
                                        </span>
                                        <Tag>PLA</Tag>
                                    </span>
                                </Link>
                                <Link to="/rastreio" className="nyt-rastreio__ouvir">
                                    <CirclePlay size={16} strokeWidth={1.75} aria-hidden="true" /> Abrir o rastreio completo
                                </Link>
                            </section>

                            {/* Opinions & Features 2 — "In Case You Missed It" (1:355) */}
                            <section className="nyt-perdido">
                                <div className="nyt-perdido__topo" data-revelar>
                                    <h2 className="nyt-rotulo">Você pode ter perdido</h2>
                                    <p className="nyt-perdido__sub">Seleção da redação do EcoHub para você</p>
                                </div>
                                {[13, 14, 15].map((i, k) => (
                                    <article key={i} className="nyt-coluna nyt-coluna--alta" data-revelar="fade" style={{ "--atraso": `${k * 90}ms` }}>
                                        <div className="nyt-coluna__texto">
                                            <h3>
                                                <Link to={urlDe(n(i))}>{n(i).titulo}</Link>
                                            </h3>
                                            <Tag>{minutosDeLeitura(n(i).texto)}</Tag>
                                        </div>
                                        <Link to={urlDe(n(i))} tabIndex={-1} aria-hidden="true" className="nyt-coluna__foto">
                                            <img src={imagemDe(n(i), [1, 3, 4][k], "alta")} alt="" loading="lazy" />
                                        </Link>
                                    </article>
                                ))}
                            </section>
                        </aside>
                    </div>
                )}

                {filtradas.length > 0 && <Grade titulo="Repositório de projetos" itens={repositorio} />}
            </div>

            {filtradas.length > 0 && (
                <>
                    <div className="nyt-faixa" data-revelar="fade">
                        ESPAÇO DOS PARCEIROS
                    </div>
                    <div className="nyt__pagina">
                        <Grade titulo="Educação: oficinas e guias" itens={oficinas} />
                    </div>
                    <section className="nyt-banner">
                        <p className="nyt-banner__rotulo">PARTICIPE</p>
                        <div className="nyt-banner__caixa" data-revelar="escala">
                            <p className="nyt-banner__logo">EcoHub Notícias</p>
                            <h2>Toda a rede. Numa só conta.</h2>
                            <p className="nyt-banner__oferta">Gratuito para makers, escolas, laboratórios e empresas</p>
                            <Link to="/doacoes" className="nyt-botao nyt-botao--claro">
                                DOAR RESÍDUOS
                            </Link>
                            <p className="nyt-banner__nota">Sem custo e sem anúncios</p>
                        </div>
                    </section>
                </>
            )}

            <div className="nyt__pagina">
                <RodapeJornal />
            </div>
        </div>
    );
}
