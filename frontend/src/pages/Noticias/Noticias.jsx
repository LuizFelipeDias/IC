import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, QrCode, Volume2 } from "lucide-react";
import { Vazio } from "../../components/ui";
import { api, lista } from "../../services/api";
import { AREAS_PROJETO, iniciais, tempoRelativo } from "../../utils/formatar";
import { Cabecalho, doisParagrafos, imagemDe, minutosDeLeitura, resumir, Tag } from "./Jornal";
import "../../styles/pages/noticias.css";

/*
 * Portal de notícias — clone do frame "NYTimes Home Page" (Figma 1:131):
 * coluna principal de 976 px + barra lateral de 335 px, seções separadas por
 * fios pretos, carrossel "ao vivo", abas com fileira de 5 cards, grade de 4
 * colunas com divisores e banner escuro de assinatura.
 */

const urlDe = (noticia) => `/noticias/${noticia.id}`;
const autorDe = (noticia) => noticia.usuario?.nome ?? "Redação EcoHub";

function Foto({ noticia, indice, legenda = true, className = "" }) {
    return (
        <figure className={`nyt-foto ${className}`}>
            <img src={imagemDe(noticia, indice)} alt="" loading="lazy" />
            {legenda && <figcaption>{autorDe(noticia)}/EcoHub Notícias</figcaption>}
        </figure>
    );
}

/** "Headline 1/2/3": título e resumo à esquerda, foto 592 × 356 à direita. */
function Manchete({ noticia, indice, grande = false }) {
    const [p1, p2] = doisParagrafos(resumir(noticia.texto, 420));
    return (
        <article className={`nyt-manchete ${grande ? "nyt-manchete--grande" : ""}`} data-revelar>
            <div className="nyt-manchete__texto">
                <h2>
                    <Link to={urlDe(noticia)}>{noticia.titulo}</Link>
                </h2>
                <p>{p1}</p>
                {grande && p2 && <p>{p2}</p>}
                <Tag>{minutosDeLeitura(noticia.texto)}</Tag>
            </div>
            <Link to={urlDe(noticia)} tabIndex={-1} aria-hidden="true">
                <Foto noticia={noticia} indice={indice} />
            </Link>
        </article>
    );
}

/** "Audio Headline": miniatura 96 px, etiquetas e título em uma linha. */
function Destaque({ noticia, indice }) {
    return (
        <section className="nyt-destaque" data-revelar>
            <img src={imagemDe(noticia, indice)} alt="" />
            <div>
                <p className="nyt-tags">
                    <Tag forte>EM DESTAQUE</Tag>
                    <Tag claro>{(noticia.tema ?? "RESUMO").toUpperCase()}</Tag>
                </p>
                <h3>
                    <Link to={urlDe(noticia)}>{noticia.titulo}</Link>
                </h3>
                <p className="nyt-ouvir">
                    <Play size={16} aria-hidden="true" />
                    <Tag claro>{minutosDeLeitura(noticia.texto)}</Tag>
                </p>
            </div>
        </section>
    );
}

const INTERVALO_VIVO = 7000;

/** Bloco "Live": links da cobertura, selo AO VIVO e carrossel com pontos e setas (avança sozinho; pausa no hover/foco). */
function AoVivo({ titulo, links, noticias, deslocamento = 0 }) {
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
    const atual = noticias[(indice + deslocamento) % total];
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
            className={`nyt-vivo ${pausado ? "nyt-vivo--pausado" : ""}`}
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
                {links.map((link) => (
                    <Link key={link.rotulo} to={link.para}>
                        {link.rotulo}
                    </Link>
                ))}
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
                        <strong>AO VIVO</strong> {tempoRelativo(atual.data_publicacao)}
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
                    <img src={imagemDe(atual, indice + deslocamento)} alt="" key={atual.id} />
                </Link>
            </div>

            <div className="nyt-vivo__controles">
                <div className="nyt-vivo__pontos" role="tablist" aria-label="Escolher matéria">
                    {noticias.map((n, i) => (
                        <button
                            key={n.id}
                            type="button"
                            role="tab"
                            aria-selected={i === (indice + deslocamento) % total}
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

/** Bloco "Food": abas em pílula e fileira de cinco cards com divisores. */
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
                        <img src={imagemDe(noticia, i)} alt="" loading="lazy" />
                        <h4>{noticia.titulo}</h4>
                    </Link>
                ))}
                {itens.length === 0 && <p className="nyt-vazio">Sem matérias nesta aba.</p>}
            </div>
        </section>
    );
}

