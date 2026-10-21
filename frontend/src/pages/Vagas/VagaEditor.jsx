import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Aviso, CabecalhoPagina, Campo, errosPorCampo } from "../../components/ui";
import { api, ApiError } from "../../services/api";

const TEMAS = ["Modelagem 3D", "Pós-processamento", "Manutenção", "Reciclagem", "Pesquisa", "Educação", "Outro"];
const mascaraCep = (v) => v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

export default function VagaEditor() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ titulo: "", tema: "", cep: "", cidade: "", texto: "" });
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const alterar = (campo, mascara) => (e) => setForm((atual) => ({ ...atual, [campo]: mascara ? mascara(e.target.value) : e.target.value }));

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            await api("/vaga", { method: "POST", body: form });
            navigate("/vagas", { replace: true });
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) setErros(errosPorCampo(e));
            else setMensagem(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: 860 }}>
            <CabecalhoPagina sobrelinha="Painel do contratante" titulo="Publicar vaga" descricao="A vaga fica visível para todos os profissionais da plataforma." />
            <form className="cartao cartao--padding pilha formulario-animado" onSubmit={enviar} noValidate>
                {mensagem && <Aviso tom="perigo">{mensagem}</Aviso>}
                <div className="formulario-grade">
                    <div className="inteiro">
                        <Campo id="titulo" rotulo="Título" erro={erros.titulo}>
                            <input id="titulo" className="entrada" placeholder="Ex.: Técnico(a) em impressão 3D" value={form.titulo} onChange={alterar("titulo")} aria-invalid={Boolean(erros.titulo)} />
                        </Campo>
                    </div>
                    <Campo id="tema" rotulo="Área" erro={erros.tema}>
                        <select id="tema" className="entrada" value={form.tema} onChange={alterar("tema")}>
                            <option value="">Selecione</option>
                            {TEMAS.map((t) => <option key={t}>{t}</option>)}
                        </select>
                    </Campo>
                    <Campo id="cidade" rotulo="Cidade" erro={erros.cidade}>
                        <input id="cidade" className="entrada" value={form.cidade} onChange={alterar("cidade")} />
                    </Campo>
                    <Campo id="cep" rotulo="CEP" erro={erros.cep}>
                        <input id="cep" className="entrada" inputMode="numeric" placeholder="84000-000" value={form.cep} onChange={alterar("cep", mascaraCep)} />
                    </Campo>
                    <div className="inteiro">
                        <Campo id="texto" rotulo="Descrição" erro={erros.texto} ajuda="Atividades, requisitos, benefícios e como se candidatar.">
                            <textarea id="texto" className="entrada" style={{ minHeight: 240 }} value={form.texto} onChange={alterar("texto")} aria-invalid={Boolean(erros.texto)} />
                        </Campo>
                    </div>
                </div>
                <div className="linha linha--entre">
                    <button type="button" className="botao botao--secundario" onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className="botao" disabled={enviando}>{enviando ? "Publicando..." : "Publicar vaga"}</button>
                </div>
            </form>
        </div>
    );
}
