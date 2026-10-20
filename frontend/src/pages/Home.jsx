import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight, BadgeCheck, Boxes, Briefcase, CircleCheck, ClipboardList, Factory, FlaskConical, Gift, Newspaper, Printer, QrCode, Recycle, Truck,
} from "lucide-react";
import { Aviso } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { api, lista } from "../services/api";
import { AREAS_PROJETO, tempoRelativo, TIPOS_USUARIO } from "../utils/formatar";
import "../styles/pages/home.css";

const CICLO = [
    { icone: Gift, titulo: "Doação", texto: "Makers cadastram sobras, carretéis e peças com falha." },
    { icone: Truck, titulo: "Coleta", texto: "Laboratórios solicitam e agendam a retirada." },
    { icone: Recycle, titulo: "Reciclagem", texto: "O material é triturado, seco e extrudado." },
    { icone: FlaskConical, titulo: "Laudo", texto: "Ensaios garantem diâmetro, resistência e temperatura." },
    { icone: Printer, titulo: "Nova peça", texto: "Filamento rastreável volta a imprimir projetos." },
];

const MODULOS = [
    { para: "/chamados", icone: ClipboardList, titulo: "Chamados", texto: "Escolas e empresas pedem apoio; laboratórios e makers atendem.", perfis: ["solicitante", "prestador", "moderador"] },
    { para: "/doacoes", icone: Gift, titulo: "Doações", texto: "Mural de resíduos de impressão à espera de reciclagem." },
    { para: "/projetos", icone: Boxes, titulo: "Projetos", texto: "Repositório de modelos STL/3MF com licença e curadoria." },
    { para: "/vagas", icone: Briefcase, titulo: "Vagas", texto: "Oportunidades em manufatura aditiva e banco de currículos." },
    { para: "/noticias", icone: Newspaper, titulo: "Notícias", texto: "Pesquisa, mercado e educação em impressão 3D." },
    { para: "/lotes", icone: Factory, titulo: "Lotes e laudos", texto: "Produza filamento reciclado e emita laudos de qualidade.", perfis: ["receptor"] },
    { para: "/rastreio", icone: QrCode, titulo: "Rastreio", texto: "Leia o QR Code do carretel e veja a origem do material." },
];

const total = (resposta) => resposta?.meta?.total ?? lista(resposta).length;

