import React, { useEffect, useState } from "react";
import { Aviso, CabecalhoPagina, Campo, Carregando, Chip, errosPorCampo } from "../../components/ui";
import { api, ApiError, lista } from "../../services/api";
import "../../styles/pages/vagas.css";

const VAZIO = { cargo: "", habilidades: "", competencias: "", data_inicio: "", data_fim: "", texto: "" };

/** Currículo da pessoa física, consultado por instituições verificadas no banco de currículos. */
export default function Curriculo() {
    const [form, setForm] = useState(null);
    const [idCurriculo, setIdCurriculo] = useState(null);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState(null);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        api("/curriculo").then((r) => {
            const atual = lista(r)[0];
            setIdCurriculo(atual?.id ?? null);
            setForm(atual ? Object.fromEntries(Object.keys(VAZIO).map((k) => [k, atual[k] ?? ""])) : VAZIO);
        });
    }, []);

    if (!form) return <Carregando />;

    const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

    const salvar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem(null);
        const corpo = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]));
        try {
            const salvo = await api(idCurriculo ? `/curriculo/${idCurriculo}` : "/curriculo", { method: idCurriculo ? "PATCH" : "POST", body: corpo });
            setIdCurriculo(salvo.id);
            setMensagem({ tom: "sucesso", texto: "Currículo salvo. Instituições verificadas já podem encontrá-lo." });
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) setErros(errosPorCampo(e));
            else setMensagem({ tom: "perigo", texto: e.message });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: 860 }}>
            <CabecalhoPagina sobrelinha="Banco de currículos" titulo="Meu currículo" descricao="Só você e instituições verificadas que contratam veem estas informações." />
            <form className="cartao cartao--padding pilha formulario-animado" onSubmit={salvar} noValidate>
                {mensagem && <Aviso tom={mensagem.tom}>{mensagem.texto}</Aviso>}
                <div className="formulario-grade">
                    <div className="inteiro">
                        <Campo id="cargo" rotulo="Cargo ou objetivo" erro={erros.cargo}>
                            <input id="cargo" className="entrada" value={form.cargo} onChange={alterar("cargo")} />
                        </Campo>
                    </div>
                    <Campo id="habilidades" rotulo="Habilidades técnicas" erro={erros.habilidades} ajuda="Separe por vírgulas: Fusion 360, Cura, ensaios mecânicos">
                        <input id="habilidades" className="entrada" value={form.habilidades} onChange={alterar("habilidades")} />
                    </Campo>
                    {form.habilidades.trim() && (
                        <div className="inteiro habilidades-previa" aria-label="Habilidades informadas">
                            {form.habilidades.split(",").map((h) => h.trim()).filter(Boolean).map((h, i) => (
                                <span key={`${h}-${i}`} className="chip-pula"><Chip tom="primaria">{h}</Chip></span>
                            ))}
                        </div>
                    )}
                    <Campo id="competencias" rotulo="Competências" erro={erros.competencias}>
                        <input id="competencias" className="entrada" value={form.competencias} onChange={alterar("competencias")} />
                    </Campo>
                    <Campo id="data_inicio" rotulo="Início da experiência" erro={erros.data_inicio}>
                        <input id="data_inicio" type="date" className="entrada" value={form.data_inicio} onChange={alterar("data_inicio")} />
                    </Campo>
                    <Campo id="data_fim" rotulo="Término" erro={erros.data_fim}>
                        <input id="data_fim" type="date" className="entrada" value={form.data_fim} onChange={alterar("data_fim")} />
                    </Campo>
                    <div className="inteiro">
                        <Campo id="texto" rotulo="Resumo profissional" erro={erros.texto}>
                            <textarea id="texto" className="entrada" style={{ minHeight: 200 }} value={form.texto} onChange={alterar("texto")} aria-invalid={Boolean(erros.texto)} />
                        </Campo>
                    </div>
                </div>
                <div className="linha" style={{ justifyContent: "flex-end" }}>
                    <button type="submit" className="botao" disabled={enviando}>{enviando ? "Salvando..." : "Salvar currículo"}</button>
                </div>
            </form>
        </div>
    );
}
