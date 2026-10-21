import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errosPorCampo } from "../../components/ui";
import { focarPrimeiroErro, RgAcoes, RgBloco, RgCabecalho, RgCampo, RgContagem, RgErro, RgOpcoes, RgSucesso } from "../../components/Squarespace";
import { api, ApiError } from "../../services/api";
import "../../styles/pages/chamados.css";
import "../../styles/pages/registro.css";

const TEMAS = ["Modelagem 3D", "Pós-processamento", "Manutenção", "Reciclagem", "Pesquisa", "Educação", "Outro"];
const mascaraCep = (v) => v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

/** Publicar vaga (perfil contratante). */
export default function VagaEditor() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ titulo: "", tema: "", cep: "", cidade: "", texto: "" });
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [publicada, setPublicada] = useState(false);
    const espera = useRef(null);
    const alterar = (campo, mascara) => (e) => setForm((atual) => ({ ...atual, [campo]: mascara ? mascara(e.target.value) : e.target.value }));

    useEffect(() => () => clearTimeout(espera.current), []);

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            await api("/vaga", { method: "POST", body: form });
            setPublicada(true);
            espera.current = setTimeout(() => navigate("/vagas", { replace: true }), 1200);
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
                sobrelinha="PAINEL DO CONTRATANTE"
                titulo="Publicar vaga."
                texto="A vaga fica visível para todos os profissionais da plataforma — estudantes, técnicos e makers que trabalham com manufatura aditiva e reciclagem."
                etapas={[["vaga-cargo", "Cargo"], ["vaga-local", "Local"], ["vaga-descricao", "Descrição"]]}
            />

            <form className="sq-secao rg-form" onSubmit={enviar} noValidate aria-busy={enviando}>
                <RgErro>{mensagem}</RgErro>
                {publicada && <RgSucesso titulo="Vaga publicada.">Abrindo o mural de vagas...</RgSucesso>}

                <RgBloco id="vaga-cargo" numero="01" titulo="CARGO E ÁREA" ajuda="O título aparece no mural de vagas; a área ajuda os candidatos a filtrar." indice={0}>
                    <RgCampo id="titulo" rotulo="Título" erro={erros.titulo} inteiro contador={<RgContagem valor={form.titulo} maximo={255} />}>
                        <input className="rg-entrada" maxLength={255} placeholder="Ex.: Técnico(a) em impressão 3D" value={form.titulo} onChange={alterar("titulo")} />
                    </RgCampo>
                    <RgOpcoes nome="tema" rotulo="Área" opcoes={TEMAS.map((t) => [t, t])} valor={form.tema} aoMudar={(tema) => setForm((atual) => ({ ...atual, tema }))} erro={erros.tema} />
                </RgBloco>

                <RgBloco id="vaga-local" numero="02" titulo="LOCAL" ajuda="Cidade e CEP de onde o trabalho acontece. Deixe em branco se for remoto." indice={1}>
                    <RgCampo id="cidade" rotulo="Cidade" erro={erros.cidade}>
                        <input className="rg-entrada" autoComplete="address-level2" value={form.cidade} onChange={alterar("cidade")} />
                    </RgCampo>
                    <RgCampo id="cep" rotulo="CEP" erro={erros.cep}>
                        <input className="rg-entrada" inputMode="numeric" autoComplete="postal-code" placeholder="84000-000" value={form.cep} onChange={alterar("cep", mascaraCep)} />
                    </RgCampo>
                </RgBloco>

                <RgBloco id="vaga-descricao" numero="03" titulo="DESCRIÇÃO" ajuda="Atividades, requisitos, benefícios e como se candidatar." indice={2}>
                    <RgCampo id="texto" rotulo="Descrição" erro={erros.texto} ajuda="Atividades, requisitos, benefícios e como se candidatar." inteiro contador={<RgContagem valor={form.texto} maximo={20000} />}>
                        <textarea className="rg-entrada" style={{ minHeight: 240 }} value={form.texto} onChange={alterar("texto")} />
                    </RgCampo>
                </RgBloco>

                <RgAcoes
                    aoCancelar={() => navigate(-1)}
                    enviando={enviando}
                    sucesso={publicada}
                    rotulo="PUBLICAR VAGA"
                    rotuloEnviando="PUBLICANDO..."
                    nota="Os candidatos enviam o currículo cadastrado na plataforma."
                />
            </form>
        </div>
    );
}