export default function Home() {
    const { usuario, pode } = useAuth();
    const [numeros, setNumeros] = useState(null);
    const [noticias, setNoticias] = useState([]);
    const [projetos, setProjetos] = useState([]);
    const [ranking, setRanking] = useState([]);

    useEffect(() => {
        let ativo = true;
        Promise.allSettled([
            api("/projeto?per_page=3"),
            api("/noticia?per_page=4"),
            api("/doacao?per_page=1"),
            api("/vaga?per_page=1"),
            api("/ranking"),
        ]).then(([p, n, d, v, r]) => {
            if (!ativo) return;
            const valor = (resultado) => (resultado.status === "fulfilled" ? resultado.value : null);
            setProjetos(lista(valor(p)));
            setNoticias(lista(valor(n)));
            setRanking(lista(valor(r)).slice(0, 5));
            setNumeros({ projetos: total(valor(p)), noticias: total(valor(n)), doacoes: total(valor(d)), vagas: total(valor(v)) });
        });
        return () => {
            ativo = false;
        };
    }, []);

    const modulos = MODULOS.filter((m) => !m.perfis || pode(...m.perfis));
    // Pessoas pelo primeiro nome; instituições pelo nome completo.
    const primeiroNome = usuario?.tipo_usuario === "pessoa_fisica" ? usuario.nome.split(" ")[0] : usuario?.nome;

    return (
        <>
            <section className="hero">
                <div className="container hero__grade">
                    <div>
                        <span className="hero__selo">
                            <b>Novo</b> Rastreabilidade por QR Code em cada carretel
                        </span>
                        <h1>
                            Do resíduo à <span>nova peça</span>.
                        </h1>
                        <p className="hero__texto">
                            {primeiroNome ? `Olá, ${primeiroNome}. ` : ""}
                            A EcoHub 3D conecta makers, laboratórios, escolas públicas e empresas para que nenhum grama de plástico de
                            impressão 3D termine no aterro.
                        </p>
                        <div className="hero__acoes">
                            {pode("solicitante") ? (
                                <Link to="/chamados" className="botao botao--grande">
                                    Abrir chamado <ArrowRight size={18} aria-hidden="true" />
                                </Link>
                            ) : (
                                <Link to="/doacoes" className="botao botao--grande">
                                    Doar resíduos <ArrowRight size={18} aria-hidden="true" />
                                </Link>
                            )}
                            <Link to="/projetos" className="botao botao--grande botao--secundario">
                                Explorar projetos
                            </Link>
                        </div>
                    </div>

                    <aside className="hero__cartao" aria-label="Exemplo de lote rastreado">
                        <div className="hero__cartao-topo">
                            <span>Lote de filamento reciclado</span>
                            <code>01JECH…0001</code>
                        </div>
                        <h2>PLA natural · 1,75 mm</h2>
                        <ol className="hero__passos">
                            {["Sobras doadas por um makerspace", "Coletado pelo Laboratório de Polímeros", "Triturado e extrudado a 195 °C", "Laudo aprovado: 47 MPa de tração"].map((passo) => (
                                <li key={passo}>
                                    <CircleCheck size={18} aria-hidden="true" /> {passo}
                                </li>
                            ))}
                        </ol>
                        <Link to="/rastreio/01JECHB3DDEMNTE00000000001" className="botao botao--bloco" style={{ marginTop: "var(--esp-5)" }}>
                            <QrCode size={16} aria-hidden="true" /> Ver rastreio completo
                        </Link>
                    </aside>
                </div>
            </section>

            <section className="container numeros" aria-label="A plataforma em números">
                <div className="numeros__grade">
                    {[
                        ["projetos", "projetos publicados"],
                        ["doacoes", "doações à espera de coleta"],
                        ["vagas", "vagas abertas"],
                        ["noticias", "notícias publicadas"],
                    ].map(([chave, rotulo]) => (
                        <div className="estatistica" key={chave}>
                            <span className="estatistica__valor">{numeros ? numeros[chave] : "—"}</span>
                            <span className="estatistica__rotulo">{rotulo}</span>
                        </div>
                    ))}
                </div>
            </section>

            <div className="container">
                {usuario?.verificacao_status === "pendente" && (
                    <div style={{ marginTop: "var(--esp-10)" }}>
                        <Aviso tom="alerta">
                            <strong>Cadastro em análise.</strong> A equipe está conferindo o CNPJ de {usuario.nome}. Assim que for aprovado,
                            você poderá publicar vagas e notícias{usuario.tipo_usuario === "laboratorio" ? ", receber resíduos e atender chamados" : " e abrir chamados"}.
                        </Aviso>
                    </div>
                )}
                {usuario?.verificacao_status === "rejeitado" && (
                    <div style={{ marginTop: "var(--esp-10)" }}>
                        <Aviso tom="perigo">
                            <strong>Verificação recusada.</strong> {usuario.motivo_verificacao} Corrija o documento no seu perfil para uma nova análise.
                        </Aviso>
                    </div>
                )}

                <section className="secao" aria-labelledby="titulo-ciclo">
                    <div className="secao__titulo">
                        <div>
                            <span className="sobrelinha">Como funciona</span>
                            <h2 id="titulo-ciclo">Um ciclo fechado, do carretel ao laudo.</h2>
                        </div>
                        <p>Cada etapa fica registrada. Quem compra ou usa o filamento reciclado vê de onde ele veio e como foi testado.</p>
                    </div>
                    <ol className="ciclo">
                        {CICLO.map(({ icone: Icone, titulo, texto }) => (
                            <li className="ciclo__etapa" key={titulo}>
                                <span className="ciclo__icone">
                                    <Icone size={22} aria-hidden="true" />
                                </span>
                                <h3>{titulo}</h3>
                                <p>{texto}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="secao" aria-labelledby="titulo-modulos">
                    <div className="secao__titulo">
                        <div>
                            <span className="sobrelinha">Para {usuario ? TIPOS_USUARIO[usuario.tipo_usuario]?.toLowerCase() : "você"}</span>
                            <h2 id="titulo-modulos">Tudo o que você pode fazer aqui.</h2>
                        </div>
                    </div>
                    <div className="modulos">
                        {modulos.map(({ para, icone: Icone, titulo, texto }) => (
                            <Link key={para} to={para} className="cartao cartao--interativo modulo">
                                <span className="modulo__icone">
                                    <Icone size={22} aria-hidden="true" />
                                </span>
                                <h3>{titulo}</h3>
                                <p>{texto}</p>
                                <span className="modulo__seta">
                                    Acessar <ArrowRight size={16} aria-hidden="true" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="secao destaques">
                    <div>
                        <div className="secao__titulo">
                            <div>
                                <span className="sobrelinha">Do jornal</span>
                                <h2>Últimas notícias</h2>
                            </div>
                            <Link to="/noticias" className="modulo__seta">
                                Ver todas <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </div>
                        <ul className="lista-destaque">
                            {noticias.map((noticia) => (
                                <li key={noticia.id}>
                                    <Link to={`/noticias/${noticia.id}`}>
                                        <span className="sobrelinha">
                                            {noticia.tema} · {tempoRelativo(noticia.data_publicacao)}
                                        </span>
                                        <h3>{noticia.titulo}</h3>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="secao__titulo">
                            <div>
                                <span className="sobrelinha">Ranking de impacto</span>
                                <h2>Quem mais recicla</h2>
                            </div>
                            <Link to="/ranking" className="modulo__seta">
                                Ranking completo <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </div>
                        <ol className="cartao ranking">
                            {ranking.length === 0 && <li className="texto-suave">Ninguém pontuou ainda.</li>}
                            {ranking.map((item) => (
                                <li key={item.id}>
                                    <span className="ranking__posicao">{item.posicao}</span>
                                    <span>
                                        <strong>{item.nome}</strong>
                                        <br />
                                        <span className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>
                                            {TIPOS_USUARIO[item.tipo]} {item.selos.length > 0 && `· ${item.selos.map((s) => s.nome).join(", ")}`}
                                        </span>
                                    </span>
                                    <span className="ranking__pontos">{item.pontos} pts</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="secao">
                    <div className="secao__titulo">
                        <div>
                            <span className="sobrelinha">Repositório</span>
                            <h2>Projetos em destaque</h2>
                        </div>
                        <Link to="/projetos" className="modulo__seta">
                            Ver repositório <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="modulos">
                        {projetos.map((projeto) => (
                            <Link key={projeto.id} to={`/projetos/${projeto.id}`} className="cartao cartao--interativo modulo">
                                <span className="modulo__icone">
                                    <BadgeCheck size={22} aria-hidden="true" />
                                </span>
                                <span className="sobrelinha">{AREAS_PROJETO[projeto.area] ?? "Projeto"}</span>
                                <h3>{projeto.titulo}</h3>
                                <p>{projeto.texto.slice(0, 110)}…</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
