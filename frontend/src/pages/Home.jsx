import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Boxes, Briefcase, Check, ClipboardList, Factory, FlaskConical, Gift, GraduationCap, Landmark, Newspaper, QrCode, Recycle, School, Sprout, Truck, Users, X,
} from "lucide-react";
import Carrossel from "../components/Carrossel";
import { Aviso } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { api, lista } from "../services/api";
import { tempoRelativo } from "../utils/formatar";
import telaPainel from "../assets/home/tela-painel.webp";
import montanhas from "../assets/home/montanhas.webp";
import cilindros from "../assets/home/cilindros.webp";
import esferas from "../assets/home/esferas.webp";
import aerea from "../assets/home/aerea.webp";
import "../styles/pages/home.css";

/*
 * Home — clone do arquivo "Modern Product Launch" (frame Desktop 1:29):
 * título Crimson Text de 160 px, iPad sobre o cartão verde, nuvem de
 * parceiros, benefícios em 4 colunas, "Features carousel", tabela
 * comparativa, depoimento, 3 passos, foto aérea e chamada centralizada.
 */

const PARCEIROS = [
    { icone: Landmark, nome: "UEPG" },
    { icone: FlaskConical, nome: "Lab. de Polímeros" },
    { icone: School, nome: "Escolas estaduais" },
    { icone: Users, nome: "Makerspaces" },
    { icone: Factory, nome: "Indústria regional" },
    { icone: GraduationCap, nome: "PIBITI" },
];

const BENEFICIOS = [
    { icone: Gift, titulo: "Doe o que sobrou", texto: "Sobras, suportes, carretéis vazios e peças com falha entram num mural visto por laboratórios da região." },
    { icone: Truck, titulo: "Coleta combinada", texto: "O laboratório solicita, você aceita e a data é combinada na própria plataforma, com peso conferido na entrega." },
    { icone: FlaskConical, titulo: "Filamento com laudo", texto: "Cada lote reciclado passa por ensaio de diâmetro, tração e temperatura antes de voltar a circular." },
    { icone: QrCode, titulo: "Rastreio por QR Code", texto: "O carretel leva um código público que mostra de onde veio o material e o resultado do laudo." },
];

const VANTAGENS = [
    "Mostre o caminho do material: da doação ao laudo, tudo registrado.",
    "Una a rede: escolas, makers, laboratórios e empresas no mesmo lugar.",
    "Comprove o impacto: pontos, selos e ranking de quem mais recicla.",
    "Publique com segurança: arquivos STL/3MF validados e curadoria.",
];

const IMAGENS_DESTAQUE = [
    { src: cilindros, alt: "Três cilindros brancos sobre fundo creme" },
    { src: esferas, alt: "Esfera de concreto equilibrada entre duas maiores" },
    { src: montanhas, alt: "Cordilheira colorida com neve" },
    { src: aerea, alt: "Vista aérea de colinas verdes e uma estrada sinuosa" },
];

const COMPARATIVO = [
    {
        nome: "EcoHub 3D",
        itens: [
            [true, "Rastreio por QR Code"],
            [true, "Laudo de qualidade em PDF"],
            [true, "Coletas agendadas"],
            [true, "Instituições verificadas"],
            [true, "Pontos, selos e ranking"],
            [true, "Arquivos STL/3MF validados"],
        ],
    },
    {
        nome: "Grupos e planilhas",
        itens: [
            [true, "Contato rápido"],
            [true, "Avisos de sobras"],
            [true, "Combinação informal"],
            [false, "Sem origem do material"],
            [true, "Sem custo"],
            [false, "Arquivos sem verificação"],
        ],
    },
    {
        nome: "Descarte comum",
        itens: [
            [false, "Plástico no aterro"],
            [false, "Nenhum registro"],
            [false, "Sem reaproveitamento"],
            [false, "Sem parceiros"],
            [false, "Sem impacto medido"],
            [false, "Sem nova peça"],
        ],
    },
];