/** Coluna de opinião: autor, título, tempo de leitura e foto ou avatar. */
function Coluna({ noticia, indice, variante }) {
    return (
        <article className={`nyt-coluna nyt-coluna--${variante}`} data-revelar="fade" style={{ "--atraso": `${(indice % 6) * 70}ms` }}>
            <div>
                <p className="nyt-coluna__autor">{autorDe(noticia).toUpperCase()}</p>
                <h3>
                    <Link to={urlDe(noticia)}>{noticia.titulo}</Link>
                </h3>
                <Tag>{minutosDeLeitura(noticia.texto)}</Tag>
            </div>
            {variante === "grande" && <img src={imagemDe(noticia, indice)} alt="" loading="lazy" />}
            {variante === "avatar" && (
                <span className="nyt-coluna__avatar" aria-hidden="true">
                    {iniciais(autorDe(noticia))}
                </span>
            )}
        </article>
    );
}

/** Seções "Well/Cooking": título e grade de quatro colunas com divisores. */
function Grade({ titulo, itens }) {
    if (!itens.length) return null;
    return (
        <section className="nyt-grade">
            <h2 data-revelar>{titulo}</h2>
            <div className="nyt-grade__itens">
                {itens.map((item, i) => (
                    <Link key={item.chave} to={item.url} className="nyt-grade__item" data-revelar style={{ "--atraso": `${i * 90}ms` }}>
                        <figure className="nyt-foto">
                            <img src={item.imagem} alt="" loading="lazy" />
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
                            <span className="esqueleto" style={{ height: 28, width: "92%" }} />
                            <span className="esqueleto" style={{ height: 28, width: "70%" }} />
                            <span className="esqueleto" style={{ height: 14, width: "100%" }} />
                            <span className="esqueleto" style={{ height: 14, width: "86%" }} />
                            <span className="esqueleto" style={{ height: 14, width: "60%" }} />
                        </div>
                        <span className="esqueleto nyt-esqueleto__foto" />
                    </div>
                ))}
            </div>
            <div className="nyt__lateral">
                <span className="esqueleto nyt-esqueleto__foto" />
                <span className="esqueleto" style={{ height: 24, width: "90%" }} />
                <span className="esqueleto" style={{ height: 14, width: "80%" }} />
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
        imagem: p.capa ?? imagemDe({ id: i + 1 }, i),
        credito: p.usuario?.nome ?? AREAS_PROJETO[p.area],
        titulo: p.titulo,
    }));
    const oficinas = [0, 1, 2, 3].map((i) => {
        const noticia = n(i + 2) ?? {};
        return { chave: `o${i}`, url: urlDe(noticia), imagem: imagemDe(noticia, i + 1), credito: autorDe(noticia), titulo: noticia.titulo };
    });

    return (
        <div className="nyt">
            <div className="nyt__pagina">
                <Cabecalho temas={temas} tema={tema} aoEscolherTema={setTema} busca={busca} aoBuscar={setBusca} total={noticias.length} />

                {carregando && <EsqueletoEdicao />}
                {!carregando && filtradas.length === 0 && (
                    <Vazio titulo="Nenhuma notícia encontrada">As notícias aparecem aqui depois de aprovadas pela curadoria.</Vazio>
                )}

                {filtradas.length > 0 && (
                    <div className="nyt__capa">
                        <main className="nyt__principal">
                            <Manchete noticia={n(0)} indice={0} grande />
                            <Destaque noticia={n(1)} indice={1} />
                            <Manchete noticia={n(2)} indice={2} />
                            <AoVivo
                                titulo="Economia circular"
                                links={[
                                    { para: "/doacoes", rotulo: "Doações" },
                                    { para: "/doacoes", rotulo: "Coletas" },
                                    { para: "/rastreio", rotulo: "Rastreio" },
                                    { para: "/projetos", rotulo: "Projetos" },
                                    { para: "/ranking", rotulo: "Ranking de impacto" },
                                ]}
                                noticias={filtradas}
                            />
                            <Fileira temas={temas} noticias={filtradas} />
                            <Manchete noticia={n(3)} indice={3} />
                            <AoVivo
                                titulo="Pesquisa e ensino"
                                links={[
                                    { para: "/projetos", rotulo: "Repositório" },
                                    { para: "/vagas", rotulo: "Vagas" },
                                    { para: "/chamados", rotulo: "Chamados de escolas" },
                                    { para: "/noticias", rotulo: "Todas as notícias" },
                                ]}
                                noticias={filtradas}
                                deslocamento={1}
                            />
                        </main>

                        <aside className="nyt__lateral" aria-label="Mais notícias">
                            <article className="nyt-lateral-principal" data-revelar="direita">
                                <Link to={urlDe(n(4))} tabIndex={-1} aria-hidden="true">
                                    <img src={imagemDe(n(4), 4)} alt="" />
                                </Link>
                                <h2>
                                    <Link to={urlDe(n(4))}>{n(4).titulo}</Link>
                                </h2>
                                <p>{resumir(n(4).texto, 170)}</p>
                                <Tag>{minutosDeLeitura(n(4).texto)}</Tag>
                            </article>

                            <div className="nyt-par" data-revelar>
                                {[5, 6].map((i) => (
                                    <Link key={i} to={urlDe(n(i))} className="nyt-mini">
                                        <img src={imagemDe(n(i), i)} alt="" loading="lazy" />
                                        <h4>{n(i).titulo}</h4>
                                        <Tag>{(n(i).tema ?? "").toUpperCase() || minutosDeLeitura(n(i).texto)}</Tag>
                                    </Link>
                                ))}
                            </div>

                            <section className="nyt-opiniao">
                                <h2 className="nyt-rotulo">Opinião</h2>
                                <Coluna noticia={n(7)} indice={7} variante="simples" />
                                <Coluna noticia={n(8)} indice={8} variante="grande" />
                                <Coluna noticia={n(9)} indice={9} variante="avatar" />
                                <Coluna noticia={n(10)} indice={10} variante="avatar" />
                                <Coluna noticia={n(11)} indice={11} variante="simples" />
                                <Coluna noticia={n(12)} indice={12} variante="grande" />
                            </section>

                            <section className="nyt-rastreio" data-revelar>
                                <Link to="/rastreio" className="nyt-rastreio__cartao">
                                    <p className="nyt-tags">
                                        <Tag forte>O RASTREIO</Tag>
                                        <Tag claro>QR CODE</Tag>
                                    </p>
                                    <h3>Do resíduo ao carretel: veja a origem e o laudo de um lote reciclado.</h3>
                                    <div className="nyt-rastreio__onda" aria-hidden="true">
                                        <Volume2 size={20} />
                                        <span className="nyt-rastreio__barras">
                                            {Array.from({ length: 28 }, (_, i) => (
                                                <i key={i} style={{ height: `${4 + ((i * 7) % 12)}px` }} />
                                            ))}
                                        </span>
                                        <Tag>PLA</Tag>
                                    </div>
                                </Link>
                                <Link to="/rastreio" className="nyt-rastreio__ouvir">
                                    <QrCode size={16} aria-hidden="true" /> Abrir o rastreio completo
                                </Link>
                            </section>

                            <section className="nyt-perdido">
                                <h2 className="nyt-rotulo" data-revelar>Você pode ter perdido</h2>
                                <p className="nyt-perdido__sub">Seleção da redação do EcoHub para você</p>
                                {[13, 14, 15].map((i) => (
                                    <article key={i} className="nyt-coluna nyt-coluna--alta" data-revelar="fade" style={{ "--atraso": `${(i - 13) * 90}ms` }}>
                                        <div>
                                            <h3>
                                                <Link to={urlDe(n(i))}>{n(i).titulo}</Link>
                                            </h3>
                                            <Tag>{minutosDeLeitura(n(i).texto)}</Tag>
                                        </div>
                                        <img src={imagemDe(n(i), i)} alt="" loading="lazy" />
                                    </article>
                                ))}
                            </section>
                        </aside>
                    </div>
                )}

                {filtradas.length > 0 && <Grade titulo="Do repositório de projetos" itens={repositorio} />}
            </div>

            {filtradas.length > 0 && (
                <>
                    <div className="nyt-faixa" data-revelar="fade">ESPAÇO DOS PARCEIROS</div>
                    <div className="nyt__pagina">
                        <Grade titulo="Educação e oficinas" itens={oficinas} />
                    </div>
                    <section className="nyt-banner">
                        <p className="nyt-banner__rotulo">PARTICIPE</p>
                        <div className="nyt-banner__caixa" data-revelar="escala">
                            <p className="nyt-banner__logo">EcoHub Notícias</p>
                            <h2>Toda a rede. Numa só conta.</h2>
                            <p className="nyt-banner__oferta">Gratuito para makers, escolas públicas, laboratórios e empresas</p>
                            <Link to="/doacoes" className="nyt-botao nyt-botao--claro">
                                DOAR RESÍDUOS
                            </Link>
                            <p className="nyt-banner__nota">Sem custo e sem anúncios</p>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
