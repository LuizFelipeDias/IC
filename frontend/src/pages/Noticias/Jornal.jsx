import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, Search, TrendingUp } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import caderno from "../../assets/noticias/caderno.png";
import cidade from "../../assets/noticias/cidade.png";
import laboratorio from "../../assets/noticias/laboratorio.png";
import predios from "../../assets/noticias/predios.png";

/* Peças compartilhadas do portal (layout "New York Times News Portal" do Figma). */

const IMAGENS = { Pesquisa: laboratorio, Reciclagem: cidade, Mercado: predios, "Educação": caderno };
const TODAS = [cidade, laboratorio, predios, caderno];

/** Foto da matéria: pelo tema e, sem tema conhecido, pela posição. */
export const imagemDe = (noticia, indice = 0) => IMAGENS[noticia?.tema] ?? TODAS[(noticia?.id ?? indice) % TODAS.length];

export const minutosDeLeitura = (texto = "") => `${Math.max(1, Math.round(texto.split(/\s+/).length / 200))} MIN DE LEITURA`;

export const resumir = (texto = "", tamanho) => (texto.length > tamanho ? `${texto.slice(0, tamanho).trim()}…` : texto);

/** Divide o texto em dois parágrafos de resumo, como a manchete do Figma. */
export const doisParagrafos = (texto = "") => {
    const frases = texto.split(/(?<=[.!?])\s+/);
    const meio = Math.ceil(frases.length / 2);
    return [frases.slice(0, meio).join(" "), frases.slice(meio).join(" ")].filter(Boolean);
};

const IDIOMAS = [
    { para: "/noticias", rotulo: "NOTÍCIAS", forte: true },
    { para: "/projetos", rotulo: "PROJETOS" },
    { para: "/doacoes", rotulo: "DOAÇÕES" },
    { para: "/vagas", rotulo: "VAGAS" },
    { para: "/rastreio", rotulo: "RASTREIO" },
];

const hoje = () => {
    const texto = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/** Cabeçalho do jornal: idiomas, data, logotipo, botões, indicador e editorias. */
export function Cabecalho({ temas = [], tema, aoEscolherTema, busca, aoBuscar, total = 0 }) {
    const { pode } = useAuth();
    const [buscando, setBuscando] = useState(Boolean(busca));
    const metade = Math.ceil(temas.length / 2);
    const grupos = [temas.slice(0, metade), temas.slice(metade)];

    const seta = <ChevronDown size={12} strokeWidth={1.5} aria-hidden="true" />;
    // No portal a editoria filtra a página; nas outras telas leva ao portal já filtrado.
    const editoria = (nome) =>
        aoEscolherTema ? (
            <button key={nome} type="button" className={`nyt-topo__editoria ${tema === nome ? "ativa" : ""}`} aria-pressed={tema === nome} onClick={() => aoEscolherTema(tema === nome ? "" : nome)}>
                {nome}
                {seta}
            </button>
        ) : (
            <Link key={nome} to={`/noticias?tema=${encodeURIComponent(nome)}`} className="nyt-topo__editoria">
                {nome}
                {seta}
            </Link>
        );

    return (
        <header className="nyt-topo">
            <nav className="nyt-topo__idiomas" aria-label="Seções da plataforma">
                {IDIOMAS.map((item) => (
                    <Link key={item.para} to={item.para} className={item.forte ? "forte" : ""}>
                        {item.rotulo}
                    </Link>
                ))}
            </nav>

            <div className="nyt-topo__icones">
                <Link to="/noticias" aria-label="Todas as notícias" onClick={() => aoEscolherTema?.("")}>
                    <Menu size={16} strokeWidth={1.75} aria-hidden="true" />
                </Link>
                {aoBuscar && (
                    <button type="button" aria-label="Buscar notícias" aria-expanded={buscando} onClick={() => setBuscando((v) => !v)}>
                        <Search size={16} strokeWidth={1.75} aria-hidden="true" />
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
                <span>Edição de hoje</span>
            </div>

            <Link to="/noticias" className="nyt-topo__logo" onClick={() => aoEscolherTema?.("")}>
                EcoHub Notícias
            </Link>

            <div className="nyt-topo__botoes">
                {pode("publicador") && (
                    <Link to="/noticias/nova" className="nyt-botao">
                        ESCREVER NOTÍCIA
                    </Link>
                )}
                <Link to="/publicacoes" className="nyt-botao">
                    MINHAS PUBLICAÇÕES
                </Link>
            </div>

            {total > 0 && (
            <p className="nyt-topo__indicador">
                <span>Reportagens</span>
                <span className="alta">
                    {total} <TrendingUp size={10} aria-hidden="true" />
                </span>
            </p>
            )}

            <hr className="nyt-topo__linha" />

            {temas.length > 0 && (
                <nav className="nyt-topo__editorias" aria-label="Editorias">
                    <div>{grupos[0].map(editoria)}</div>
                    <div>{grupos[1].map(editoria)}</div>
                </nav>
            )}

            <div className="nyt-topo__dupla" aria-hidden="true" />
        </header>
    );
}

/** Rótulo pequeno em caixa-alta (componente "TAG" do Figma). */
export function Tag({ children, forte = false, claro = false }) {
    return <span className={`nyt-tag ${forte ? "nyt-tag--forte" : ""} ${claro ? "nyt-tag--claro" : ""}`}>{children}</span>;
}
