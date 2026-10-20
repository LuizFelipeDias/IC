import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
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

export default function Footer() {
    return (
        <footer className="rodape">
            <div className="container">
                <div className="rodape__chamada">
                    <h2 className="rodape__titulo">
                        Do resíduo à <span>nova peça</span>.
                    </h2>
                    <Link to="/doacoes" className="botao botao--grande">
                        Doar resíduos <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                </div>

                <div className="rodape__grade">
                    <div className="rodape__sobre">
                        <Marca className="rodape__marca" />
                        <p>
                            Plataforma de economia circular para o ecossistema da impressão 3D: conecta makers, laboratórios,
                            escolas públicas e empresas, e rastreia o filamento reciclado da doação ao laudo.
                        </p>
                        <div className="rodape__ciclo" aria-label="Ciclo do material">
                            {["Doação", "Coleta", "Reciclagem", "Filamento", "Nova peça"].map((etapa) => (
                                <span key={etapa}>{etapa}</span>
                            ))}
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
                    <span>Feito para a economia circular da manufatura aditiva</span>
                </div>
            </div>
        </footer>
    );
}
