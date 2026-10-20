import React from "react";
import { Link, NavLink } from "react-router-dom";
import Marca from "./Marca";
import estudante from "../assets/ilustracoes/estudante.png";
import maker from "../assets/ilustracoes/maker.png";
import "../styles/pages/auth.css";

/*
 * Moldura das telas de entrada (login e cadastro), no estilo do arquivo
 * "Register Page for Web": barra branca no topo, coluna central estreita e
 * uma ilustração de cada lado.
 */
export default function RegistroLayout({ children, largo = false }) {
    return (
        <div className="registro">
            <header className="registro__barra">
                <Link to="/" aria-label="EcoHub 3D — entrar">
                    <Marca />
                </Link>

                <nav className="registro__links" aria-label="Acesso">
                    <NavLink to="/rastreio" className="registro__link">
                        Rastrear lote
                    </NavLink>
                    <a href="https://github.com/LuizFelipeDias/IC" className="registro__link" target="_blank" rel="noreferrer">
                        Sobre o projeto
                    </a>
                    <NavLink to="/" end className="registro__link">
                        Entrar
                    </NavLink>
                    <Link to="/cadastro/usuario" className="registro__botao-topo">
                        Criar conta
                    </Link>
                </nav>
            </header>

            <main className="registro__palco">
                <img src={estudante} alt="" className="registro__ilustracao registro__ilustracao--esquerda" width="351" height="471" />
                <div className={`registro__coluna ${largo ? "registro__coluna--larga" : ""}`}>{children}</div>
                <img src={maker} alt="" className="registro__ilustracao registro__ilustracao--direita" width="450" height="377" />
            </main>
        </div>
    );
}
