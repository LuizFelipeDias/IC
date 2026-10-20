import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api, ApiError } from "../../services/api";
import { MenuItem, Select, Collapse } from "@mui/material";

// --- FUNÇÕES DE MÁSCARA ---
const maskTelefone = (value) => {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d)(\d{4})$/, "$1-$2")
        .slice(0, 15);
};

const maskCPF = (value) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14);
};

const maskCNPJ = (value) => {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18);
};

// --- COMPONENTE DE INPUT CUSTOMIZADO ---
const CustomInput = ({ label, placeholder, type = "text", value, onChange }) => (
    <div className="input-group relative w-full">
        <label>{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required
        />
    </div>
);

// Tipos de usuário aceitos pela API (tipo_usuario) e o que cada um faz na plataforma.
const TIPOS_PERFIL = [
    { valor: "pessoa_fisica", rotulo: "Pessoa física", titulo: <>Área do<br />Profissional</>, ajuda: "Estudantes, profissionais e makers: candidatam-se a vagas e podem atender chamados." },
    { valor: "empresa", rotulo: "Empresa", titulo: <>Área da<br />Empresa</>, ajuda: "Publica vagas e notícias e abre chamados." },
    { valor: "escola", rotulo: "Escola", titulo: <>Área da<br />Escola</>, ajuda: "Escolas públicas abrem chamados de treinamento, modelagem e impressão." },
    { valor: "laboratorio", rotulo: "Laboratório", titulo: <>Área do<br />Laboratório</>, ajuda: "Laboratórios recebem resíduos, atendem chamados e publicam vagas e notícias." },
];

export default function CadastroUsuario() {
    const { entrar } = useAuth();

    // 1. Dados Básicos
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [confirmarEmail, setConfirmarEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    // 2. Tipo de usuário (define as permissões na plataforma)
    const [tipoPerfil, setTipoPerfil] = useState("pessoa_fisica");
    const pessoaFisica = tipoPerfil === "pessoa_fisica";

    // 3. Dados Estudante
    const [cpf, setCPF] = useState("");
    const [profissao, setProfissao] = useState("");
    const [sexo, setSexo] = useState("");

    const [prestador, setPrestador] = useState(false);

    // 4. Dados de pessoa jurídica (empresa, escola, laboratório)
    const [cnpj, setCnpj] = useState("");
    const [codigoInep, setCodigoInep] = useState("");

    // 5. Status da requisição e validações
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);

    // Inicializamos o hook de navegação
    const navigate = useNavigate();

    // 6. Função de Envio (POST)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;
        setMensagem("");
        setErro(false);

        // Validação de E-mail
        if (email !== confirmarEmail) {
            setErro(true);
            setMensagem("Os e-mails não coincidem.");
            return;
        }

        // Validação de Senha
        if (senha !== confirmarSenha) {
            setErro(true);
            setMensagem("As senhas não coincidem.");
            return;
        }

        const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regexSenhaForte.test(senha)) {
            setErro(true);
            setMensagem("Mínimo 8 caracteres: maiúsculas, minúsculas, números e símbolo (@$!%*?&).");
            return;
        }

        setLoading(true);

        const payload = {
            nome, email, telefone, senha,
            tipo_usuario: tipoPerfil,
            ...(pessoaFisica
                ? { cpf, profissao, sexo: sexo === "" ? null : sexo === "Feminino", prestador_servico: prestador }
                : { cnpj }),
            ...(tipoPerfil === "escola" && { codigo_inep: codigoInep })
        };

        try {
            const data = await api('/usuario', { method: 'POST', body: payload, auth: false });

            // Sucesso no Cadastro!
            setMensagem("Cadastro realizado com sucesso!");
            setErro(false);

            // 1. Limpa os campos por segurança
            setNome(""); setTelefone(""); setEmail(""); setConfirmarEmail(""); setSenha(""); setConfirmarSenha(""); setCPF(""); setCnpj(""); setCodigoInep(""); setProfissao(""); setSexo(""); setPrestador(false);

            // 2. O backend devolve o token: auto-login
            if (data?.token) {
                entrar(data.token);
            }

            // 3. Redireciona imediatamente para a home
            navigate('/home');

        } catch (error) {
            setErro(true);
            setMensagem(error instanceof ApiError ? error.message : "Erro ao realizar cadastro. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-['Poppins',sans-serif] overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        
        .input-group label {
          position: absolute;
          top: -9px;
          left: 10px;
          background: white;
          padding: 0 4px;
          font-size: 11px;
          color: #858585;
          z-index: 10;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .input-group input {
          width: 100%;
          height: 42px;
          border: 1.5px solid #d1d1d1;
          padding: 0 15px;
          outline: none;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          transition: border-color 0.3s;
        }
        .input-group input::placeholder {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          color: #a3a3a3;
        }
        .input-group input:focus {
          border-color: #3800df;
        }
        .btn-base {
          width: 100%;
          height: 42px;
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

            <section className="flex flex-col md:flex-row flex-1 border-b border-gray-100 min-h-screen">

                {/* ÁREA DO FORMULÁRIO */}
                <div className="flex-[1.2] flex items-center justify-center p-4 md:p-6 lg:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-[550px] flex flex-col gap-3"
                    >
                        <div className="text-center mb-0">
                            <h2 className="text-2xl font-bold text-black tracking-tight">CRIE SUA CONTA</h2>
                            <p className="text-[#858585] text-[13px] mt-1">Preencha os dados abaixo para se cadastrar.</p>
                        </div>

                        {/* SELETOR DE PERFIL */}
                        <div className="w-full flex flex-col gap-1 mb-1 mt-1">
                            <label className="text-[11px] font-bold text-[#3800df] uppercase tracking-wider pl-2">
                                TIPO DE PERFIL
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 w-full border-[1.5px] border-[#d1d1d1] p-1 bg-[#f9f9f9] gap-1" role="radiogroup" aria-label="Tipo de perfil">
                                {TIPOS_PERFIL.map((tipo) => (
                                    <button
                                        key={tipo.valor}
                                        type="button"
                                        role="radio"
                                        aria-checked={tipoPerfil === tipo.valor}
                                        onClick={() => setTipoPerfil(tipo.valor)}
                                        className={`h-[34px] flex items-center justify-center font-bold text-[11px] uppercase tracking-wider transition-all duration-300 ${
                                            tipoPerfil === tipo.valor
                                                ? "bg-[#3800df] text-white shadow-sm"
                                                : "text-[#858585] hover:text-black hover:bg-gray-100"
                                        }`}
                                    >
                                        {tipo.rotulo}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-[#858585] pl-2">{TIPOS_PERFIL.find((t) => t.valor === tipoPerfil).ajuda}</p>
                        </div>

                        {/* GRID DOS CAMPOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                            <CustomInput label="NOME COMPLETO" placeholder="Digite seu nome..." value={nome} onChange={(e) => setNome(e.target.value)} />
                            <CustomInput label="TELEFONE" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(maskTelefone(e.target.value))} />

                            {/* E-MAILS DIVIDIDOS LADO A LADO */}
                            <CustomInput label="EMAIL" placeholder="seu@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <CustomInput label="CONFIRME O EMAIL" placeholder="seu@email.com" type="email" value={confirmarEmail} onChange={(e) => setConfirmarEmail(e.target.value)} />

                            {/* RENDERIZAÇÃO CONDICIONAL - ESTUDANTE */}
                            <Collapse in={pessoaFisica} className="md:col-span-2" unmountOnExit>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 pt-1">
                                    <CustomInput label="CPF" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCPF(maskCPF(e.target.value))} />
                                    <CustomInput label="PROFISSÃO" placeholder="Sua área de atuação" value={profissao} onChange={(e) => setProfissao(e.target.value)} />

                                    <div className="input-group relative w-full md:col-span-1">
                                        <label>SEXO</label>
                                        <Select
                                            value={sexo}
                                            onChange={(e) => setSexo(e.target.value)}
                                            displayEmpty
                                            variant="outlined"
                                            className="w-full h-[42px] outline-none text-[14px] font-['Inter'] font-medium"
                                            sx={{
                                                "& .MuiOutlinedInput-notchedOutline": { border: "1.5px solid #d1d1d1", borderRadius: "0" },
                                                "&:hover .MuiOutlinedInput-notchedOutline": { border: "1.5px solid #3800df" },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1.5px solid #3800df" },
                                                borderRadius: "0",
                                                fontFamily: "Inter, sans-serif"
                                            }}
                                        >
                                            <MenuItem value="" disabled sx={{ fontFamily: "Inter", color: "#a3a3a3" }}>Selecione</MenuItem>
                                            <MenuItem value="Masculino" sx={{ fontFamily: "Inter" }}>Masculino</MenuItem>
                                            <MenuItem value="Feminino" sx={{ fontFamily: "Inter" }}>Feminino</MenuItem>
                                        </Select>
                                    </div>

                                    <label className="flex items-center gap-2 text-[12px] font-bold text-[#555] cursor-pointer md:col-span-2">
                                        <input type="checkbox" checked={prestador} onChange={(e) => setPrestador(e.target.checked)} className="w-4 h-4 accent-[#3800df]" />
                                        Quero atender chamados de escolas como maker/voluntário
                                    </label>
                                </div>
                            </Collapse>

                            {/* RENDERIZAÇÃO CONDICIONAL - EMPRESA */}
                            <Collapse in={!pessoaFisica} className="md:col-span-2" unmountOnExit>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 pt-1">
                                    <CustomInput label="CNPJ" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(maskCNPJ(e.target.value))} />
                                    {tipoPerfil === "escola" && (
                                        <CustomInput label="CÓDIGO INEP" placeholder="8 dígitos" value={codigoInep} onChange={(e) => setCodigoInep(e.target.value.replace(/\D/g, "").slice(0, 8))} />
                                    )}
                                </div>
                            </Collapse>

                            <CustomInput label="SENHA" placeholder="••••••••" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
                            <CustomInput label="CONFIRME A SENHA" placeholder="••••••••" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
                        </div>

                        {/* MENSAGENS DE SUCESSO OU ERRO */}
                        {mensagem && (
                            <div className={`p-2 text-center font-bold text-xs ${erro ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                {mensagem}
                            </div>
                        )}

                        {/* BOTÕES */}
                        <div className="w-full flex flex-col gap-2 mt-1 text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-base bg-[#3800df] text-white hover:bg-[#2e00b8] transition-colors rounded-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "ENVIANDO..." : "CADASTRAR"}
                            </button>

                            <p className="text-[12px] font-bold text-[#8a8a8a] uppercase tracking-widest mt-1">
                                Já tem uma conta?{" "}
                                <Link to="/" className="text-[#007aff] cursor-pointer hover:underline transition-all">
                                    Voltar para login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* ÁREA CINZA DINÂMICA (Fixa na Direita) */}
                <div className="hidden md:flex flex-1 bg-[#e0e0e0] items-center justify-center text-center p-10">
                    <h1 className="text-[45px] lg:text-[65px] font-bold text-black select-none tracking-tight leading-tight transition-all duration-300 ease-in-out">
                        {TIPOS_PERFIL.find((t) => t.valor === tipoPerfil).titulo}
                    </h1>
                </div>
            </section>
        </div>
    );
}