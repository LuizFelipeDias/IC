import React from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowUpRight, Github, MapPin, MessageCircle } from "lucide-react";
import Marca from "./Marca";

const COLUNAS = [
    {
        titulo: "Plataforma",
        links: [
            { para: "/projetos", rotulo: "Repositório de projetos" },
            { para: "/noticias", rotulo: "Notícias" },
            { para: "/doacoes", rotulo: "Mural de doações" },
            { para: "/rastreio", rotulo: "Rastrear filamento" },
        ],
    },
    {
        titulo: "Participe",
        links: [
            { para: "/cadastro/usuario", rotulo: "Criar conta" },
            { para: "/chamados", rotulo: "Chamados de escolas" },
            { para: "/vagas", rotulo: "Vagas" },
            { para: "/ranking", rotulo: "Ranking de impacto" },
        ],
    },
    {
        titulo: "Projeto",
        links: [
            { href: "https://www.uepg.br", rotulo: "UEPG" },
            { href: "https://github.com/LuizFelipeDias/IC", rotulo: "Código-fonte" },
            { href: "https://github.com/LuizFelipeDias/IC/blob/main/docs/DIAGNOSTICO_E_ROADMAP.md", rotulo: "Relatório técnico" },
        ],
    },
];

const voltarAoTopo = () => window.scrollTo({ top: 0, behavior: "smooth" });

/* Rodapé em três faixas: chamada para ação, colunas de links e barra legal. */
export default function Footer() {
    return (
        <footer className="rodape">
            <div className="container">
                <section className="rodape__chamada">
                    <div>
                        <span className="rodape__sobrelinha">Economia circular da impressão 3D</span>
                        <h2 className="rodape__titulo">
                            Do resíduo à <span>nova peça</span>.
                        </h2>
                    </div>
                    <div className="rodape__acoes">
                        <Link to="/doacoes" className="botao botao--grande">
                            Doar resíduos <ArrowUpRight size={18} aria-hidden="true" />
                        </Link>
                        <Link to="/rastreio" className="botao botao--grande rodape__botao-claro">
                            Rastrear um lote
                        </Link>
                    </div>
                </section>

                <div className="rodape__grade">
                    <div className="rodape__sobre">
                        <Marca />
                        <p>
                            Conecta makers, laboratórios, escolas públicas e empresas, e rastreia o filamento reciclado da doação ao laudo.
                        </p>
                        <ul className="rodape__contato">
                            <li>
                                <MapPin size={16} aria-hidden="true" /> UEPG · Ponta Grossa, PR
                            </li>
                            <li>
                                <MessageCircle size={16} aria-hidden="true" /> <a href="https://github.com/LuizFelipeDias/IC/issues" target="_blank" rel="noreferrer">Fale com a equipe</a>
                            </li>
                        </ul>
                        <div className="rodape__sociais">
                            <a href="https://github.com/LuizFelipeDias/IC" target="_blank" rel="noreferrer" aria-label="Repositório no GitHub">
                                <Github size={18} aria-hidden="true" />
                            </a>
                            <a href="https://github.com/LuizFelipeDias/IC/issues" target="_blank" rel="noreferrer" aria-label="Abrir uma issue">
                                <MessageCircle size={18} aria-hidden="true" />
                            </a>
                        </div>
                    </div>

                    {COLUNAS.map((coluna) => (
                        <nav key={coluna.titulo} aria-label={coluna.titulo}>
                            <h3>{coluna.titulo}</h3>
                            <ul>
                                {coluna.links.map((link) => (
                                    <li key={link.rotulo}>
                                        {link.para ? (
                                            <Link to={link.para}>{link.rotulo}</Link>
                                        ) : (
                                            <a href={link.href} target="_blank" rel="noreferrer">
                                                {link.rotulo}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="rodape__base">
                    <span>© {new Date().getFullYear()} EcoHub 3D · PIBITI — Universidade Estadual de Ponta Grossa</span>
                    <div className="rodape__legal">
                        <span>Dados tratados conforme a LGPD</span>
                        <button type="button" onClick={voltarAoTopo}>
                            Voltar ao topo <ArrowUp size={14} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
