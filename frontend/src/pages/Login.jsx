import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError } from "../services/api";

// Componente para o ícone da Microsoft
const MicrosoftIcon = () => (
    <svg width="45" height="45" viewBox="0 0 23 23">
        <path fill="#f25022" d="M0 0h11v11H0z" />
        <path fill="#7fbb00" d="M12 0h11v11H12z" />
        <path fill="#00a1f1" d="M0 12h11v11H0z" />
        <path fill="#ffbb00" d="M12 12h11v11H12z" />
    </svg>
);

// Componente para o ícone do Google
const GoogleIcon = () => (
    <svg width="45" height="45" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
    </svg>
);

export default function Layout() {
    // Estados do formulário de login e controle de feedback
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);

    // Hook para gerenciar o redirecionamento de rotas
    const navigate = useNavigate();
    const { entrar } = useAuth();

    // Função executada ao enviar o formulário de login
    const handleLogin = async (e) => {
        e.preventDefault();

        if (loading) return;
        setMensagem("");
        setErro(false);
        setLoading(true);

        try {
            const data = await api('/login', { method: 'POST', body: { email, senha }, auth: false });

            if (!data?.token) {
                setErro(true);
                setMensagem("Falha de segurança: Token não fornecido pelo servidor.");
                return;
            }

            entrar(data.token);
            // Redireciona limpando o histórico para bloquear o botão de voltar
            navigate('/home', { replace: true });
        } catch (error) {
            setErro(true);
            setMensagem(error instanceof ApiError && error.status !== 0
                ? error.message
                : "Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-['Poppins',sans-serif]">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        
        .input-group label {
          position: absolute;
          top: -10px;
          left: 10px;
          background: white;
          padding: 0 5px;
          font-size: 13px;
          color: #858585;
          z-index: 10;
        }
        .input-group input {
          width: 100%;
          height: 52px;
          border: 1.5px solid #d1d1d1;
          padding: 0 15px;
          outline: none;
        }
        .btn-base {
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
        }
      `,
                }}
            />

            <section className="flex flex-col md:flex-row flex-1 border-b border-gray-100">
                <div className="flex-1 flex items-center justify-center p-6 md:p-10">
                    <form onSubmit={handleLogin} className="w-full max-w-[420px] flex flex-col gap-10">
                        <div className="flex justify-center gap-10">
                            <MicrosoftIcon />
                            <GoogleIcon />
                        </div>

                        <div className="w-full flex flex-col gap-8">
                            <div className="input-group relative w-full">
                                <label>Email ou Usuário</label>
                                <input
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group relative w-full">
                                <label>Senha</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {mensagem && (
                            <div className={`p-3 text-center font-bold text-sm rounded-sm ${erro ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                {mensagem}
                            </div>
                        )}

                        <div className="w-full flex flex-col gap-6 text-center">
                            <p className="text-[13px] font-bold text-[#8a8a8a] uppercase tracking-widest">
                                Esqueceu a senha?{" "}
                                <span className="text-[#007aff] cursor-pointer hover:underline">
                                    Clique aqui
                                </span>
                            </p>

                            <div className="flex flex-col gap-4 w-full">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-base bg-[#3800df] text-white hover:bg-[#2e00b8] transition-colors rounded-sm shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? "ENTRANDO..." : "ENTRAR"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/cadastro/usuario')}
                                    className="btn-base border-[2px] border-[#3800df] text-[#3800df] bg-white hover:bg-gray-50 transition-colors rounded-sm"
                                >
                                    NOVO CADASTRO
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="hidden md:flex flex-[1.2] bg-[#D9D9D9] items-center justify-center text-center p-10">
                    <h1 className="text-[60px] lg:text-[85px] font-bold text-black select-none tracking-tight leading-tight">
                        Bem Vindo
                    </h1>
                </div>
            </section>
        </div>
    );
}