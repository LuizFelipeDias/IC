import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, QrCode, ShieldCheck, Star, X } from "lucide-react";
import Marca from "./Marca";
import { useAuth } from "../contexts/AuthContext";
import { iniciais, TIPOS_USUARIO } from "../utils/formatar";

// "perfis": o link só aparece para quem tem um deles (mesma regra da API).
const LINKS = [
    { para: "/home", rotulo: "Início" },
    { para: "/chamados", rotulo: "Chamados", perfis: ["solicitante", "prestador", "moderador"] },
    { para: "/vagas", rotulo: "Vagas" },
    { para: "/projetos", rotulo: "Projetos" },
    { para: "/noticias", rotulo: "Notícias" },
    { para: "/doacoes", rotulo: "Doações" },
    { para: "/lotes", rotulo: "Lotes", perfis: ["receptor"] },
    { para: "/moderacao", rotulo: "Moderação", perfis: ["moderador"] },
];

const STATUS_VERIFICACAO = {
    pendente: "Cadastro em análise",
    verificado: "Instituição verificada",
    rejeitado: "Verificação recusada",
};

export default function Nav() {
    const { usuario, sair, pode } = useAuth();
    const navigate = useNavigate();
    const local = useLocation();
    const [menuAberto, setMenuAberto] = useState(false);
    const [linksAbertos, setLinksAbertos] = useState(false);
    const refMenu = useRef(null);

    useEffect(() => {
        setMenuAberto(false);
        setLinksAbertos(false);
    }, [local.pathname]);

    useEffect(() => {
        const fecharFora = (evento) => refMenu.current && !refMenu.current.contains(evento.target) && setMenuAberto(false);
        document.addEventListener("mousedown", fecharFora);
        return () => document.removeEventListener("mousedown", fecharFora);
    }, []);

    const encerrar = async () => {
        await sair();
        navigate("/", { replace: true });
    };

    const links = LINKS.filter((link) => !link.perfis || pode(...link.perfis));

    return (
        <header className="nav">
            <nav className="container nav__interno" aria-label="Principal">
                <Link to="/home" aria-label="EcoHub 3D — início">
                    <Marca />
                </Link>

                <div className={`nav__links ${linksAbertos ? "aberto" : ""}`}>
                    {links.map((link) => (
                        <NavLink key={link.para} to={link.para} className={({ isActive }) => `nav__link ${isActive ? "ativo" : ""}`}>
                            {link.rotulo}
                        </NavLink>
                    ))}
                </div>

                <div className="nav__acoes">
                    <Link to="/rastreio" className="nav__circulo" title="Rastrear lote por QR Code">
                        <QrCode size={16} aria-hidden="true" />
                        <span className="sr-only">Rastrear lote</span>
                    </Link>

                    {usuario && (
                        <div className="nav__usuario" ref={refMenu}>
                            <button type="button" className="nav__usuario-botao" aria-expanded={menuAberto} onClick={() => setMenuAberto((aberto) => !aberto)}>
                                <span className="avatar">{iniciais(usuario.nome)}</span>
                                <span className="nav__usuario-nome">{usuario.tipo_usuario === "pessoa_fisica" ? usuario.nome.split(" ")[0] : usuario.nome}</span>
                            </button>

                            {menuAberto && (
                                <div className="menu-suspenso">
                                    <div className="menu-suspenso__cabecalho">
                                        <strong>{usuario.nome}</strong>
                                        <div className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>
                                            {TIPOS_USUARIO[usuario.tipo_usuario]}
                                            {usuario.prestador_servico && " · maker/voluntário"}
                                        </div>
                                        {usuario.verificacao_status && (
                                            <div className="linha" style={{ marginTop: "var(--esp-2)", gap: "var(--esp-1)", fontSize: "var(--texto-xs)" }}>
                                                <ShieldCheck size={14} aria-hidden="true" /> {STATUS_VERIFICACAO[usuario.verificacao_status]}
                                            </div>
                                        )}
                                    </div>
                                    <Link to="/ranking" className="menu-suspenso__item">
                                        <Star size={16} aria-hidden="true" /> {usuario.pontos_total ?? 0} pontos · ranking
                                    </Link>
                                    {pode("candidato") && (
                                        <Link to="/curriculo" className="menu-suspenso__item">
                                            Meu currículo
                                        </Link>
                                    )}
                                    <button type="button" className="menu-suspenso__item" onClick={encerrar}>
                                        <LogOut size={16} aria-hidden="true" /> Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {!usuario && (
                        <Link to="/" className="nav__botao">
                            Entrar
                        </Link>
                    )}

                    <button
                        type="button"
                        className="nav__circulo nav__hamburguer"
                        aria-label={linksAbertos ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={linksAbertos}
                        onClick={() => setLinksAbertos((aberto) => !aberto)}
                    >
                        {linksAbertos ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>
            </nav>
        </header>
    );
}
