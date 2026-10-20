import React from "react";
import { Link } from "react-router-dom";
import { Github, MessageCircle } from "lucide-react";
import Marca from "./Marca";

/*
 * Rodapé clonado do frame "footer" 113:7361 do arquivo Figma
 * "Footers — a collection of sleek and versatile footer designs":
 * fundo #122031, marca à esquerda, três colunas de links (385/615/845 px),
 * botão laranja "Get In Touch" à direita e, embaixo, redes em círculos,
 * contato sob um traço azul e o copyright alinhado à direita.
 */
const COLUNAS = [
    {
        titulo: "Plataforma",
        links: [
            { para: "/projetos", rotulo: "Repositório de projetos" },
            { para: "/noticias", rotulo: "Notícias" },
            { para: "/doacoes", rotulo: "Mural de doações" },
            { para: "/rastreio", rotulo: "Rastrear filamento" },
            { para: "/ranking", rotulo: "Ranking de impacto" },
        ],
    },
    {
        titulo: "Participe",
        links: [
            { para: "/chamados", rotulo: "Chamados de escolas" },
            { para: "/vagas", rotulo: "Vagas" },
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

const ISSUES = "https://github.com/LuizFelipeDias/IC/issues";

export default function Footer() {
    return (
        <footer className="rodape">
            <div className="rodape__interno">
                <div className="rodape__topo">
                    <Link to="/home" className="rodape__marca" aria-label="EcoHub 3D — início">
                        <Marca />
                    </Link>

                    {COLUNAS.map((coluna) => (
                        <nav key={coluna.titulo} className="rodape__coluna" aria-label={coluna.titulo}>
                            <h2>{coluna.titulo}</h2>
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

                    <a href={ISSUES} target="_blank" rel="noreferrer" className="rodape__contato-botao">
                        Fale com a equipe
                    </a>
                </div>

                <div className="rodape__base">
                    <div className="rodape__redes">
                        <a href="https://github.com/LuizFelipeDias/IC" target="_blank" rel="noreferrer" aria-label="Repositório no GitHub">
                            <Github size={16} aria-hidden="true" />
                        </a>
                        <a href={ISSUES} target="_blank" rel="noreferrer" aria-label="Abrir uma issue">
                            <MessageCircle size={16} aria-hidden="true" />
                        </a>
                    </div>

                    <div className="rodape__contato">
                        <span>UEPG · Ponta Grossa, PR</span>
                        <a href="https://github.com/LuizFelipeDias/IC" target="_blank" rel="noreferrer">
                            github.com/LuizFelipeDias/IC
                        </a>
                    </div>

                    <p className="rodape__direitos">
                        © {new Date().getFullYear()} — EcoHub 3D
                        <br />
                        PIBITI · Universidade Estadual de Ponta Grossa
                    </p>
                </div>
            </div>
        </footer>
    );
}
