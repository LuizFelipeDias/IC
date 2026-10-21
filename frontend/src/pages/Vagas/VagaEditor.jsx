import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errosPorCampo } from "../../components/ui";
import { focarPrimeiroErro, RgAcoes, RgBloco, RgCabecalho, RgCampo, RgContagem, RgErro, RgOpcoes, RgSucesso } from "../../components/Squarespace";
import { api, ApiError } from "../../services/api";
import { formatarFaixaSalarial, MODALIDADES_TRABALHO, NIVEIS_VAGA, TEMAS_VAGA, TIPOS_CONTRATO, UFS } from "../../utils/formatar";
import CampoEtiquetas from "./CampoEtiquetas";
import "../../styles/pages/chamados.css";
import "../../styles/pages/registro.css";
import "../../styles/pages/vagas.css";

const SUGESTOES_HABILIDADES = ["Fusion 360", "Blender", "Cura", "PrusaSlicer", "Impressão FDM", "Impressão SLA", "Pós-processamento", "Calibração de impressoras", "Extrusão de filamento", "Ensaios mecânicos"];

const DESCRICOES_MODALIDADE = {
    presencial: "No endereço da instituição.",
    remoto: "De qualquer lugar, on-line.",
    hibrido: "Parte presencial, parte remota.",
};

const VAZIO = {
    titulo: "",
    tema: "",
    modalidade: "",
    tipo_contrato: "",
    nivel: "",
    cidade: "",
    uf: "",
    cep: "",
    salario_min: "",
    salario_max: "",
    encerra_em: "",
    habilidades: [],
    texto: "",
};

const mascaraCep = (v) => v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
const somenteValor = (v) => v.replace(/[^\d,.]/g, "").replace(",", ".");

// Data local de hoje no formato do <input type="date"> (o encerramento não pode ser no passado).
const hoje = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Erros "habilidades.2" da API viram uma mensagem só no campo de habilidades. */
const agruparErros = (porCampo) =>
    Object.entries(porCampo).reduce((acc, [campo, mensagem]) => {
        const base = campo.split(".")[0];
        if (!acc[base]) acc[base] = mensagem;
        return acc;
    }, {});

