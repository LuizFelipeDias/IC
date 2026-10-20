import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FileBox, Image as ImageIcon, Trash2, UploadCloud } from "lucide-react";
import { Aviso, CabecalhoPagina, Campo, Chip, errosPorCampo } from "../../components/ui";
import { api, ApiError } from "../../services/api";
import { AREAS_PROJETO, formatarBytes, LICENCAS } from "../../utils/formatar";
import "../../styles/pages/projetos.css";

const VAZIO = { titulo: "", area: "", licenca: "", texto: "", tema: "", empresa: "" };

function EnvioArquivos({ idProjeto }) {
    const [anexos, setAnexos] = useState([]);
    const [mensagens, setMensagens] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const refModelo = useRef(null);
    const refImagem = useRef(null);

    useEffect(() => {
        api(`/projeto/${idProjeto}`).then((p) => setAnexos(p.anexos));
    }, [idProjeto]);

    const enviar = async (tipo, arquivos) => {
        setEnviando(true);
        const resultados = [];
        for (const arquivo of arquivos) {
            const dados = new FormData();
            dados.append("tipo", tipo);
            dados.append("arquivo", arquivo);
            try {
                const anexo = await api(`/projeto/${idProjeto}/anexos`, { method: "POST", body: dados });
                setAnexos((atual) => [...atual, anexo]);
                resultados.push({ tom: "sucesso", texto: `${arquivo.name}: enviado.` });
            } catch (e) {
                resultados.push({ tom: "perigo", texto: `${arquivo.name}: ${e.message}` });
            }
        }
        setMensagens(resultados);
        setEnviando(false);
    };

    const remover = async (anexo) => {
        await api(`/anexo/${anexo.id}`, { method: "DELETE" });
        setAnexos((atual) => atual.filter((a) => a.id !== anexo.id));
    };

    return (
        <section className="cartao cartao--padding pilha" aria-labelledby="titulo-arquivos">
            <div>
                <h2 id="titulo-arquivos" style={{ fontSize: "var(--texto-xl)" }}>Arquivos</h2>
                <p className="texto-suave">Modelos STL ou 3MF (até 50 MB, no máximo 5) e imagens (até 5 MB, no máximo 8). Cada arquivo é conferido pelo conteúdo, medido e verificado por antivírus.</p>
            </div>

            <div className="formulario-grade">
                <label className="area-envio">
                    <FileBox size={28} aria-hidden="true" />
                    <strong>Enviar modelo 3D</strong>
                    <span>STL ou 3MF</span>
                    <input ref={refModelo} type="file" accept=".stl,.3mf" multiple className="sr-only" disabled={enviando} onChange={(e) => { enviar("modelo", [...e.target.files]); e.target.value = ""; }} />
                </label>
                <label className="area-envio">
                    <ImageIcon size={28} aria-hidden="true" />
                    <strong>Enviar imagens</strong>
                    <span>JPG, PNG ou WebP — os metadados de localização são removidos</span>
                    <input ref={refImagem} type="file" accept="image/*" multiple className="sr-only" disabled={enviando} onChange={(e) => { enviar("imagem", [...e.target.files]); e.target.value = ""; }} />
                </label>
            </div>

            {enviando && <Aviso tom="info"><UploadCloud size={16} aria-hidden="true" /> Enviando e validando arquivos...</Aviso>}
            {mensagens.map((m) => <Aviso key={m.texto} tom={m.tom}>{m.texto}</Aviso>)}

            <ul className="lista-arquivos">
                {anexos.map((anexo) => (
                    <li key={anexo.id}>
                        <span className="lista-arquivos__icone">{anexo.tipo === "imagem" ? <ImageIcon size={20} aria-hidden="true" /> : <FileBox size={20} aria-hidden="true" />}</span>
                        <div className="lista-arquivos__info">
                            <strong>{anexo.nome_arquivo}</strong>
                            <span>
                                {formatarBytes(anexo.tamanho_bytes)}
                                {anexo.metadados && ` · ${anexo.metadados.volume_cm3} cm³ · ${anexo.metadados.dimensoes_mm.x} × ${anexo.metadados.dimensoes_mm.y} × ${anexo.metadados.dimensoes_mm.z} mm`}
                            </span>
                        </div>
                        <Chip tom={anexo.status_verificacao === "aprovado" ? "sucesso" : anexo.status_verificacao === "rejeitado" ? "perigo" : "alerta"}>
                            {anexo.status_verificacao === "aprovado" ? "Verificado" : anexo.status_verificacao === "rejeitado" ? "Bloqueado" : "Verificação pendente"}
                        </Chip>
                        <button type="button" className="botao botao--fantasma botao--pequeno" aria-label={`Remover ${anexo.nome_arquivo}`} onClick={() => remover(anexo)}>
                            <Trash2 size={14} aria-hidden="true" />
                        </button>
                    </li>
                ))}
            </ul>

            <div className="linha linha--entre">
                <span className="texto-suave" style={{ fontSize: "var(--texto-sm)" }}>Arquivos novos devolvem o projeto para a revisão da curadoria.</span>
                <Link to={`/projetos/${idProjeto}`} className="botao">Ver projeto</Link>
            </div>
        </section>
    );
}