const PASSOS = [
    { titulo: "Crie sua conta", texto: "Pessoa física, empresa, escola ou laboratório: cada perfil libera ações diferentes." },
    { titulo: "Doe, peça ou atenda", texto: "Publique uma doação, abra um chamado ou aceite um pedido perto de você." },
    { titulo: "Acompanhe o impacto", texto: "Siga o lote reciclado até o laudo e suba no ranking de impacto." },
];

const ATALHOS = [
    { para: "/chamados", icone: ClipboardList, titulo: "Chamados", perfis: ["solicitante", "prestador", "moderador"], imagem: montanhas },
    { para: "/doacoes", icone: Gift, titulo: "Doações e coletas", imagem: aerea },
    { para: "/projetos", icone: Boxes, titulo: "Repositório de projetos", imagem: esferas },
    { para: "/vagas", icone: Briefcase, titulo: "Vagas e currículos", imagem: cilindros },
    { para: "/noticias", icone: Newspaper, titulo: "EcoHub Notícias", imagem: montanhas },
    { para: "/lotes", icone: Factory, titulo: "Lotes e laudos", perfis: ["receptor"], imagem: aerea },
    { para: "/rastreio", icone: QrCode, titulo: "Rastrear um lote", imagem: esferas },
];

const total = (resposta) => resposta?.meta?.total ?? lista(resposta).length;

/* Botões dos componentes "Button" e "Button linkout" do arquivo. */
function BotaoClaro({ para, children }) {
    return (
        <Link to={para} className="ml-botao">
            {children}
        </Link>
    );
}

function BotaoEscuro({ para, children, bloco = false }) {
    return (
        <Link to={para} className={`ml-botao ml-botao--escuro ${bloco ? "ml-botao--bloco" : ""}`}>
            {children}
            <span className="ml-botao__seta" aria-hidden="true">
                ↗
            </span>
        </Link>
    );
}

