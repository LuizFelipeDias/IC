import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Gamepad2, Home as Casa, Menu, PlayCircle, Recycle, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import aerea from "../../assets/noticias/aerea.webp";
import caderno from "../../assets/noticias/caderno.webp";
import cidade from "../../assets/noticias/cidade.webp";
import cilindros from "../../assets/noticias/cilindros.webp";
import esferas from "../../assets/noticias/esferas.webp";
import halteres from "../../assets/noticias/halteres.webp";
import laboratorio from "../../assets/noticias/laboratorio.webp";
import lanche from "../../assets/noticias/lanche.webp";
import mesa from "../../assets/noticias/mesa.webp";
import montanhas from "../../assets/noticias/montanhas.webp";
import ovos from "../../assets/noticias/ovos.webp";
import pao from "../../assets/noticias/pao.webp";
import paoForma from "../../assets/noticias/pao-forma.webp";
import prato from "../../assets/noticias/prato.webp";
import predios from "../../assets/noticias/predios.webp";
import sopa from "../../assets/noticias/sopa.webp";

/*
 * Peças compartilhadas do portal — frame "NYTimes Home Page" (Figma 1:131).
 * O arquivo usa Georgia (títulos e textos) e Helvetica Neue (rótulos); fora do
 * Mac/Windows elas caem em Gelasio e Arimo, que têm as mesmas métricas.
 */

/* Fotos neutras (prédios, paisagens, objetos, comida, laboratório) por formato de quadro. */
const FOTOS = {
    grande: [cidade, montanhas, aerea, cilindros, esferas, laboratorio, ovos, halteres], // 592 × 356 / 335 × 225
    media: [laboratorio, halteres, ovos, montanhas, aerea, cidade, cilindros, esferas], // 304 × 160
    pequena: [pao, paoForma, sopa, mesa, lanche, predios, ovos, laboratorio, halteres], // 152 × 100 / 96 × 96
    alta: [caderno, prato, esferas, cilindros, laboratorio, cidade], // 144 × 160 / 144 × 186
};

/** Foto da matéria para um quadro: o formato escolhe a coleção e a posição escolhe a foto. */
export const imagemDe = (noticia, indice = 0, formato = "grande") => {
    const fotos = FOTOS[formato] ?? FOTOS.grande;
    return fotos[Math.abs(indice) % fotos.length];
};

export const minutosDeLeitura = (texto = "") => `${Math.max(1, Math.round(texto.split(/\s+/).length / 200))} MIN DE LEITURA`;

export const resumir = (texto = "", tamanho) => (texto.length > tamanho ? `${texto.slice(0, tamanho).trim()}…` : texto);

/** Divide o texto em dois parágrafos de resumo, como a manchete do Figma. */
export const doisParagrafos = (texto = "") => {
    const frases = texto.split(/(?<=[.!?])\s+/);
    const meio = Math.ceil(frases.length / 2);
    return [frases.slice(0, meio).join(" "), frases.slice(meio).join(" ")].filter(Boolean);
};

/* "U.S. · INTERNATIONAL · CANADA · ESPAÑOL · 中文" */
const SECOES = [
    { para: "/noticias", rotulo: "NOTÍCIAS" },
    { para: "/projetos", rotulo: "PROJETOS" },
    { para: "/doacoes", rotulo: "DOAÇÕES" },
    { para: "/vagas", rotulo: "VAGAS" },
    { para: "/rastreio", rotulo: "RASTREIO" },
];

/* Editorias do grupo da esquerda (6, como "U.S. … Opinions") — filtram o portal. */
const EDITORIAS = ["Pesquisa", "Reciclagem", "Mercado", "Educação", "Plataforma", "Eventos"];

/* Grupo da direita (5, como "Audio … The Athletic") — outras áreas da plataforma. */
const AREAS = [
    { para: "/projetos", rotulo: "Projetos" },
    { para: "/doacoes", rotulo: "Doações" },
    { para: "/vagas", rotulo: "Vagas" },
    { para: "/rastreio", rotulo: "Rastreio" },
    { para: "/ranking", rotulo: "Ranking" },
];