export default function ProjetoEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(VAZIO);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (id) api(`/projeto/${id}`).then((p) => setForm({ titulo: p.titulo, area: p.area ?? "", licenca: p.licenca ?? "", texto: p.texto, tema: p.tema ?? "", empresa: p.empresa ?? "" }));
    }, [id]);

    const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

    const salvar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            const salvo = await api(id ? `/projeto/${id}` : "/projeto", { method: id ? "PATCH" : "POST", body: { ...form, tema: form.tema || null, empresa: form.empresa || null } });
            if (id) setMensagem("Dados salvos. O projeto voltou para revisão.");
            else navigate(`/projetos/${salvo.id}/editar`, { replace: true });
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) setErros(errosPorCampo(e));
            else setMensagem(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: 920 }}>
            <CabecalhoPagina sobrelinha="Repositório de projetos" titulo={id ? "Editar projeto" : "Enviar projeto"} descricao="Descreva a peça, escolha a área e a licença. Depois de salvar, envie os modelos STL/3MF e as imagens." />

            <div className="pilha" style={{ gap: "var(--esp-6)" }}>
                <form className="cartao cartao--padding pilha" onSubmit={salvar} noValidate>
                    {mensagem && <Aviso tom={mensagem.startsWith("Dados salvos") ? "sucesso" : "perigo"}>{mensagem}</Aviso>}
                    <div className="formulario-grade">
                        <div className="inteiro">
                            <Campo id="titulo" rotulo="Título" erro={erros.titulo}>
                                <input id="titulo" className="entrada" maxLength={255} value={form.titulo} onChange={alterar("titulo")} aria-invalid={Boolean(erros.titulo)} />
                            </Campo>
                        </div>
                        <Campo id="area" rotulo="Área" erro={erros.area}>
                            <select id="area" className="entrada" value={form.area} onChange={alterar("area")} aria-invalid={Boolean(erros.area)}>
                                <option value="">Selecione</option>
                                {Object.entries(AREAS_PROJETO).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
                            </select>
                        </Campo>
                        <Campo id="empresa" rotulo="Instituição parceira (opcional)" erro={erros.empresa}>
                            <input id="empresa" className="entrada" value={form.empresa} onChange={alterar("empresa")} />
                        </Campo>
                        <div className="inteiro">
                            <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="campo">
                                <legend className="campo__rotulo" style={{ marginBottom: "var(--esp-2)" }}>Licença de uso</legend>
                                <div className="licencas">
                                    {Object.entries(LICENCAS).map(([valor, l]) => (
                                        <label key={valor}>
                                            <input type="radio" name="licenca" value={valor} checked={form.licenca === valor} onChange={alterar("licenca")} />
                                            <strong>{l.nome}</strong>
                                            {l.descricao}
                                        </label>
                                    ))}
                                </div>
                                {erros.licenca && <span className="campo__erro">{erros.licenca}</span>}
                            </fieldset>
                        </div>
                        <div className="inteiro">
                            <Campo id="texto" rotulo="Descrição e instruções de impressão" erro={erros.texto} ajuda="Inclua material recomendado, altura de camada, preenchimento e se precisa de suporte.">
                                <textarea id="texto" className="entrada" style={{ minHeight: 220 }} value={form.texto} onChange={alterar("texto")} aria-invalid={Boolean(erros.texto)} />
                            </Campo>
                        </div>
                    </div>
                    <div className="linha linha--entre">
                        <button type="button" className="botao botao--secundario" onClick={() => navigate(-1)}>Cancelar</button>
                        <button type="submit" className="botao" disabled={enviando}>{enviando ? "Salvando..." : id ? "Salvar alterações" : "Salvar e enviar arquivos"}</button>
                    </div>
                </form>

                {id && <EnvioArquivos idProjeto={id} />}
            </div>
        </div>
    );
}
