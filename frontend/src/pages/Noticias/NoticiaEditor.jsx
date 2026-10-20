import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { Aviso, CabecalhoPagina, Campo, errosPorCampo } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { api, ApiError } from "../../services/api";

const TEMAS = ["Pesquisa", "Reciclagem", "Mercado", "Educação", "Plataforma", "Eventos"];

/** Escrever ou editar notícia. Toda publicação passa pela curadoria antes de ficar pública. */
export default function NoticiaEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { pode } = useAuth();
    const [form, setForm] = useState({ titulo: "", tema: "", texto: "" });
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (id) api(`/noticia/${id}`).then((n) => setForm({ titulo: n.titulo, tema: n.tema ?? "", texto: n.texto }));
    }, [id]);

    const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            const salva = await api(id ? `/noticia/${id}` : "/noticia", { method: id ? "PATCH" : "POST", body: form });
            navigate(`/noticias/${salva.id}`, { replace: true });
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) setErros(errosPorCampo(e));
            else setMensagem(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: 860 }}>
            <CabecalhoPagina sobrelinha="EcoHub Notícias" titulo={id ? "Editar notícia" : "Escrever notícia"} descricao="Notícias de instituições passam pela curadoria antes de serem publicadas. Edições de textos já publicados voltam para revisão." />

            <form className="cartao cartao--padding pilha" onSubmit={enviar} noValidate>
                {!pode("moderador") && <Aviso tom="info">Depois de enviada, a notícia fica <strong>em revisão</strong> até um moderador aprovar.</Aviso>}
                {mensagem && <Aviso tom="perigo">{mensagem}</Aviso>}

                <Campo id="titulo" rotulo="Título" erro={erros.titulo}>
                    <input id="titulo" className="entrada" maxLength={255} value={form.titulo} onChange={alterar("titulo")} aria-invalid={Boolean(erros.titulo)} />
                </Campo>
                <Campo id="tema" rotulo="Editoria" erro={erros.tema}>
                    <select id="tema" className="entrada" value={form.tema} onChange={alterar("tema")} aria-invalid={Boolean(erros.tema)}>
                        <option value="">Selecione</option>
                        {TEMAS.map((tema) => (
                            <option key={tema}>{tema}</option>
                        ))}
                    </select>
                </Campo>
                <Campo id="texto" rotulo="Texto" erro={erros.texto} ajuda="Parágrafos separados por uma linha em branco.">
                    <textarea id="texto" className="entrada" style={{ minHeight: 320 }} value={form.texto} onChange={alterar("texto")} aria-invalid={Boolean(erros.texto)} />
                </Campo>

                <div className="linha linha--entre">
                    <button type="button" className="botao botao--secundario" onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                    <button type="submit" className="botao" disabled={enviando}>
                        <Send size={16} aria-hidden="true" /> {enviando ? "Enviando..." : pode("moderador") ? "Publicar" : "Enviar para revisão"}
                    </button>
                </div>
            </form>
        </div>
    );
}
