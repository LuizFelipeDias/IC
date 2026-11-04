import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FileBox, Image as ImageIcon, Trash2 } from "lucide-react";
import { AreaEnvio, Chip, errosPorCampo } from "../../components/ui";
import { focarPrimeiroErro, RgAcoes, RgBloco, RgCabecalho, RgCampo, RgContagem, RgErro, RgOpcoes, RgSucesso } from "../../components/Squarespace";
import { api, ApiError } from "../../services/api";
import { AREAS_PROJETO, formatarBytes, LICENCAS } from "../../utils/formatar";
import "../../styles/pages/projetos.css";
import "../../styles/pages/chamados.css";
import "../../styles/pages/registro.css";

const VAZIO = { titulo: "", area: "", licenca: "", texto: "", tema: "", empresa: "" };

const VERIFICACAO = {
    aprovado: ["sucesso", "Verificado"],
    rejeitado: ["perigo", "Bloqueado"],
};

function EnvioArquivos({ idProjeto }) {
    const [anexos, setAnexos] = useState([]);
    const [mensagens, setMensagens] = useState([]);
    const [enviando, setEnviando] = useState(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        api(`/projeto/${idProjeto}`).then((p) => setAnexos(p.anexos)).catch((e) => setErro(e.message));
    }, [idProjeto]);

    const enviar = async (tipo, arquivos) => {
        setEnviando(tipo);
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
        setEnviando(null);
    };

    const remover = async (anexo) => {
        setErro("");
        try {
            await api(`/anexo/${anexo.id}`, { method: "DELETE" });
            setAnexos((atual) => atual.filter((a) => a.id !== anexo.id));
        } catch (e) {
            setErro(e.message);
        }
    };

    return (
        <div className="sq-secao rg-form">
            <RgBloco
                id="projeto-arquivos"
                numero="04"
                titulo="ARQUIVOS"
                ajuda="Modelos STL ou 3MF (até 50 MB, no máximo 5) e imagens (até 5 MB, no máximo 8). Cada arquivo é conferido pelo conteúdo, medido e verificado por antivírus."
                indice={0}
            >
                <AreaEnvio icone={FileBox} titulo="Enviar modelo 3D" ajuda="STL ou 3MF — clique ou arraste" accept=".stl,.3mf" multiple enviando={enviando === "modelo"} aoEscolher={(arquivos) => enviar("modelo", arquivos)} />
                <AreaEnvio icone={ImageIcon} titulo="Enviar imagens" ajuda="JPG, PNG ou WebP — os metadados de localização são removidos" accept="image/*" multiple enviando={enviando === "imagem"} aoEscolher={(arquivos) => enviar("imagem", arquivos)} />

                {(enviando || mensagens.length > 0 || erro) && (
                    <ul className="rg-mensagens rg-inteiro" aria-live="polite">
                        {enviando && <li>Enviando e validando arquivos...</li>}
                        {erro && <li className="rg-mensagens--erro">{erro}</li>}
                        {mensagens.map((m) => <li key={m.texto} className={m.tom === "perigo" ? "rg-mensagens--erro" : ""}>{m.texto}</li>)}
                    </ul>
                )}

                <div className="rg-inteiro">
                    <p className="rg-campo__rotulo" style={{ marginBottom: 12 }}>ANEXOS ({anexos.length})</p>
                    {anexos.length === 0 ? (
                        <p className="rg-campo__ajuda">Nenhum arquivo enviado ainda.</p>
                    ) : (
                        <ul className="lista-arquivos">
                            {anexos.map((anexo) => {
                                const [tom, rotulo] = VERIFICACAO[anexo.status_verificacao] ?? ["alerta", "Verificação pendente"];
                                return (
                                    <li key={anexo.id} className="linha-entra">
                                        <span className="lista-arquivos__icone">{anexo.tipo === "imagem" ? <ImageIcon size={20} aria-hidden="true" /> : <FileBox size={20} aria-hidden="true" />}</span>
                                        <div className="lista-arquivos__info">
                                            <strong>{anexo.nome_arquivo}</strong>
                                            <span>
                                                {formatarBytes(anexo.tamanho_bytes)}
                                                {anexo.metadados && ` · ${anexo.metadados.volume_cm3} cm³ · ${anexo.metadados.dimensoes_mm.x} × ${anexo.metadados.dimensoes_mm.y} × ${anexo.metadados.dimensoes_mm.z} mm`}
                                            </span>
                                        </div>
                                        <Chip tom={tom}>{rotulo}</Chip>
                                        <button type="button" className="rg-remover" aria-label={`Remover ${anexo.nome_arquivo}`} onClick={() => remover(anexo)}>
                                            <Trash2 size={16} aria-hidden="true" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </RgBloco>

            <div className="rg-acoes" data-revelar>
                <p className="rg-acoes__nota">Arquivos novos devolvem o projeto para a revisão da curadoria.</p>
                <div className="rg-acoes__botoes">
                    <Link to={`/projetos/${idProjeto}`} className="sq-botao sq-botao--preto rg-enviar">VER PROJETO</Link>
                </div>
            </div>
        </div>
    );
}

export default function ProjetoEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(VAZIO);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [salvo, setSalvo] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const espera = useRef(null);

    useEffect(() => {
        if (id) {
            api(`/projeto/${id}`)
                .then((p) => setForm({ titulo: p.titulo, area: p.area ?? "", licenca: p.licenca ?? "", texto: p.texto, tema: p.tema ?? "", empresa: p.empresa ?? "" }))
                .catch((e) => setMensagem(e.message));
        }
    }, [id]);

    useEffect(() => () => clearTimeout(espera.current), []);

    const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));
    const escolher = (campo) => (valor) => setForm((atual) => ({ ...atual, [campo]: valor }));

    const salvar = async (evento) => {
        evento.preventDefault();
        clearTimeout(espera.current);
        setEnviando(true);
        setErros({});
        setMensagem("");
        setSalvo(false);
        try {
            const resposta = await api(id ? `/projeto/${id}` : "/projeto", { method: id ? "PATCH" : "POST", body: { ...form, tema: form.tema || null, empresa: form.empresa || null } });
            setSalvo(true);
            if (id) espera.current = setTimeout(() => setSalvo(false), 4000);
            else espera.current = setTimeout(() => navigate(`/projetos/${resposta.id}/editar`, { replace: true }), 1000);
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) {
                const porCampo = errosPorCampo(e);
                setErros(porCampo);
                focarPrimeiroErro(porCampo);
            } else setMensagem(e.message);
        } finally {
            setEnviando(false);
        }
    };

    const etapas = [["projeto-dados", "Dados"], ["projeto-licenca", "Licença"], ["projeto-descricao", "Descrição"], ...(id ? [["projeto-arquivos", "Arquivos"]] : [])];

    return (
        <div className="sq rg">
            <RgCabecalho
                sobrelinha="REPOSITÓRIO DE PROJETOS"
                titulo={id ? "Editar projeto." : "Enviar projeto."}
                texto="Descreva a peça, escolha a área e a licença. Depois de salvar, envie os modelos STL/3MF e as imagens — tudo passa pela curadoria antes de ficar público."
                etapas={etapas}
            />

            <form className="sq-secao rg-form" onSubmit={salvar} noValidate aria-busy={enviando}>
                <RgErro>{mensagem}</RgErro>
                {salvo && (
                    <RgSucesso titulo={id ? "Dados salvos." : "Projeto criado."}>
                        {id ? "O projeto voltou para revisão." : "Agora envie os modelos STL/3MF e as imagens."}
                    </RgSucesso>
                )}

                <RgBloco id="projeto-dados" numero="01" titulo="DADOS DO PROJETO" ajuda="Como a peça se chama, para que área ela serve e, se houver, a instituição parceira." indice={0}>
                    <RgCampo id="titulo" rotulo="Título" erro={erros.titulo} inteiro contador={<RgContagem valor={form.titulo} maximo={255} />}>
                        <input className="rg-entrada" maxLength={255} placeholder="Ex.: Suporte de tablet para cadeira de rodas" value={form.titulo} onChange={alterar("titulo")} />
                    </RgCampo>
                    <RgOpcoes nome="area" rotulo="Área" opcoes={Object.entries(AREAS_PROJETO)} valor={form.area} aoMudar={escolher("area")} erro={erros.area} />
                    <RgCampo id="empresa" rotulo="Instituição parceira (opcional)" erro={erros.empresa} inteiro>
                        <input className="rg-entrada" maxLength={255} value={form.empresa} onChange={alterar("empresa")} />
                    </RgCampo>
                </RgBloco>

                <RgBloco id="projeto-licenca" numero="02" titulo="LICENÇA DE USO" ajuda="Define o que outras pessoas podem fazer com o seu modelo: copiar, adaptar ou usar comercialmente." indice={1}>
                    <RgOpcoes
                        nome="licenca"
                        rotulo="Licença de uso"
                        cartoes
                        opcoes={Object.entries(LICENCAS).map(([valor, l]) => [valor, l.nome, l.descricao])}
                        valor={form.licenca}
                        aoMudar={escolher("licenca")}
                        erro={erros.licenca}
                    />
                </RgBloco>

                <RgBloco id="projeto-descricao" numero="03" titulo="DESCRIÇÃO E IMPRESSÃO" ajuda="Inclua material recomendado, altura de camada, preenchimento e se precisa de suporte." indice={2}>
                    <RgCampo id="texto" rotulo="Descrição e instruções de impressão" erro={erros.texto} ajuda="Inclua material recomendado, altura de camada, preenchimento e se precisa de suporte." inteiro contador={<RgContagem valor={form.texto} maximo={50000} />}>
                        <textarea className="rg-entrada" style={{ minHeight: 240 }} value={form.texto} onChange={alterar("texto")} />
                    </RgCampo>
                </RgBloco>

                <RgAcoes
                    aoCancelar={() => navigate(-1)}
                    enviando={enviando}
                    sucesso={salvo && !id}
                    rotulo={id ? "SALVAR ALTERAÇÕES" : "SALVAR E ENVIAR ARQUIVOS"}
                    rotuloEnviando="SALVANDO..."
                    nota={id ? "Salvar alterações devolve o projeto para a revisão." : "Depois de salvar você envia os arquivos na mesma página."}
                />
            </form>

            {id && <EnvioArquivos idProjeto={id} />}
        </div>
    );
}
