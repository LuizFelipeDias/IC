import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Github, QrCode, Search } from "lucide-react";
import { Aviso, Carregando, errosPorCampo, Vazio } from "../../components/ui";
import { api, ApiError, lista, query } from "../../services/api";
import { AREAS_PROJETO, LICENCAS } from "../../utils/formatar";
import ilustracao from "../../assets/ilustracoes/estudante.png";
import calendario from "../../assets/projetos/calendario.png";
import celular from "../../assets/projetos/celular.png";
import "../../styles/pages/projetos.css";

/*
 * Vitrine de projetos — clone do arquivo Figma "Personal Portfolio Website
 * Template" (frame "Portfolio with form"): apresentação com mancha amarela,
 * título de seção sublinhado, cartões 496 + 496 px alternando texto e imagem,
 * formulário centralizado de 400 px, ícones e onda amarela no rodapé.
 */

const CAPAS_PADRAO = [calendario, celular];

export function TituloSecao({ id, children }) {
    return (
        <div className="pf-titulo" id={id}>
            <h2>{children}</h2>
            <span aria-hidden="true" />
        </div>
    );
}

export function IconeEnvelope() {
    return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.1 12.1C3.3 10.9 4.0 9.9 4.9 9.1C5.9 8.4 7.0 7.9 8.2 8H39.7C40.9 7.9 42.0 8.4 43.0 9.1C43.9 9.9 44.6 10.9 44.8 12.1L24 25.1L3.1 12.1ZM3 15.1V34.1L18.2 24.6L3 15.1ZM20.7 26.2L3.5 36.9C3.9 37.8 4.6 38.6 5.4 39.1C6.2 39.7 7.2 40.0 8.2 40H39.7C40.7 40.0 41.7 39.7 42.5 39.1C43.3 38.6 44.0 37.8 44.4 36.9L27.2 26.2L24 28.2L20.7 26.2V26.2ZM29.7 24.6L45 34.1V15.1L29.7 24.6V24.6Z"
                fill="currentColor"
            />
        </svg>
    );
}

/* Ícones + assinatura + onda amarela ("footer / icons" do Figma). */
export function RodapePortfolio() {
    return (
        <div className="pf-rodape">
            <div className="pf-icones">
                <a href="https://github.com/LuizFelipeDias/IC" target="_blank" rel="noreferrer" aria-label="Código-fonte no GitHub">
                    <Github size={44} strokeWidth={2.2} aria-hidden="true" />
                </a>
                <Link to="/rastreio" aria-label="Rastrear um lote de filamento">
                    <QrCode size={44} strokeWidth={2.2} aria-hidden="true" />
                </Link>
                <a href="https://github.com/LuizFelipeDias/IC/issues" target="_blank" rel="noreferrer" aria-label="Fale com a equipe">
                    <IconeEnvelope />
                </a>
            </div>
            <p>EcoHub 3D · Repositório de projetos {new Date().getFullYear()}</p>
            <div className="pf-onda" aria-hidden="true" />
        </div>
    );
}

function CartaoProjeto({ projeto, indice }) {
    const modelo = projeto.anexos?.find((a) => a.tipo === "modelo")?.metadados;
    const capa = projeto.capa ?? CAPAS_PADRAO[indice % CAPAS_PADRAO.length];
    const resumo = projeto.texto.length > 150 ? `${projeto.texto.slice(0, 150)}…` : projeto.texto;

    return (
        <article className={`pf-projeto cartao-projeto ${indice % 2 ? "pf-projeto--invertido" : ""}`}>
            <div className="pf-projeto__info">
                <div>
                    <h3>{projeto.titulo}</h3>
                    <p>{resumo}</p>
                    <p className="pf-projeto__meta">
                        {AREAS_PROJETO[projeto.area] ?? "Projeto"} · {LICENCAS[projeto.licenca]?.nome ?? "Sem licença"}
                        {modelo && ` · ${modelo.formato?.toUpperCase()}${modelo.volume_cm3 ? ` ${modelo.volume_cm3} cm³` : ""}`}
                    </p>
                    <Link to={`/projetos/${projeto.id}`} className="pf-botao pf-botao--pilula">
                        Ver projeto
                    </Link>
                </div>
            </div>
            <Link to={`/projetos/${projeto.id}`} className="pf-projeto__imagem" tabIndex={-1} aria-hidden="true">
                <img src={capa} alt="" loading="lazy" />
            </Link>
        </article>
    );
}

const FORM_VAZIO = { titulo: "", area: "", texto: "" };

