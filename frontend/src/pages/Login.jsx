import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";
import RegistroLayout from "../components/RegistroLayout";
import { Aviso, Campo } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

export default function Login() {
    const navigate = useNavigate();
    const { entrar } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");

    const enviar = async (evento) => {
        evento.preventDefault();
        if (enviando) return;
        setEnviando(true);
        setErro("");

        try {
            const dados = await api("/login", { method: "POST", body: { email, senha }, auth: false });
            entrar(dados.token);
            navigate("/home", { replace: true });
        } catch (e) {
            setErro(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <RegistroLayout>
            <h1 className="registro__titulo">Entre na rede</h1>

            <Link to="/rastreio" className="registro__contorno">
                <QrCode size={20} aria-hidden="true" />
                Rastrear um lote sem entrar
            </Link>

            <span className="registro__ou">ou</span>

            <form className="registro__form" onSubmit={enviar} noValidate>
                {erro && <Aviso tom="perigo">{erro}</Aviso>}

                <Campo id="email" rotulo="E-mail">
                    <input id="email" type="email" className="entrada" autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Campo>
                <Campo id="senha" rotulo="Senha">
                    <input id="senha" type="password" className="entrada" autoComplete="current-password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </Campo>

                <button type="submit" className="registro__principal" disabled={enviando}>
                    {enviando ? "Entrando..." : "Entrar"}
                </button>
            </form>

            <div className="registro__textos">
                <span>
                    Ainda não tem conta? <Link to="/cadastro/usuario">Criar conta</Link>
                </span>
                <p className="registro__demo">
                    Contas de demonstração: <code>escola@ecohub3d.test</code>, <code>maker@ecohub3d.test</code>, <code>laboratorio@ecohub3d.test</code>,{" "}
                    <code>empresa@ecohub3d.test</code>, <code>moderador@ecohub3d.test</code> — senha <code>Senha@123</code>
                </p>
            </div>
        </RegistroLayout>
    );
}
