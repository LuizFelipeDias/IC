import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errosPorCampo } from "../../components/ui";
import { focarPrimeiroErro, RgAcoes, RgBloco, RgCabecalho, RgCampo, RgContagem, RgErro, RgOpcoes, RgSucesso } from "../../components/Squarespace";
import { api, ApiError } from "../../services/api";
import "../../styles/pages/chamados.css";
import "../../styles/pages/registro.css";

const VAZIO = { titulo: "", tipo_servico: "", data_limite: "", cidade: "", uf: "", descricao: "" };

// Data local de hoje no formato do <input type="date"> (o prazo não pode ser no passado).
const hoje = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Abrir chamado: escolas, empresas e estabelecimentos verificados (perfil solicitante). */
export default function NovoChamado() {
    const navigate = useNavigate();
    const [opcoes, setOpcoes] = useState({ tipos_servico: [] });
    const [form, setForm] = useState(VAZIO);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [criado, setCriado] = useState(null);
    const espera = useRef(null);

    useEffect(() => {
        api("/chamado/opcoes").then(setOpcoes).catch((e) => setMensagem(e.message));
        return () => clearTimeout(espera.current);
    }, []);

    const alterar = (campo, ajuste) => (e) => setForm((atual) => ({ ...atual, [campo]: ajuste ? ajuste(e.target.value) : e.target.value }));

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            const resposta = await api("/chamado", { method: "POST", body: form });
            setCriado(resposta);
            espera.current = setTimeout(() => navigate("/chamados", { replace: true }), 1200);
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
                sobrelinha="PAINEL DE CHAMADOS"
                titulo="Novo chamado."
                texto="Do que sua instituição precisa? Peça treinamento, modelagem, digitalização ou impressão 3D. Laboratórios e makers voluntários da rede respondem e você acompanha cada etapa no painel."
                etapas={[["chamado-pedido", "Pedido"], ["chamado-local", "Prazo e local"], ["chamado-descricao", "Descrição"]]}
            />

            <form className="sq-secao rg-form" onSubmit={enviar} noValidate aria-busy={enviando}>
                <RgErro>{mensagem}</RgErro>
                {criado && (
                    <RgSucesso titulo="Chamado aberto.">
                        {`CH-${String(criado.id).padStart(5, "0")} · ${criado.titulo}. Voltando para o painel...`}
                    </RgSucesso>
                )}

                <RgBloco id="chamado-pedido" numero="01" titulo="O PEDIDO" ajuda="Um título que resuma o pedido e o tipo de serviço. Prestadores filtram os chamados por serviço." indice={0}>
                    <RgCampo id="titulo" rotulo="Título" erro={erros.titulo} inteiro contador={<RgContagem valor={form.titulo} maximo={255} />}>
                        <input className="rg-entrada" maxLength={255} placeholder="Ex.: Oficina de modelagem 3D para o 9º ano" value={form.titulo} onChange={alterar("titulo")} />
                    </RgCampo>
                    <RgOpcoes
                        nome="tipo_servico"
                        rotulo="Tipo de serviço"
                        opcoes={opcoes.tipos_servico.map((t) => [t.valor, t.rotulo])}
                        valor={form.tipo_servico}
                        aoMudar={(tipo_servico) => setForm((atual) => ({ ...atual, tipo_servico }))}
                        erro={erros.tipo_servico}
                    />
                </RgBloco>

                <RgBloco id="chamado-local" numero="02" titulo="PRAZO E LOCAL" ajuda="Até quando você precisa do atendimento e onde fica a instituição. O prazo não pode ser uma data passada." indice={1}>
                    <RgCampo id="data_limite" rotulo="Prazo desejado" erro={erros.data_limite} inteiro>
                        <input type="date" className="rg-entrada" min={hoje()} value={form.data_limite} onChange={alterar("data_limite")} />
                    </RgCampo>
                    <RgCampo id="cidade" rotulo="Cidade" erro={erros.cidade}>
                        <input className="rg-entrada" autoComplete="address-level2" placeholder="Ponta Grossa" value={form.cidade} onChange={alterar("cidade")} />
                    </RgCampo>
                    <RgCampo id="uf" rotulo="UF" erro={erros.uf} ajuda="Sigla com 2 letras.">
                        <input className="rg-entrada rg-entrada--maiuscula" autoComplete="address-level1" maxLength={2} placeholder="PR" value={form.uf} onChange={alterar("uf", (v) => v.replace(/[^a-zA-Z]/g, "").toUpperCase())} />
                    </RgCampo>
                </RgBloco>

                <RgBloco id="chamado-descricao" numero="03" titulo="DESCRIÇÃO" ajuda="Quanto mais contexto, mais rápido alguém aceita: público atendido, equipamentos disponíveis e o que precisa ser feito." indice={2}>
                    <RgCampo id="descricao" rotulo="Descrição" erro={erros.descricao} ajuda="Público atendido, equipamentos disponíveis e o que precisa ser feito." inteiro contador={<RgContagem valor={form.descricao} maximo={10000} />}>
                        <textarea className="rg-entrada" maxLength={10000} value={form.descricao} onChange={alterar("descricao")} />
                    </RgCampo>
                </RgBloco>

                <RgAcoes
                    aoCancelar={() => navigate("/chamados")}
                    rotuloCancelar="VOLTAR AO PAINEL"
                    enviando={enviando}
                    sucesso={Boolean(criado)}
                    rotulo="ABRIR CHAMADO"
                    rotuloEnviando="ENVIANDO..."
                    nota="O contato do prestador aparece no painel assim que ele aceitar o chamado."
                />
            </form>
        </div>
    );
}