/* "footer / form": envio rápido. Cria o projeto (em revisão, licença CC BY) e abre o editor para anexar os arquivos. */
function FormularioEnvio() {
    const navigate = useNavigate();
    const [form, setForm] = useState(FORM_VAZIO);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            const criado = await api("/projeto", { method: "POST", body: { ...form, licenca: "cc-by" } });
            navigate(`/projetos/${criado.id}/editar`);
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) setErros(errosPorCampo(e));
            else setMensagem(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form className="pf-form" onSubmit={enviar} noValidate>
            {mensagem && <Aviso tom="perigo">{mensagem}</Aviso>}
            <div className="pf-campo">
                <label htmlFor="pf-titulo">Título</label>
                <input id="pf-titulo" value={form.titulo} onChange={alterar("titulo")} aria-invalid={Boolean(erros.titulo)} />
                {erros.titulo && <span className="pf-erro">{erros.titulo}</span>}
            </div>
            <div className="pf-campo">
                <label htmlFor="pf-area">Área</label>
                <select id="pf-area" value={form.area} onChange={alterar("area")} aria-invalid={Boolean(erros.area)}>
                    <option value="">Selecione</option>
                    {Object.entries(AREAS_PROJETO).map(([valor, rotulo]) => (
                        <option key={valor} value={valor}>{rotulo}</option>
                    ))}
                </select>
                {erros.area && <span className="pf-erro">{erros.area}</span>}
            </div>
            <div className="pf-campo">
                <label htmlFor="pf-texto">Descrição</label>
                <textarea id="pf-texto" value={form.texto} onChange={alterar("texto")} aria-invalid={Boolean(erros.texto)} />
                {erros.texto && <span className="pf-erro">{erros.texto}</span>}
            </div>
            <button type="submit" className="pf-botao pf-botao--primario" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar"}
            </button>
        </form>
    );
}

export default function Projetos() {
    const [projetos, setProjetos] = useState(null);
    const [busca, setBusca] = useState("");
    const [termo, setTermo] = useState("");
    const [area, setArea] = useState("");
    const [licenca, setLicenca] = useState("");

    useEffect(() => {
        const espera = setTimeout(() => setTermo(busca.trim()), 300);
        return () => clearTimeout(espera);
    }, [busca]);

    useEffect(() => {
        setProjetos(null);
        api(`/projeto${query({ q: termo, area, licenca, per_page: 60 })}`).then((r) => setProjetos(lista(r))).catch(() => setProjetos([]));
    }, [termo, area, licenca]);

    return (
        <div className="pf">
            <section className="pf-intro">
                <div className="pf-intro__imagem" aria-hidden="true">
                    <img src={ilustracao} alt="" />
                </div>
                <div className="pf-intro__texto">
                    <span className="pf-intro__cargo">Repositório aberto</span>
                    <h1>Olá, conheça os projetos 3D</h1>
                    <p>Modelos para saúde, educação, agro e acessibilidade, com arquivo validado, licença clara e revisão da curadoria.</p>
                    <div className="pf-botoes">
                        <a href="#projetos" className="pf-botao pf-botao--primario">Projetos</a>
                        <Link to="/projetos/novo" className="pf-botao pf-botao--secundario">Enviar projeto</Link>
                    </div>
                </div>
            </section>

            <section className="pf-secao">
                <TituloSecao id="projetos">Projetos</TituloSecao>

                <div className="pf-filtros">
                    <label className="pf-busca">
                        <Search size={18} aria-hidden="true" />
                        <span className="sr-only">Buscar projetos</span>
                        <input type="search" placeholder="Buscar por órtese, engrenagem, maquete..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                    </label>
                    <label htmlFor="filtro-licenca" className="sr-only">Licença</label>
                    <select id="filtro-licenca" className="pf-select" value={licenca} onChange={(e) => setLicenca(e.target.value)}>
                        <option value="">Qualquer licença</option>
                        {Object.entries(LICENCAS).map(([valor, l]) => (
                            <option key={valor} value={valor}>{l.nome}</option>
                        ))}
                    </select>
                    <Link to="/publicacoes" className="pf-botao pf-botao--pilula">Minhas publicações</Link>
                </div>
                <div className="pf-areas" role="group" aria-label="Filtrar por área">
                    <button type="button" className="pf-botao pf-botao--pilula" aria-pressed={area === ""} onClick={() => setArea("")}>
                        Todas
                    </button>
                    {Object.entries(AREAS_PROJETO).map(([valor, rotulo]) => (
                        <button key={valor} type="button" className="pf-botao pf-botao--pilula" aria-pressed={area === valor} onClick={() => setArea(valor)}>
                            {rotulo}
                        </button>
                    ))}
                </div>

                {projetos === null && <Carregando texto="Buscando projetos..." />}
                {projetos?.length === 0 && <Vazio titulo="Nenhum projeto encontrado">Tente outra área ou outro termo de busca.</Vazio>}
                {projetos?.length > 0 && (
                    <div className="pf-projetos">
                        {projetos.map((projeto, i) => (
                            <CartaoProjeto key={projeto.id} projeto={projeto} indice={i} />
                        ))}
                    </div>
                )}
            </section>

            <section className="pf-secao pf-secao--form">
                <TituloSecao>Envie o seu</TituloSecao>
                <FormularioEnvio />
            </section>

            <RodapePortfolio />
        </div>
    );
}
