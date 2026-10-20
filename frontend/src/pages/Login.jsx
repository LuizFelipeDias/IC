import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PainelMarca from "../components/PainelMarca";
import { Aviso, Campo } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import "../styles/pages/auth.css";

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
        <div className="auth">
            <PainelMarca
                titulo={
                    <>
                        A rede da impressão 3D <em>que não desperdiça</em>.
                    </>
                }
                descricao="Makers, laboratórios, escolas públicas e empresas trocando resíduos, conhecimento e oportunidades — com o material rastreado do carretel ao laudo."
            />

            <section className="auth__formulario">
                <div className="auth__cartao">
                    <span className="sobrelinha">Bem-vindo de volta</span>
                    <h1>Entrar</h1>
                    <p>Acesse sua conta para continuar.</p>

                    <form className="auth__campos" onSubmit={enviar} noValidate>
                        {erro && <Aviso tom="perigo">{erro}</Aviso>}

                        <Campo id="email" rotulo="E-mail">
                            <input id="email" type="email" className="entrada" autoComplete="email" placeholder="voce@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </Campo>
                        <Campo id="senha" rotulo="Senha">
                            <input id="senha" type="password" className="entrada" autoComplete="current-password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                        </Campo>

                        <button type="submit" className="botao botao--grande botao--bloco" disabled={enviando}>
                            {enviando ? "Entrando..." : "Entrar"} <ArrowRight size={18} aria-hidden="true" />
                        </button>
                    </form>

                    <p className="auth__rodape">
                        Ainda não tem conta? <Link to="/cadastro/usuario">Criar conta</Link>
                        <br />
                        <Link to="/rastreio">Rastrear um lote de filamento</Link> sem entrar
                    </p>

                    <div className="auth__demo">
                        Demonstração: <code>escola@ecohub3d.test</code>, <code>maker@ecohub3d.test</code>, <code>laboratorio@ecohub3d.test</code>,{" "}
                        <code>empresa@ecohub3d.test</code>, <code>moderador@ecohub3d.test</code> — senha <code>Senha@123</code>
                    </div>
                </div>
            </section>
        </div>
    );
}
