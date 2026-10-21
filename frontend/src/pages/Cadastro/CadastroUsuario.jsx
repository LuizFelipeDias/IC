import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, FlaskConical, School, UserRound } from "lucide-react";
import RegistroLayout from "../../components/RegistroLayout";
import { Aviso, Campo, errosPorCampo } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { api, ApiError } from "../../services/api";

const TIPOS = [
    { valor: "pessoa_fisica", rotulo: "Pessoa física", icone: UserRound, ajuda: "Estudantes, profissionais e makers: candidatam-se a vagas, doam resíduos e podem atender chamados." },
    { valor: "empresa", rotulo: "Empresa", icone: Building2, ajuda: "Publica vagas e notícias, abre chamados e consulta o banco de currículos." },
    { valor: "escola", rotulo: "Escola", icone: School, ajuda: "Escolas públicas abrem chamados de treinamento, modelagem, scanner 3D e impressão." },
    { valor: "laboratorio", rotulo: "Laboratório", icone: FlaskConical, ajuda: "Recebe resíduos, produz filamento reciclado com laudo, atende chamados e publica vagas." },
];

const mascaraTelefone = (valor) =>
    valor.replace(/\D/g, "").slice(0, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
const mascaraCpf = (valor) =>
    valor.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const mascaraCnpj = (valor) =>
    valor
        .replace(/\D/g, "")
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");

const VAZIO = { nome: "", email: "", telefone: "", senha: "", confirmarSenha: "", cpf: "", sexo: "", profissao: "", cnpj: "", codigo_inep: "", prestador_servico: false };

export default function CadastroUsuario() {
    const navigate = useNavigate();
    const { entrar } = useAuth();
    const [tipo, setTipo] = useState("pessoa_fisica");
    const [form, setForm] = useState(VAZIO);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    const pessoaFisica = tipo === "pessoa_fisica";
    const tipoAtual = TIPOS.find((t) => t.valor === tipo);

    const alterar = (campo, mascara) => (evento) => {
        const valor = evento.target.type === "checkbox" ? evento.target.checked : evento.target.value;
        setForm((atual) => ({ ...atual, [campo]: mascara ? mascara(valor) : valor }));
    };

    const enviar = async (evento) => {
        evento.preventDefault();
        setErros({});
        setMensagem("");

        if (form.senha !== form.confirmarSenha) {
            setErros({ confirmarSenha: "As senhas não coincidem." });
            return;
        }

        const corpo = {
            nome: form.nome,
            email: form.email,
            telefone: form.telefone,
            senha: form.senha,
            tipo_usuario: tipo,
            ...(pessoaFisica
                ? { cpf: form.cpf, profissao: form.profissao, sexo: form.sexo === "" ? null : form.sexo === "feminino", prestador_servico: form.prestador_servico }
                : { cnpj: form.cnpj }),
            ...(tipo === "escola" && { codigo_inep: form.codigo_inep }),
        };

        setEnviando(true);
        try {
            const dados = await api("/usuario", { method: "POST", body: corpo, auth: false });
            entrar(dados.token);
            navigate("/home", { replace: true });
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) {
                setErros(errosPorCampo(e));
            } else {
                setMensagem(e.message);
            }
        } finally {
            setEnviando(false);
        }
    };

    const entrada = (campo, props = {}) => (
        <input id={campo} className="entrada" value={form[campo]} onChange={alterar(campo, props.mascara)} aria-invalid={Boolean(erros[campo])} {...{ ...props, mascara: undefined }} />
    );

    return (
        <RegistroLayout largo>
            <h1 className="registro__titulo">Crie sua conta grátis</h1>

            <div className="tipo-perfil" role="radiogroup" aria-label="Tipo de conta">
                {TIPOS.map(({ valor, rotulo, icone: Icone }) => (
                    <button key={valor} type="button" role="radio" aria-checked={tipo === valor} onClick={() => setTipo(valor)}>
                        <Icone size={20} aria-hidden="true" />
                        {rotulo}
                    </button>
                ))}
            </div>
            <p key={tipo} className="registro__ajuda-tipo">{tipoAtual.ajuda}</p>

            <form className="registro__form" onSubmit={enviar} noValidate>
                {!pessoaFisica && (
                    <Aviso tom="info">
                        Após o cadastro, a equipe confere o CNPJ{tipo === "escola" && " e o código INEP"}. Até lá, você navega normalmente, mas ainda não publica nem abre chamados.
                    </Aviso>
                )}
                {mensagem && <Aviso tom="perigo">{mensagem}</Aviso>}

                <Campo id="nome" rotulo={pessoaFisica ? "Nome completo" : "Nome da instituição"} erro={erros.nome}>
                    {entrada("nome", { autoComplete: pessoaFisica ? "name" : "organization", placeholder: pessoaFisica ? "Nome completo" : "Nome da instituição" })}
                </Campo>
                <Campo id="email" rotulo="E-mail" erro={erros.email}>
                    {entrada("email", { type: "email", autoComplete: "email", placeholder: "E-mail" })}
                </Campo>
                <Campo id="telefone" rotulo="Telefone" erro={erros.telefone}>
                    {entrada("telefone", { mascara: mascaraTelefone, inputMode: "tel", placeholder: "Telefone (42) 99999-0000" })}
                </Campo>

                {pessoaFisica ? (
                    <>
                        <Campo id="cpf" rotulo="CPF" erro={erros.cpf}>
                            {entrada("cpf", { mascara: mascaraCpf, inputMode: "numeric", placeholder: "CPF" })}
                        </Campo>
                        <Campo id="sexo" rotulo="Sexo" erro={erros.sexo}>
                            <select id="sexo" className={`entrada ${form.sexo ? "" : "entrada--vazia"}`} value={form.sexo} onChange={alterar("sexo")} aria-invalid={Boolean(erros.sexo)}>
                                <option value="">Sexo (opcional)</option>
                                <option value="feminino">Feminino</option>
                                <option value="masculino">Masculino</option>
                            </select>
                        </Campo>
                        <Campo id="profissao" rotulo="Profissão ou área de atuação" erro={erros.profissao}>
                            {entrada("profissao", { placeholder: "Profissão ou área de atuação" })}
                        </Campo>
                        <label className="registro__checagem">
                            <input type="checkbox" checked={form.prestador_servico} onChange={alterar("prestador_servico")} />
                            <span>
                                <strong>Quero atender chamados como maker/voluntário.</strong>
                                <small>Você verá os pedidos de escolas e empresas e poderá aceitá-los.</small>
                            </span>
                        </label>
                    </>
                ) : (
                    <>
                        <Campo id="cnpj" rotulo="CNPJ" erro={erros.cnpj}>
                            {entrada("cnpj", { mascara: mascaraCnpj, inputMode: "numeric", placeholder: "CNPJ" })}
                        </Campo>
                        {tipo === "escola" && (
                            <Campo id="codigo_inep" rotulo="Código INEP" erro={erros.codigo_inep} ajuda="8 dígitos, no Censo Escolar.">
                                {entrada("codigo_inep", { mascara: (v) => v.replace(/\D/g, "").slice(0, 8), inputMode: "numeric", placeholder: "Código INEP" })}
                            </Campo>
                        )}
                    </>
                )}

                <Campo id="senha" rotulo="Senha" erro={erros.senha} ajuda="Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo.">
                    {entrada("senha", { type: "password", autoComplete: "new-password", placeholder: "Senha" })}
                </Campo>
                <Campo id="confirmarSenha" rotulo="Confirme a senha" erro={erros.confirmarSenha}>
                    {entrada("confirmarSenha", { type: "password", autoComplete: "new-password", placeholder: "Confirme a senha" })}
                </Campo>

                <button type="submit" className="registro__principal" disabled={enviando}>
                    {enviando ? "Criando conta..." : "Criar conta"}
                </button>
            </form>

            <div className="registro__textos">
                <Link to="/rastreio">Rastrear um lote sem conta</Link>
                <span>
                    Já tem conta? <Link to="/">Entrar</Link>
                </span>
                <p className="registro__legal">
                    Ao clicar em “Criar conta”, você concorda com os <span className="registro__roxo">Termos de uso </span>e a{" "}
                    <span className="registro__roxo">Política de privacidade</span> do EcoHub 3D (LGPD).
                </p>
            </div>
        </RegistroLayout>
    );
}