const hoje = () => {
    const texto = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/** Indicador do canto direito ("S&P 500 +0.13%"): reportagens publicadas nos últimos 30 dias. */
const indicador = (noticias) => {
    if (!noticias.length) return null;
    const limite = Date.now() - 30 * 86400000;
    const recentes = noticias.filter((n) => new Date(n.data_publicacao ?? 0).getTime() >= limite).length;
    return recentes ? `+${recentes}` : null;
};

const Seta = () => <ChevronDown size={12} strokeWidth={1.5} aria-hidden="true" />;

/** Cabeçalho do jornal (Top Bar 1:602). */
export function Cabecalho({ noticias = [], tema, aoEscolherTema, busca, aoBuscar }) {
    const { pode } = useAuth();
    const [buscando, setBuscando] = useState(Boolean(busca));
    const temasDados = noticias.map((n) => n.tema).filter(Boolean);
    const editorias = [...new Set([...EDITORIAS.filter((t) => temasDados.includes(t)), ...temasDados, ...EDITORIAS])].slice(0, 6);
    const alta = indicador(noticias);

    // No portal a editoria filtra a página; nas outras telas leva ao portal já filtrado.
    const editoria = (nome) =>
        aoEscolherTema ? (
            <button key={nome} type="button" className={`nyt-topo__item ${tema === nome ? "ativa" : ""}`} aria-pressed={tema === nome} onClick={() => aoEscolherTema(tema === nome ? "" : nome)}>
                <span>{nome}</span>
                <Seta />
            </button>
        ) : (
            <Link key={nome} to={`/noticias?tema=${encodeURIComponent(nome)}`} className="nyt-topo__item">
                <span>{nome}</span>
                <Seta />
            </Link>
        );

    return (
        <header className="nyt-topo">
            <nav className="nyt-topo__secoes" aria-label="Seções da plataforma">
                {SECOES.map((item, i) => (
                    <Link key={item.para} to={item.para} className={i === 0 ? "forte" : ""}>
                        {item.rotulo}
                    </Link>
                ))}
            </nav>

            <div className="nyt-topo__icones">
                <Link to="/noticias" aria-label="Todas as notícias" onClick={() => aoEscolherTema?.("")}>
                    <Menu size={16} strokeWidth={2} aria-hidden="true" />
                </Link>
                {aoBuscar && (
                    <button type="button" aria-label="Buscar notícias" aria-expanded={buscando} onClick={() => setBuscando((v) => !v)}>
                        <Search size={13} strokeWidth={2.25} aria-hidden="true" />
                    </button>
                )}
            </div>
            {buscando && aoBuscar && (
                <label className="nyt-topo__busca">
                    <span className="sr-only">Buscar notícias</span>
                    <input type="search" autoFocus placeholder="Buscar no jornal" value={busca} onChange={(e) => aoBuscar(e.target.value)} />
                </label>
            )}

            <div className="nyt-topo__data">
                <strong>{hoje()}</strong>
                <Link to="/noticias" onClick={() => aoEscolherTema?.("")}>
                    Edição de hoje
                </Link>
            </div>

            <Link to="/noticias" className="nyt-topo__logo" onClick={() => aoEscolherTema?.("")}>
                EcoHub Notícias
            </Link>

            {pode("publicador") && (
                <div className="nyt-topo__botoes">
                    <Link to="/publicacoes" className="nyt-botao">
                        MINHAS PUBLICAÇÕES
                    </Link>
                    <Link to="/noticias/nova" className="nyt-botao">
                        ESCREVER
                    </Link>
                </div>
            )}

            {alta && (
                <p className="nyt-topo__indicador" title="Reportagens publicadas nos últimos 30 dias">
                    <span>Reportagens no mês</span>
                    <span className="alta">
                        {alta}
                        <svg width="5" height="9" viewBox="0 0 5 9" aria-hidden="true">
                            <path d="M2.5 9V1M.5 3l2-2 2 2" fill="none" stroke="currentColor" strokeWidth="1" />
                        </svg>
                    </span>
                </p>
            )}

            <hr className="nyt-topo__linha" />

            <nav className="nyt-topo__editorias nyt-topo__editorias--esquerda" aria-label="Editorias">
                {editorias.map(editoria)}
            </nav>
            <nav className="nyt-topo__editorias nyt-topo__editorias--direita" aria-label="Áreas da plataforma">
                {AREAS.map((area) => (
                    <Link key={area.rotulo} to={area.para} className="nyt-topo__item">
                        <span>{area.rotulo}</span>
                        <Seta />
                    </Link>
                ))}
            </nav>

            <div className="nyt-topo__dupla" aria-hidden="true" />
        </header>
    );
}

/** Rótulo pequeno em caixa-alta (componente "TAG" do Figma). */
export function Tag({ children, forte = false, claro = false }) {
    return <span className={`nyt-tag ${forte ? "nyt-tag--forte" : ""} ${claro ? "nyt-tag--claro" : ""}`}>{children}</span>;
}

const tema = (nome) => `/noticias?tema=${encodeURIComponent(nome)}`;

/* Colunas do rodapé (NEWS · OPINION · ARTS · LIVING · MORE), com rotas reais da plataforma. */
const COLUNAS_RODAPE = [
    {
        titulo: "NOTÍCIAS",
        links: [
            ["Página inicial", "/home"],
            ["Todas as notícias", "/noticias"],
            ["Pesquisa", tema("Pesquisa")],
            ["Reciclagem", tema("Reciclagem")],
            ["Mercado", tema("Mercado")],
            ["Educação", tema("Educação")],
            ["Plataforma", tema("Plataforma")],
            ["Eventos", tema("Eventos")],
            ["Edição de hoje", "/noticias"],
            ["Minhas publicações", "/publicacoes"],
        ],
    },
    {
        titulo: "PROJETOS",
        links: [
            ["Repositório", "/projetos"],
            ["Publicar projeto", "/projetos/novo"],
            ["Ranking de impacto", "/ranking"],
            ["Instituições", "/instituicoes"],
        ],
    },
    {
        titulo: "ECONOMIA",
        links: [
            ["Doações", "/doacoes"],
            ["Nova doação", "/doacoes/nova"],
            ["Lotes reciclados", "/lotes"],
            ["Rastreio", "/rastreio"],
            ["Ranking", "/ranking"],
        ],
    },
    {
        titulo: "CARREIRAS",
        links: [
            ["Vagas", "/vagas"],
            ["Publicar vaga", "/vagas/nova"],
            ["Currículo", "/curriculo"],
            ["Chamados de escolas", "/chamados"],
            ["Abrir chamado", "/chamados/novo"],
        ],
    },
    {
        titulo: "MAIS",
        links: [
            ["Curadoria", "/moderacao"],
            ["Instituições parceiras", "/instituicoes"],
            ["Rastrear filamento", "/rastreio"],
            ["Ranking", "/ranking"],
            ["Escrever notícia", "/noticias/nova"],
        ],
    },
];

const PARTICIPE = [
    { rotulo: "Doar resíduos", para: "/doacoes/nova", icone: Recycle },
    { rotulo: "Publicar projeto", para: "/projetos/novo", icone: PlayCircle },
    { rotulo: "Ranking", para: "/ranking", icone: Gamepad2 },
    { rotulo: "Página inicial", para: "/home", icone: Casa },
];

const LINKS_PEQUENOS = [
    ["Rastreio de lotes", "/rastreio"],
    ["Instituições", "/instituicoes"],
    ["Vagas", "/vagas"],
    ["Chamados", "/chamados"],
    ["Projetos", "/projetos"],
    ["Doações", "/doacoes"],
];

const LINKS_LEGAIS = [
    ["Notícias", "/noticias"],
    ["Projetos", "/projetos"],
    ["Doações", "/doacoes"],
    ["Lotes", "/lotes"],
    ["Rastreio", "/rastreio"],
    ["Vagas", "/vagas"],
    ["Chamados", "/chamados"],
    ["Instituições", "/instituicoes"],
    ["Ranking", "/ranking"],
    ["Currículo", "/curriculo"],
    ["Publicações", "/publicacoes"],
];

/** Rodapé do jornal (Footer 1:482 + Links 1:588): logotipo, cinco colunas, "SUBSCRIBE" e linha final. */
export function RodapeJornal() {
    return (
        <footer className="nyt-rodape" aria-label="Mapa do jornal">
            <Link to="/noticias" className="nyt-rodape__logo">
                EcoHub Notícias
            </Link>
            <div className="nyt-rodape__corpo">
                <div className="nyt-rodape__colunas">
                    {COLUNAS_RODAPE.map((coluna) => (
                        <nav key={coluna.titulo} aria-label={coluna.titulo}>
                            <h2>{coluna.titulo}</h2>
                            <ul>
                                {coluna.links.map(([rotulo, para]) => (
                                    <li key={rotulo}>
                                        <Link to={para}>{rotulo}</Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>
                <div className="nyt-rodape__participe">
                    <h2>PARTICIPE</h2>
                    <ul className="nyt-rodape__grandes">
                        {PARTICIPE.map(({ rotulo, para, icone: Icone }) => (
                            <li key={rotulo}>
                                <Link to={para}>
                                    <Icone size={24} strokeWidth={2.25} aria-hidden="true" />
                                    {rotulo}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <hr />
                    <ul className="nyt-rodape__pequenos">
                        {LINKS_PEQUENOS.map(([rotulo, para]) => (
                            <li key={rotulo}>
                                <Link to={para}>{rotulo}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <nav className="nyt-rodape__legal" aria-label="Links do rodapé">
                <span>© {new Date().getFullYear()} EcoHub 3D · UEPG</span>
                {LINKS_LEGAIS.map(([rotulo, para]) => (
                    <Link key={rotulo} to={para}>
                        {rotulo}
                    </Link>
                ))}
            </nav>
        </footer>
    );
}
