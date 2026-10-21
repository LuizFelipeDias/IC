import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Eye, EyeOff } from "lucide-react";
import { Chip, Contador, errosPorCampo, useSaida } from "../../components/ui";
import { focarPrimeiroErro, RgAcoes, RgBloco, RgCabecalho, RgCampo, RgContagem, RgErro, RgOpcoes, RgSucesso } from "../../components/Squarespace";
import { api, ApiError, lista } from "../../services/api";
import { DISPONIBILIDADES, ESPECIALIDADES_SUGERIDAS, formatarData, MODALIDADES_PREFERIDAS, STATUS_CANDIDATURA, UFS } from "../../utils/formatar";
import CampoEtiquetas from "./CampoEtiquetas";
import "../../styles/pages/chamados.css";
import "../../styles/pages/registro.css";
import "../../styles/pages/vagas.css";

const VAZIO = {
    cargo: "",
    portfolio_url: "",
    especialidades: [],
    habilidades: "",
    competencias: "",
    cidade: "",
    uf: "",
    disponibilidade: "",
    modalidade_preferida: "",
    data_inicio: "",
    data_fim: "",
    texto: "",
    visivel_no_banco: true,
};

const doServidor = (c) => Object.fromEntries(Object.keys(VAZIO).map((k) => [k, c[k] ?? VAZIO[k]]));

const agruparErros = (porCampo) =>
    Object.entries(porCampo).reduce((acc, [campo, mensagem]) => {
        const base = campo.split(".")[0];
        if (!acc[base]) acc[base] = mensagem;
        return acc;
    }, {});