/** Publicar vaga (perfil contratante: empresa, escola, laboratório ou estabelecimento verificados). */
export default function VagaEditor() {
    const navigate = useNavigate();
    const [form, setForm] = useState(VAZIO);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [publicada, setPublicada] = useState(null);
    const espera = useRef(null);
    const alterar = (campo, mascara) => (e) => setForm((atual) => ({ ...atual, [campo]: mascara ? mascara(e.target.value) : e.target.value }));
    const definir = (campo) => (valor) => setForm((atual) => ({ ...atual, [campo]: valor }));

    useEffect(() => () => clearTimeout(espera.current), []);

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        // Campos opcionais vazios vão como null (a faixa salarial e o encerramento são opcionais).
        const corpo = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]));
        try {
            const vaga = await api("/vaga", { method: "POST", body: corpo });
            setPublicada(vaga);
            espera.current = setTimeout(() => navigate("/vagas", { replace: true }), 1400);
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

    const faixa = form.salario_min || form.salario_max ? formatarFaixaSalarial(form.salario_min || null, form.salario_max || null) : null;

    return (
        <div className="sq rg vg">
            <RgCabecalho
                sobrelinha="PAINEL DO CONTRATANTE"
                titulo="Publicar vaga."
                texto="A vaga aparece no mural para estudantes, técnicos e makers que trabalham com manufatura aditiva e reciclagem. Modalidade, contrato e nível ajudam os candidatos a encontrá-la pelos filtros."
                etapas={[["vaga-cargo", "Cargo"], ["vaga-contrato", "Contratação"], ["vaga-local", "Local"], ["vaga-remuneracao", "Remuneração e prazo"], ["vaga-habilidades", "Habilidades"], ["vaga-descricao", "Descrição"]]}
            />

            <form className="sq-secao rg-form" onSubmit={enviar} noValidate aria-busy={enviando}>
                <RgErro>{mensagem}</RgErro>
                {publicada && <RgSucesso titulo="Vaga publicada.">{`${publicada.titulo} já está no mural. Abrindo as vagas...`}</RgSucesso>}

                <RgBloco id="vaga-cargo" numero="01" titulo="CARGO E ÁREA" ajuda="O título aparece no mural de vagas; a área ajuda os candidatos a filtrar." indice={0}>
                    <RgCampo id="titulo" rotulo="Título" erro={erros.titulo} inteiro contador={<RgContagem valor={form.titulo} maximo={255} />}>
                        <input className="rg-entrada" maxLength={255} placeholder="Ex.: Técnico(a) em impressão 3D" value={form.titulo} onChange={alterar("titulo")} />
                    </RgCampo>
                    <RgOpcoes nome="tema" rotulo="Área" opcoes={TEMAS_VAGA.map((t) => [t, t])} valor={form.tema} aoMudar={definir("tema")} erro={erros.tema} />
                </RgBloco>

                <RgBloco id="vaga-contrato" numero="02" titulo="CONTRATAÇÃO" ajuda="Como e onde a pessoa vai trabalhar, a forma de contratação e o nível de experiência esperado." indice={1}>
                    <RgOpcoes
                        nome="modalidade"
                        rotulo="Modalidade"
                        cartoes
                        opcoes={Object.entries(MODALIDADES_TRABALHO).map(([v, r]) => [v, r, DESCRICOES_MODALIDADE[v]])}
                        valor={form.modalidade}
                        aoMudar={definir("modalidade")}
                        erro={erros.modalidade}
                    />
                    <RgOpcoes nome="tipo_contrato" rotulo="Tipo de contrato" opcoes={Object.entries(TIPOS_CONTRATO)} valor={form.tipo_contrato} aoMudar={definir("tipo_contrato")} erro={erros.tipo_contrato} />
                    <RgOpcoes nome="nivel" rotulo="Nível" opcoes={Object.entries(NIVEIS_VAGA)} valor={form.nivel} aoMudar={definir("nivel")} erro={erros.nivel} />
                </RgBloco>

                <RgBloco id="vaga-local" numero="03" titulo="LOCAL" ajuda="Cidade e UF de onde o trabalho acontece. Em vagas remotas, informe a sede da instituição." indice={2}>
                    <RgCampo id="cidade" rotulo="Cidade" erro={erros.cidade}>
                        <input className="rg-entrada" autoComplete="address-level2" placeholder="Ponta Grossa" maxLength={100} value={form.cidade} onChange={alterar("cidade")} />
                    </RgCampo>
                    <RgCampo id="uf" rotulo="UF" erro={erros.uf}>
                        <select className="rg-entrada" value={form.uf} onChange={alterar("uf")}>
                            <option value="">Selecione</option>
                            {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                    </RgCampo>
                    <RgCampo id="cep" rotulo="CEP" erro={erros.cep} ajuda="Opcional.">
                        <input className="rg-entrada" inputMode="numeric" autoComplete="postal-code" placeholder="84000-000" value={form.cep} onChange={alterar("cep", mascaraCep)} />
                    </RgCampo>
                </RgBloco>

                <RgBloco id="vaga-remuneracao" numero="04" titulo="REMUNERAÇÃO E PRAZO" ajuda="A faixa salarial é opcional — sem ela, a vaga aparece como “A combinar”. Depois da data de encerramento a vaga sai do mural." indice={3}>
                    <RgCampo id="salario_min" rotulo="Salário mínimo (R$)" erro={erros.salario_min}>
                        <input className="rg-entrada" inputMode="decimal" placeholder="2800" value={form.salario_min} onChange={alterar("salario_min", somenteValor)} />
                    </RgCampo>
                    <RgCampo id="salario_max" rotulo="Salário máximo (R$)" erro={erros.salario_max}>
                        <input className="rg-entrada" inputMode="decimal" placeholder="3400" value={form.salario_max} onChange={alterar("salario_max", somenteValor)} />
                    </RgCampo>
                    {faixa && <p className="rg-inteiro vg-previa" aria-live="polite">Aparece no mural como <strong>{faixa}</strong></p>}
                    <RgCampo id="encerra_em" rotulo="Encerra em" erro={erros.encerra_em} ajuda="Opcional. Você também pode encerrar a vaga a qualquer momento." inteiro>
                        <input type="date" className="rg-entrada" min={hoje()} value={form.encerra_em} onChange={alterar("encerra_em")} />
                    </RgCampo>
                </RgBloco>

                <RgBloco id="vaga-habilidades" numero="05" titulo="HABILIDADES" ajuda="Programas, técnicas e equipamentos que a pessoa deve dominar. A busca do mural também procura por elas." indice={4}>
                    <RgCampo id="habilidades" rotulo="Habilidades" erro={erros.habilidades} inteiro contador={<span className="rg-contagem">{form.habilidades.length}/20</span>}>
                        <CampoEtiquetas valor={form.habilidades} aoMudar={definir("habilidades")} sugestoes={SUGESTOES_HABILIDADES} placeholder="Ex.: Fusion 360 — tecle Enter para adicionar" />
                    </RgCampo>
                </RgBloco>

                <RgBloco id="vaga-descricao" numero="06" titulo="DESCRIÇÃO" ajuda="Atividades, requisitos, benefícios e como será o processo seletivo." indice={5}>
                    <RgCampo id="texto" rotulo="Descrição" erro={erros.texto} inteiro contador={<RgContagem valor={form.texto} maximo={20000} />}>
                        <textarea className="rg-entrada" style={{ minHeight: 240 }} value={form.texto} onChange={alterar("texto")} />
                    </RgCampo>
                </RgBloco>

                <RgAcoes
                    aoCancelar={() => navigate("/vagas")}
                    rotuloCancelar="VOLTAR ÀS VAGAS"
                    enviando={enviando}
                    sucesso={Boolean(publicada)}
                    rotulo="PUBLICAR VAGA"
                    rotuloEnviando="PUBLICANDO..."
                    nota="Os candidatos enviam o currículo cadastrado na plataforma; você acompanha e responde cada um no painel de vagas."
                />
            </form>
        </div>
    );
}