/* Troca de imagem com fade (o "Features carousel"). */
function useAlternador(total, intervalo) {
    const [atual, setAtual] = useState(0);
    const pausado = useRef(false);
    const ir = useCallback((indice) => setAtual(((indice % total) + total) % total), [total]);

    useEffect(() => {
        if (total < 2 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
        const id = setInterval(() => !pausado.current && setAtual((a) => (a + 1) % total), intervalo);
        return () => clearInterval(id);
    }, [total, intervalo]);

    const pausar = { onMouseEnter: () => (pausado.current = true), onMouseLeave: () => (pausado.current = false) };
    return [atual, ir, pausar];
}

export default function Home() {
    const { usuario, pode } = useAuth();
    const [numeros, setNumeros] = useState(null);
    const [noticias, setNoticias] = useState([]);
    const [polimeros, setPolimeros] = useState(0);
    const [depoimento, irDepoimento, pausarDepoimento] = useAlternador(Math.max(noticias.length, 1), 7000);

    useEffect(() => {
        let ativo = true;
        Promise.allSettled([api("/projeto?per_page=1"), api("/noticia?per_page=5"), api("/doacao?per_page=1"), api("/vaga?per_page=1"), api("/polimeros")]).then(
            ([p, n, d, v, pol]) => {
                if (!ativo) return;
                const valor = (resultado) => (resultado.status === "fulfilled" ? resultado.value : null);
                setNoticias(lista(valor(n)));
                setPolimeros(lista(valor(pol)).length);
                setNumeros({ projetos: total(valor(p)), noticias: total(valor(n)), doacoes: total(valor(d)), vagas: total(valor(v)) });
            },
        );
        return () => {
            ativo = false;
        };
    }, []);

    const atalhos = ATALHOS.filter((a) => !a.perfis || pode(...a.perfis));
    const ano = new Date().getFullYear();
    const acaoPrincipal = pode("solicitante")
        ? { para: "/chamados", rotulo: "Abrir chamado" }
        : pode("receptor")
          ? { para: "/doacoes", rotulo: "Buscar resíduos" }
          : { para: "/doacoes/nova", rotulo: "Doar resíduos" };
    const destaque = noticias[depoimento];

    return (
        <div className="ml">
            {/* ---------- Header ---------- */}
            <header className="ml-topo">
                <h1 className="ml-titulo" aria-label="Feche o ciclo.">
                    {["Feche", "o", "ciclo."].map((palavra, i) => (
                        <span key={palavra} className="ml-titulo__palavra" style={{ "--i": i }} aria-hidden="true">
                            {palavra}
                        </span>
                    ))}
                </h1>

                <div className="ml-hero" aria-label="Painel do EcoHub sobre uma paisagem, com os números da rede">
                    <div className="ml-hero__fundo" />
                    <div className="ml-ipad">
                        <div className="ml-ipad__tela">
                            <img src={telaPainel} alt="" />
                            <div className="ml-tela">
                                <span className="ml-tela__trilha">
                                    Painel <span aria-hidden="true">›</span> <b>Visão geral</b>
                                </span>
                                <div className="ml-tela__linha">
                                    <span className="ml-tela__numero">{numeros ? numeros.doacoes : "—"}</span>
                                    <span className="ml-tela__rotulo">Doações à espera de coleta</span>
                                    <span className="ml-tela__seletor">
                                        Todos os polímeros ({polimeros || "—"}) <span aria-hidden="true">▾</span>
                                    </span>
                                </div>
                                <div className="ml-tela__anos">
                                    {[ano - 3, ano - 2, ano - 1, ano].map((a) => (
                                        <span key={a}>{a}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {usuario?.verificacao_status === "pendente" && (
                <div className="ml-aviso">
                    <Aviso tom="alerta">
                        <strong>Cadastro em análise.</strong> A equipe está conferindo o CNPJ de {usuario.nome}. Assim que for aprovado, você poderá publicar
                        vagas e notícias{usuario.tipo_usuario === "laboratorio" ? ", receber resíduos e atender chamados" : " e abrir chamados"}.
                    </Aviso>
                </div>
            )}
            {usuario?.verificacao_status === "rejeitado" && (
                <div className="ml-aviso">
                    <Aviso tom="perigo">
                        <strong>Verificação recusada.</strong> {usuario.motivo_verificacao} Corrija o documento no seu perfil para uma nova análise.
                    </Aviso>
                </div>
            )}

            <main className="ml-principal">
                {/* ---------- Logo cloud ---------- */}
                <section className="ml-logos" aria-label="Quem faz parte">
                    <p data-revelar="fade">Quem faz parte:</p>
                    <ul>
                        {PARCEIROS.map(({ icone: Icone, nome }, i) => (
                            <li key={nome} data-revelar style={{ "--atraso": `${i * 70}ms` }}>
                                <Icone size={22} strokeWidth={2.2} aria-hidden="true" />
                                {nome}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* ---------- Atalhos por perfil (componente "Photo row") ---------- */}
                <section className="ml-atalhos" aria-labelledby="ml-atalhos-titulo">
                    <div className="ml-atalhos__topo" data-revelar>
                        <h2 id="ml-atalhos-titulo" className="ml-legenda">
                            Seus atalhos
                        </h2>
                    </div>
                    <Carrossel rotulo="Atalhos" automatico={6000} classe="ml-atalhos__carrossel">
                        {atalhos.map(({ para, icone: Icone, titulo, imagem: foto }) => (
                            <Link key={para} to={para} className="ml-foto">
                                <span className="ml-foto__imagem zoom-imagem">
                                    <img src={foto} alt="" loading="lazy" draggable="false" />
                                    <span className="ml-foto__icone">
                                        <Icone size={20} aria-hidden="true" />
                                    </span>
                                </span>
                                <span className="ml-foto__link">{titulo}</span>
                            </Link>
                        ))}
                    </Carrossel>
                </section>

                {/* ---------- Benefits section ---------- */}
                <section className="ml-beneficios">
                    <div className="ml-beneficios__texto">
                        <h2 className="ml-legenda" data-revelar>
                            Benefícios
                        </h2>
                        <p className="ml-h1" data-revelar style={{ "--atraso": "80ms" }}>
                            Desvendamos o ciclo do plástico.
                        </p>
                        <p className="ml-paragrafo" data-revelar style={{ "--atraso": "160ms" }}>
                            O EcoHub 3D mostra o caminho real do material, sem planilhas perdidas.
                        </p>
                    </div>
                    <div className="ml-icones">
                        {BENEFICIOS.map(({ icone: Icone, titulo, texto }, i) => (
                            <section key={titulo} className="ml-icone" aria-label={`Benefício ${i + 1} de 4`} data-revelar style={{ "--atraso": `${i * 110}ms` }}>
                                <Icone size={24} strokeWidth={2} aria-hidden="true" />
                                <div>
                                    <p className="ml-h3">{titulo}</p>
                                    <p className="ml-paragrafo">{texto}</p>
                                </div>
                            </section>
                        ))}
                    </div>
                </section>
                <div className="ml-imagem-grande zoom-imagem" data-revelar="escala">
                    <img src={montanhas} alt="Cordilheira colorida com neve" loading="lazy" />
                </div>

                {/* ---------- Features carousel ---------- */}
                <section className="ml-recursos">
                    <div className="ml-recursos__texto">
                        <div className="ml-recursos__titulo">
                            <p className="ml-h1" data-revelar>
                                Veja o quadro completo
                            </p>
                            <p className="ml-paragrafo" data-revelar style={{ "--atraso": "80ms" }}>
                                O EcoHub transforma doações, coletas e laudos em informação clara para cada instituição da rede.
                            </p>
                        </div>
                        <ol className="ml-lista">
                            {VANTAGENS.map((texto, i) => (
                                <li key={texto} data-revelar="esquerda" style={{ "--atraso": `${120 + i * 90}ms` }}>
                                    <b>{String(i + 1).padStart(2, "0")}</b>
                                    <span>{texto}</span>
                                </li>
                            ))}
                        </ol>
                        <span data-revelar style={{ "--atraso": "480ms" }}>
                            <BotaoClaro para="/rastreio">Descobrir mais</BotaoClaro>
                        </span>
                    </div>
                    <div className="ml-recursos__galeria" data-revelar="direita">
                        <Carrossel rotulo="Imagens do EcoHub" automatico={5000} classe="ml-galeria">
                            {IMAGENS_DESTAQUE.map((foto) => (
                                <div key={foto.alt} className="ml-galeria__slide zoom-imagem">
                                    <img src={foto.src} alt={foto.alt} loading="lazy" draggable="false" />
                                </div>
                            ))}
                        </Carrossel>
                    </div>
                </section>

                {/* ---------- Specifications table ---------- */}
                <section className="ml-specs">
                    <div className="ml-specs__texto">
                        <h2 className="ml-legenda" data-revelar>
                            Comparativo
                        </h2>
                        <p className="ml-h1" data-revelar style={{ "--atraso": "80ms" }}>
                            Por que o EcoHub 3D?
                        </p>
                        <p className="ml-paragrafo" data-revelar style={{ "--atraso": "160ms" }}>
                            Grupos de mensagens e planilhas não mostram de onde veio o plástico. Por isso criamos uma rede com rastreio, laudo e
                            instituições verificadas.
                        </p>
                        <span data-revelar style={{ "--atraso": "240ms" }}>
                            <BotaoClaro para="/projetos">Ver projetos</BotaoClaro>
                        </span>
                    </div>
                    <div className="ml-tabela" role="table" aria-label="Comparação entre o EcoHub 3D, grupos e planilhas e o descarte comum">
                        {COMPARATIVO.map((coluna, c) => (
                            <section key={coluna.nome} className={`ml-tabela__coluna ${c === 0 ? "ml-tabela__coluna--destaque" : ""}`} role="rowgroup" data-revelar style={{ "--atraso": `${c * 120}ms` }}>
                                <div className={`ml-tabela__cabeca ml-tabela__cabeca--${c}`} role="columnheader">
                                    {coluna.nome}
                                </div>
                                {coluna.itens.map(([sim, texto]) => (
                                    <div key={texto} className="ml-tabela__item" role="cell">
                                        {sim ? (
                                            <Check size={14} strokeWidth={2.5} className={c === 0 ? "ml-ok" : "ml-ok ml-ok--fraco"} aria-label="Sim" />
                                        ) : (
                                            <X size={14} strokeWidth={2.5} className="ml-nao" aria-label="Não" />
                                        )}
                                        <span>{texto}</span>
                                    </div>
                                ))}
                            </section>
                        ))}
                    </div>
                </section>

                {/* ---------- Testimonial section (com as últimas notícias) ---------- */}
                <section className="ml-depoimento" {...pausarDepoimento}>
                    <div className="ml-depoimento__imagem zoom-imagem" data-revelar="esquerda">
                        <img src={esferas} alt="Esfera de concreto equilibrada entre duas maiores" loading="lazy" />
                    </div>
                    <section className="ml-depoimento__citacao" aria-label="Destaque do EcoHub Notícias" aria-live="polite" data-revelar="direita">
                        {destaque ? (
                            <Link key={destaque.id} to={`/noticias/${destaque.id}`} className="ml-depoimento__texto">
                                “{destaque.titulo}”
                            </Link>
                        ) : (
                            <p className="ml-depoimento__texto">“Nenhum grama de plástico de impressão 3D precisa terminar no aterro.”</p>
                        )}
                        <div className="ml-depoimento__autor">
                            <p>{destaque?.usuario?.nome ?? "EcoHub 3D"}</p>
                            <p className="ml-legenda">{destaque ? `${destaque.tema} · ${tempoRelativo(destaque.data_publicacao)}` : "Manifesto"}</p>
                        </div>
                        {noticias.length > 1 && (
                            <div className="ml-depoimento__pontos">
                                {noticias.map((n, i) => (
                                    <button key={n.id} type="button" aria-label={`Notícia ${i + 1}`} aria-current={i === depoimento} onClick={() => irDepoimento(i)} />
                                ))}
                            </div>
                        )}
                    </section>
                </section>

                {/* ---------- How it works section ---------- */}
                <section className="ml-passos">
                    <div className="ml-passos__topo">
                        <p className="ml-h1" data-revelar>
                            Mapeie seu impacto
                        </p>
                        <span data-revelar style={{ "--atraso": "100ms" }}>
                            <BotaoClaro para="/ranking">Ver ranking</BotaoClaro>
                        </span>
                    </div>
                    <div className="ml-passos__grade">
                        {PASSOS.map(({ titulo, texto }, i) => (
                            <section key={titulo} className="ml-passo" aria-label={`Passo ${i + 1} de 3`} data-revelar style={{ "--atraso": `${i * 140}ms` }}>
                                <p className="ml-passo__numero">{String(i + 1).padStart(2, "0")}</p>
                                <div>
                                    <p className="ml-h3">{titulo}</p>
                                    <p className="ml-paragrafo">{texto}</p>
                                </div>
                            </section>
                        ))}
                    </div>
                </section>

                {/* ---------- Hero image ---------- */}
                <div className="ml-aerea" data-revelar="escala">
                    <div className="ml-aerea__imagem zoom-imagem">
                        <img src={aerea} alt="Vista aérea de colinas verdes e uma estrada sinuosa" loading="lazy" />
                    </div>
                </div>

                {/* ---------- Centered CTA ---------- */}
                <section className="ml-cta">
                    <p className="ml-h1" data-revelar>
                        Conecte-se à rede
                    </p>
                    <p className="ml-paragrafo" data-revelar style={{ "--atraso": "80ms" }}>
                        {numeros
                            ? `${numeros.projetos} projetos, ${numeros.vagas} vagas e ${numeros.noticias} notícias já circulam por aqui. Falta a sua parte.`
                            : "Makers, laboratórios, escolas públicas e empresas trocando resíduos, conhecimento e oportunidades."}
                    </p>
                    <span className="ml-cta__botao" data-revelar style={{ "--atraso": "160ms" }}>
                        <BotaoEscuro para={acaoPrincipal.para} bloco>
                            {acaoPrincipal.rotulo}
                        </BotaoEscuro>
                    </span>
                    <span className="ml-cta__selo" data-revelar="fade" style={{ "--atraso": "240ms" }}>
                        <Recycle size={14} aria-hidden="true" /> Economia circular da impressão 3D <Sprout size={14} aria-hidden="true" />
                    </span>
                </section>
            </main>
        </div>
    );
}
