import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { errosPorCampo } from "../../components/ui";
import { focarPrimeiroErro, RgAcoes, RgBloco, RgCabecalho, RgCampo, RgContagem, RgErro, RgOpcoes, RgSucesso } from "../../components/Squarespace";
import { useAuth } from "../../contexts/AuthContext";
import { api, ApiError } from "../../services/api";
import "../../styles/pages/chamados.css";
import "../../styles/pages/registro.css";

const TEMAS = ["Pesquisa", "Reciclagem", "Mercado", "Educação", "Plataforma", "Eventos"];
const ESPERA_SUCESSO = 1200;

/** Escrever ou editar notícia. Toda publicação passa pela curadoria antes de ficar pública. */
export default function NoticiaEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { pode } = useAuth();
    const [form, setForm] = useState({ titulo: "", tema: "", texto: "" });
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [salva, setSalva] = useState(null);
    const espera = useRef(null);
    const moderador = pode("moderador");

    useEffect(() => {
        if (id) api(`/noticia/${id}`).then((n) => setForm({ titulo: n.titulo, tema: n.tema ?? "", texto: n.texto })).catch((e) => setMensagem(e.message));
    }, [id]);

    useEffect(() => () => clearTimeout(espera.current), []);

    const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            const resposta = await api(id ? `/noticia/${id}` : "/noticia", { method: id ? "PATCH" : "POST", body: form });
            setSalva(resposta);
            espera.current = setTimeout(() => navigate(`/noticias/${resposta.id}`, { replace: true }), ESPERA_SUCESSO);
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

    return (
        <div className="sq rg">
            <RgCabecalho
                sobrelinha="ECOHUB NOTÍCIAS"
                titulo={id ? "Editar notícia." : "Escrever notícia."}
                texto={
                    moderador
                        ? "Como moderador, sua notícia é publicada assim que você enviar. Edições também ficam visíveis na hora."
                        : "Notícias de instituições passam pela curadoria antes de serem publicadas. Edições de textos já publicados voltam para revisão."
                }
                etapas={[["noticia-titulo", "Título e editoria"], ["noticia-texto", "Texto"]]}
            />

            <form className="sq-secao rg-form" onSubmit={enviar} noValidate aria-busy={enviando}>
                <RgErro>{mensagem}</RgErro>
                {salva && (
                    <RgSucesso titulo={moderador ? "Notícia publicada." : "Notícia enviada para revisão."}>
                        {moderador ? "Abrindo a página da notícia..." : "Um moderador vai conferir o texto. Abrindo a página da notícia..."}
                    </RgSucesso>
                )}

                <RgBloco id="noticia-titulo" numero="01" titulo="TÍTULO E EDITORIA" ajuda="Um título curto e direto. A editoria define em qual seção do jornal a notícia aparece." indice={0}>
                    <RgCampo id="titulo" rotulo="Título" erro={erros.titulo} inteiro contador={<RgContagem valor={form.titulo} maximo={255} />}>
                        <input className="rg-entrada" maxLength={255} placeholder="Ex.: Escola de Ponta Grossa imprime próteses com PLA reciclado" value={form.titulo} onChange={alterar("titulo")} />
                    </RgCampo>
                    <RgOpcoes
                        nome="tema"
                        rotulo="Editoria"
                        opcoes={TEMAS.map((t) => [t, t])}
                        valor={form.tema}
                        aoMudar={(tema) => setForm((atual) => ({ ...atual, tema }))}
                        erro={erros.tema}
                    />
                </RgBloco>

                <RgBloco id="noticia-texto" numero="02" titulo="TEXTO" ajuda="Parágrafos separados por uma linha em branco. Cite fontes e instituições envolvidas." indice={1}>
                    <RgCampo id="texto" rotulo="Texto da notícia" erro={erros.texto} ajuda="Parágrafos separados por uma linha em branco." inteiro contador={<RgContagem valor={form.texto} maximo={50000} />}>
                        <textarea className="rg-entrada rg-entrada--longo" value={form.texto} onChange={alterar("texto")} />
                    </RgCampo>
                    {!moderador && (
                        <p className="rg-info rg-inteiro">
                            Depois de enviada, a notícia fica <strong>em revisão</strong> até um moderador aprovar.
                        </p>
                    )}
                </RgBloco>

                <RgAcoes
                    aoCancelar={() => navigate(-1)}
                    enviando={enviando}
                    sucesso={Boolean(salva)}
                    rotulo={moderador ? "PUBLICAR" : "ENVIAR PARA REVISÃO"}
                    rotuloEnviando="ENVIANDO..."
                    nota={moderador ? "A notícia fica pública imediatamente." : "Você acompanha a revisão em Minhas publicações."}
                />
            </form>
        </div>
    );
}
