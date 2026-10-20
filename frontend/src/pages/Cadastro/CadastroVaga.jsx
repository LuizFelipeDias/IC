import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Nav.jsx";
import Footer from "../../components/Footer.jsx";
import { api, ApiError } from "../../services/api";

const TEMAS = ["Modelagem 3D", "Pós-processamento", "Manutenção de impressoras", "Reciclagem", "Pesquisa", "Outro"];

const VAZIO = { titulo: "", tema: "", cep: "", cidade: "", texto: "" };

const maskCep = (valor) =>
    valor
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);

function Campo({ id, label, erro, children }) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-[11px] font-black uppercase tracking-widest text-[#858585]">
                {label}
            </label>
            {children}
            {erro && <span className="text-[12px] text-red-600">{erro}</span>}
        </div>
    );
}

const classeInput =
    "w-full border-[1.5px] border-[#d1d1d1] px-4 py-3 text-[14px] outline-none focus:border-brand transition-colors bg-white";

export default function CadastroVaga() {
    const navigate = useNavigate();
    const [form, setForm] = useState(VAZIO);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    const alterar = (campo) => (e) => {
        const valor = campo === "cep" ? maskCep(e.target.value) : e.target.value;
        setForm((atual) => ({ ...atual, [campo]: valor }));
    };

    const enviar = async (e) => {
        e.preventDefault();
        if (enviando) return;

        setEnviando(true);
        setErros({});
        setMensagem("");

        try {
            await api("/vaga", { method: "POST", body: form });
            navigate("/vaga", { replace: true });
        } catch (erro) {
            if (erro instanceof ApiError && erro.status === 422) {
                setErros(Object.fromEntries(Object.entries(erro.erros).map(([campo, msgs]) => [campo, msgs[0]])));
            } else {
                setMensagem(erro.message || "Não foi possível publicar a vaga.");
            }
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-['Inter',sans-serif]">
            <Navbar />

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#858585] mb-1 font-bold">Painel do empregador</p>
                <h1 className="text-[28px] font-black uppercase tracking-tight mb-10">Publicar vaga</h1>

                <form onSubmit={enviar} className="flex flex-col gap-6" noValidate>
                    <Campo id="titulo" label="Título *" erro={erros.titulo}>
                        <input
                            id="titulo"
                            className={classeInput}
                            value={form.titulo}
                            onChange={alterar("titulo")}
                            maxLength={255}
                            required
                            placeholder="Ex.: Técnico(a) em impressão 3D"
                        />
                    </Campo>

                    <Campo id="tema" label="Área" erro={erros.tema}>
                        <select id="tema" className={classeInput} value={form.tema} onChange={alterar("tema")}>
                            <option value="">Selecione</option>
                            {TEMAS.map((tema) => (
                                <option key={tema} value={tema}>
                                    {tema}
                                </option>
                            ))}
                        </select>
                    </Campo>

                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6">
                        <Campo id="cep" label="CEP" erro={erros.cep}>
                            <input
                                id="cep"
                                className={classeInput}
                                value={form.cep}
                                onChange={alterar("cep")}
                                inputMode="numeric"
                                placeholder="84000-000"
                            />
                        </Campo>
                        <Campo id="cidade" label="Cidade" erro={erros.cidade}>
                            <input
                                id="cidade"
                                className={classeInput}
                                value={form.cidade}
                                onChange={alterar("cidade")}
                                maxLength={100}
                                placeholder="Ponta Grossa"
                            />
                        </Campo>
                    </div>

                    <Campo id="texto" label="Descrição da vaga *" erro={erros.texto}>
                        <textarea
                            id="texto"
                            className={`${classeInput} min-h-[260px] resize-y`}
                            value={form.texto}
                            onChange={alterar("texto")}
                            required
                            placeholder="Atividades, requisitos, benefícios e como se candidatar."
                        />
                    </Campo>

                    {mensagem && (
                        <p role="alert" className="text-[13px] text-red-600">
                            {mensagem}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#f0f0f0]">
                        <button
                            type="submit"
                            disabled={enviando}
                            className="flex-1 h-[56px] bg-brand text-white font-black text-[13px] uppercase tracking-[0.3em] hover:bg-black transition-colors disabled:opacity-60"
                        >
                            {enviando ? "Publicando..." : "Publicar vaga"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="h-[56px] px-8 border-[1.5px] border-black font-black text-[13px] uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}