/* Minhas candidaturas: status em chips e opção de desistir enquanto ainda faz sentido. */
function MinhasCandidaturas() {
    const [itens, setItens] = useState(null);
    const [erro, setErro] = useState("");
    const [saindo, remover] = useSaida();

    useEffect(() => {
        api("/candidatura?per_page=100").then((r) => setItens(lista(r))).catch((e) => {
            setErro(e.message);
            setItens([]);
        });
    }, []);

    const desistir = async (c) => {
        if (!window.confirm(`Desistir da candidatura para "${c.vaga?.titulo}"?`)) return;
        try {
            await api(`/candidatura/${c.id}`, { method: "DELETE" });
            remover(c.id, () => setItens((atual) => atual.filter((x) => x.id !== c.id)));
        } catch (e) {
            setErro(e.message);
        }
    };

    const contagem = (s) => (itens ?? []).filter((c) => c.status === s).length;

    return (
        <section className="sq-secao vg-candidaturas" id="minhas-candidaturas" aria-labelledby="titulo-candidaturas">
            <div className="rg-bloco" data-revelar>
                <div className="rg-bloco__info">
                    <span className="rg-bloco__numero" aria-hidden="true">{itens ? <Contador valor={itens.length} duracao={900} /> : "—"}</span>
                    <h2 className="sq-rotulo" id="titulo-candidaturas">MINHAS CANDIDATURAS</h2>
                    <p>
                        {itens?.length
                            ? `${contagem("Em análise")} em análise, ${contagem("Aprovada")} aprovada(s), ${contagem("Reprovada")} reprovada(s).`
                            : "As vagas para as quais você se candidatou aparecem aqui, com o status definido pela instituição."}
                    </p>
                </div>
                <div className="vg-candidaturas__conteudo">
                    <RgErro>{erro}</RgErro>
                    {itens === null && <p className="rg-campo__ajuda">Carregando candidaturas...</p>}
                    {itens?.length === 0 && !erro && (
                        <div className="rg-info vg-vazio">
                            <Briefcase size={20} aria-hidden="true" />
                            <span>Você ainda não se candidatou. <Link className="sq-link" to="/vagas">Ver vagas abertas</Link></span>
                        </div>
                    )}
                    {itens?.length > 0 && (
                        <ul className="sq-cartao sq-lista visivel" aria-label="Candidaturas">
                            {itens.map((c, i) => (
                                <li key={c.id} className={`sq-lista__item ${saindo.has(c.id) ? "item-saindo" : ""}`} style={{ "--i": Math.min(i, 12) }}>
                                    <div className="sq-linha-item vg-candidatura">
                                        <span className="sq-linha-item__marca" aria-hidden="true">{c.vaga?.titulo?.[0] ?? "V"}</span>
                                        <span className="sq-linha-item__texto">
                                            <strong>{c.vaga?.titulo ?? "Vaga removida"}</strong>
                                            <span>
                                                {[c.vaga?.usuario?.nome, c.vaga?.modalidade_rotulo, `enviada em ${formatarData(c.data_candidatura)}`].filter(Boolean).join(" · ")}
                                            </span>
                                        </span>
                                        <span className="sq-linha-item__valor">
                                            <Chip tom={STATUS_CANDIDATURA[c.status]} ponto>{c.status}</Chip>
                                            {["Em análise", "Aprovada"].includes(c.status) && (
                                                <button type="button" className="sq-link vg-desistir" onClick={() => desistir(c)} aria-label={`Desistir da vaga ${c.vaga?.titulo ?? ""}`}>
                                                    Desistir
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
}

/** Currículo da pessoa física, consultado por instituições verificadas no banco de currículos. */
export default function Curriculo() {
    const [form, setForm] = useState(null);
    const [idCurriculo, setIdCurriculo] = useState(null);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [salvo, setSalvo] = useState(false);

    useEffect(() => {
        api("/curriculo/meus")
            .then((r) => {
                const atual = lista(r)[0];
                setIdCurriculo(atual?.id ?? null);
                setForm(atual ? doServidor(atual) : VAZIO);
            })
            .catch((e) => {
                setMensagem(e.message);
                setForm(VAZIO);
            });
    }, []);

    const alterar = (campo, ajuste) => (e) => {
        setSalvo(false);
        setForm((atual) => ({ ...atual, [campo]: ajuste ? ajuste(e.target.value) : e.target.value }));
    };
    const definir = (campo) => (valor) => {
        setSalvo(false);
        setForm((atual) => ({ ...atual, [campo]: valor }));
    };

    const salvar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        setSalvo(false);
        const corpo = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]));
        try {
            const resposta = await api(idCurriculo ? `/curriculo/${idCurriculo}` : "/curriculo", { method: idCurriculo ? "PATCH" : "POST", body: corpo });
            setIdCurriculo(resposta.id);
            setForm(doServidor(resposta));
            setSalvo(true);
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) {
                const porCampo = agruparErros(errosPorCampo(e));
                setErros(porCampo);
                focarPrimeiroErro(porCampo);
            } else setMensagem(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="sq rg vg">
            <RgCabecalho
                sobrelinha="BANCO DE CURRÍCULOS"
                titulo="Meu currículo."
                texto="Só você e instituições verificadas que contratam veem estas informações. Especialidades, cidade e disponibilidade são os filtros que as empresas usam para encontrar você no banco de currículos."
                etapas={[["cv-perfil", "Perfil"], ["cv-especialidades", "Especialidades"], ["cv-local", "Local e disponibilidade"], ["cv-experiencia", "Experiência"], ["cv-resumo", "Resumo"], ["cv-visibilidade", "Visibilidade"], ["minhas-candidaturas", "Minhas candidaturas"]]}
            />

            {form === null ? (
                <div className="sq-secao"><p className="rg-campo__ajuda" role="status">Carregando seu currículo...</p></div>
            ) : (
                <form className="sq-secao rg-form" onSubmit={salvar} noValidate aria-busy={enviando}>
                    <RgErro>{mensagem}</RgErro>
                    {salvo && (
                        <RgSucesso titulo="Currículo salvo." acao={<Link to="/vagas" className="sq-botao sq-botao--branco">VER VAGAS</Link>}>
                            {form.visivel_no_banco ? "Instituições verificadas já podem encontrá-lo no banco de currículos." : "Ele está oculto do banco: só você o vê. Você ainda pode se candidatar às vagas."}
                        </RgSucesso>
                    )}

                    <RgBloco id="cv-perfil" numero="01" titulo="PERFIL" ajuda="O cargo ou objetivo aparece em destaque no banco de currículos. O portfólio pode ser um site, Drive ou repositório com fotos das suas peças." indice={0}>
                        <RgCampo id="cargo" rotulo="Cargo ou objetivo" erro={erros.cargo} inteiro contador={<RgContagem valor={form.cargo} maximo={255} />}>
                            <input className="rg-entrada" maxLength={255} placeholder="Ex.: Técnico(a) em impressão 3D" value={form.cargo} onChange={alterar("cargo")} />
                        </RgCampo>
                        <RgCampo id="portfolio_url" rotulo="Portfólio de peças (link)" erro={erros.portfolio_url} ajuda="Endereço completo começando com https://" inteiro>
                            <input type="url" className="rg-entrada" inputMode="url" placeholder="https://meuportfolio.com.br" value={form.portfolio_url} onChange={alterar("portfolio_url", (v) => v.trim())} />
                        </RgCampo>
                    </RgBloco>

                    <RgBloco id="cv-especialidades" numero="02" titulo="ESPECIALIDADES" ajuda="Marque as sugestões ou escreva outras. As empresas filtram o banco por especialidade." indice={1}>
                        <RgCampo id="especialidades" rotulo="Especialidades" erro={erros.especialidades} inteiro contador={<span className="rg-contagem">{form.especialidades.length}/15</span>}>
                            <CampoEtiquetas valor={form.especialidades} aoMudar={definir("especialidades")} sugestoes={ESPECIALIDADES_SUGERIDAS} maximo={15} placeholder="Outra especialidade — tecle Enter" rotuloSugestoes="Especialidades sugeridas" />
                        </RgCampo>
                        <RgCampo id="habilidades" rotulo="Ferramentas e programas" erro={erros.habilidades} ajuda="Separe por vírgulas: Fusion 360, Cura, PrusaSlicer" inteiro>
                            <input className="rg-entrada" maxLength={255} value={form.habilidades} onChange={alterar("habilidades")} />
                        </RgCampo>
                        <RgCampo id="competencias" rotulo="Competências" erro={erros.competencias} inteiro>
                            <input className="rg-entrada" maxLength={255} placeholder="Trabalho em equipe, documentação técnica" value={form.competencias} onChange={alterar("competencias")} />
                        </RgCampo>
                    </RgBloco>

                    <RgBloco id="cv-local" numero="03" titulo="LOCAL E DISPONIBILIDADE" ajuda="Onde você está, quando pode começar e como prefere trabalhar." indice={2}>
                        <RgCampo id="cidade" rotulo="Cidade" erro={erros.cidade}>
                            <input className="rg-entrada" autoComplete="address-level2" placeholder="Ponta Grossa" maxLength={100} value={form.cidade} onChange={alterar("cidade")} />
                        </RgCampo>
                        <RgCampo id="uf" rotulo="UF" erro={erros.uf}>
                            <select className="rg-entrada" value={form.uf} onChange={alterar("uf")}>
                                <option value="">Selecione</option>
                                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </RgCampo>
                        <RgOpcoes nome="disponibilidade" rotulo="Disponibilidade" opcoes={Object.entries(DISPONIBILIDADES)} valor={form.disponibilidade} aoMudar={definir("disponibilidade")} erro={erros.disponibilidade} />
                        <RgOpcoes nome="modalidade_preferida" rotulo="Modalidade preferida" opcoes={Object.entries(MODALIDADES_PREFERIDAS)} valor={form.modalidade_preferida} aoMudar={definir("modalidade_preferida")} erro={erros.modalidade_preferida} />
                    </RgBloco>

                    <RgBloco id="cv-experiencia" numero="04" titulo="EXPERIÊNCIA" ajuda="Período da experiência mais recente na área. Deixe o término em branco se ainda estiver nela." indice={3}>
                        <RgCampo id="data_inicio" rotulo="Início" erro={erros.data_inicio}>
                            <input type="date" className="rg-entrada" value={form.data_inicio} onChange={alterar("data_inicio")} />
                        </RgCampo>
                        <RgCampo id="data_fim" rotulo="Término" erro={erros.data_fim}>
                            <input type="date" className="rg-entrada" min={form.data_inicio || undefined} value={form.data_fim} onChange={alterar("data_fim")} />
                        </RgCampo>
                    </RgBloco>

                    <RgBloco id="cv-resumo" numero="05" titulo="RESUMO PROFISSIONAL" ajuda="Formação, projetos e peças que você já fez. É o texto que as instituições leem primeiro." indice={4}>
                        <RgCampo id="texto" rotulo="Resumo" erro={erros.texto} inteiro contador={<RgContagem valor={form.texto} maximo={20000} />}>
                            <textarea className="rg-entrada" value={form.texto} onChange={alterar("texto")} />
                        </RgCampo>
                    </RgBloco>

                    <RgBloco id="cv-visibilidade" numero="06" titulo="VISIBILIDADE" ajuda="Oculto, o currículo não aparece nas buscas das empresas — mas continua sendo enviado nas vagas em que você se candidatar." indice={5}>
                        <div className="rg-campo rg-inteiro">
                            <button
                                type="button"
                                id="visivel_no_banco"
                                role="switch"
                                aria-checked={form.visivel_no_banco}
                                className="vg-interruptor"
                                onClick={() => definir("visivel_no_banco")(!form.visivel_no_banco)}
                            >
                                <span className="vg-interruptor__trilho" aria-hidden="true"><span /></span>
                                <span className="vg-interruptor__texto">
                                    <strong>{form.visivel_no_banco ? <><Eye size={16} aria-hidden="true" /> Visível no banco de currículos</> : <><EyeOff size={16} aria-hidden="true" /> Oculto do banco de currículos</>}</strong>
                                    <span>{form.visivel_no_banco ? "Empresas, escolas e laboratórios verificados podem encontrar você." : "Só você vê este currículo."}</span>
                                </span>
                            </button>
                            {erros.visivel_no_banco && <span className="rg-campo__erro" role="alert">{erros.visivel_no_banco}</span>}
                        </div>
                    </RgBloco>

                    <RgAcoes enviando={enviando} rotulo="SALVAR CURRÍCULO" rotuloEnviando="SALVANDO..." nota="Você pode atualizar o currículo quando quiser; a data da última atualização aparece no banco." />
                </form>
            )}

            <MinhasCandidaturas />
        </div>
    );
}
