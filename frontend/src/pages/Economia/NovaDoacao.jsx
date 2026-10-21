import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";
import { AreaEnvio, errosPorCampo } from "../../components/ui";
import { focarPrimeiroErro, RgAcoes, RgBloco, RgCabecalho, RgCampo, RgContagem, RgErro, RgOpcoes, RgSucesso } from "../../components/Squarespace";
import { api, ApiError } from "../../services/api";
import { TIPOS_DOACAO } from "../../utils/formatar";
import "../../styles/pages/economia.css";
import "../../styles/pages/chamados.css";
import "../../styles/pages/registro.css";

const MAX_FOTOS = 5;

const DESCRICOES_TIPO = {
    peca_excedente: "Peças impressas que sobraram, com falha ou fora de uso.",
    carretel_usado: "Carretéis vazios ou com pouco filamento.",
    resto_filamento: "Pontas, purgas, suportes e sobras de impressão.",
};

/** Miniaturas das fotos escolhidas, com URLs temporárias liberadas ao trocar a seleção. */
function Miniaturas({ fotos, aoRemover }) {
    const urls = useMemo(() => fotos.map((f) => URL.createObjectURL(f)), [fotos]);
    useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
    if (!fotos.length) return null;
    return (
        <ul className="rg-miniaturas rg-inteiro" aria-label="Fotos escolhidas">
            {fotos.map((foto, i) => (
                <li key={`${foto.name}-${foto.size}-${i}`} style={{ "--i": i }}>
                    <img src={urls[i]} alt={foto.name} />
                    <button type="button" aria-label={`Remover ${foto.name}`} onClick={() => aoRemover(i)}>
                        <X size={14} aria-hidden="true" />
                    </button>
                </li>
            ))}
        </ul>
    );
}

/** Registrar doação de peças e filamento (qualquer usuário logado). */
export default function NovaDoacao() {
    const navigate = useNavigate();
    const [polimeros, setPolimeros] = useState([]);
    const [form, setForm] = useState({ id_polimero: "", tipo: "resto_filamento", titulo: "", descricao: "", peso_estimado_g: "", cor: "", cidade: "", uf: "" });
    const [fotos, setFotos] = useState([]);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [progresso, setProgresso] = useState("");
    const [concluida, setConcluida] = useState(false);
    // Doação já criada (se só as fotos falharem, o novo envio não duplica o registro).
    const criada = useRef(null);
    const espera = useRef(null);

    useEffect(() => {
        api("/polimeros").then((r) => setPolimeros(r.data)).catch((e) => setMensagem(e.message));
        return () => clearTimeout(espera.current);
    }, []);

    const alterar = (campo, ajuste) => (e) => setForm((atual) => ({ ...atual, [campo]: ajuste ? ajuste(e.target.value) : e.target.value }));

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            if (!criada.current) {
                criada.current = await api("/doacao", { method: "POST", body: { ...form, id_polimero: Number(form.id_polimero) || null, peso_estimado_g: Number(form.peso_estimado_g) || null } });
            }
            const pendentes = [...fotos];
            for (let i = 0; i < pendentes.length; i += 1) {
                setProgresso(`Enviando foto ${i + 1} de ${pendentes.length}...`);
                const dados = new FormData();
                dados.append("arquivo", pendentes[i]);
                await api(`/doacao/${criada.current.id}/fotos`, { method: "POST", body: dados });
                setFotos((atual) => atual.filter((f) => f !== pendentes[i]));
            }
            setProgresso("");
            setConcluida(true);
            espera.current = setTimeout(() => navigate("/doacoes", { replace: true }), 1200);
        } catch (e) {
            setProgresso("");
            if (e instanceof ApiError && e.status === 422 && !criada.current) {
                const porCampo = errosPorCampo(e);
                setErros(porCampo);
                focarPrimeiroErro(porCampo);
            } else if (criada.current) {
                setMensagem(`A doação foi registrada, mas uma foto não foi enviada: ${e.message} Remova a foto ou tente de novo.`);
            } else setMensagem(e.message);
        } finally {
            setEnviando(false);
        }
    };

    const polimeroAtual = polimeros.find((p) => String(p.id) === String(form.id_polimero));

    return (
        <div className="sq rg">
            <RgCabecalho
                sobrelinha="DOAÇÃO DE MAKERS · RECICLAGEM"
                titulo="Registrar doação de peças e filamento."
                texto="Informe o polímero e uma estimativa de peso. Separar por material faz toda a diferença: laboratórios verificados solicitam a coleta e transformam as sobras em filamento novo."
                etapas={[["doacao-material", "Material"], ["doacao-local", "Local"], ["doacao-fotos", "Fotos"]]}
            />

            <form className="sq-secao rg-form" onSubmit={enviar} noValidate aria-busy={enviando}>
                <RgErro>{mensagem}</RgErro>
                {concluida && <RgSucesso titulo="Doação publicada no mural.">Laboratórios da rede já podem solicitar a coleta. Voltando para as doações...</RgSucesso>}

                <RgBloco id="doacao-material" numero="01" titulo="MATERIAL" ajuda="O que você está doando, de qual polímero e quanto pesa, mais ou menos. Não misture materiais diferentes na mesma doação." indice={0}>
                    <RgCampo id="titulo" rotulo="Título" erro={erros.titulo} inteiro contador={<RgContagem valor={form.titulo} maximo={255} />}>
                        <input className="rg-entrada" maxLength={255} placeholder="Ex.: Sobras de PLA branco" value={form.titulo} onChange={alterar("titulo")} disabled={Boolean(criada.current)} />
                    </RgCampo>
                    <RgOpcoes
                        nome="tipo"
                        rotulo="Tipo de resíduo"
                        cartoes
                        opcoes={Object.entries(TIPOS_DOACAO).map(([valor, rotulo]) => [valor, rotulo, DESCRICOES_TIPO[valor]])}
                        valor={form.tipo}
                        aoMudar={(tipo) => setForm((atual) => ({ ...atual, tipo }))}
                        erro={erros.tipo}
                    />
                    <RgCampo id="id_polimero" rotulo="Polímero" erro={erros.id_polimero} ajuda={polimeroAtual ? `${polimeroAtual.nome}${polimeroAtual.temp_extrusao_min ? ` · extrusão ${polimeroAtual.temp_extrusao_min}–${polimeroAtual.temp_extrusao_max} °C` : ""}` : undefined}>
                        <select className="rg-entrada" value={form.id_polimero} onChange={alterar("id_polimero")}>
                            <option value="">Selecione</option>
                            {polimeros.map((p) => <option key={p.id} value={p.id}>{p.sigla} — {p.nome}</option>)}
                        </select>
                    </RgCampo>
                    <RgCampo id="peso_estimado_g" rotulo="Peso estimado (gramas)" erro={erros.peso_estimado_g}>
                        <input type="number" min="1" inputMode="numeric" className="rg-entrada" placeholder="500" value={form.peso_estimado_g} onChange={alterar("peso_estimado_g")} />
                    </RgCampo>
                    <RgCampo id="cor" rotulo="Cor predominante" erro={erros.cor}>
                        <input className="rg-entrada" maxLength={30} placeholder="Branco" value={form.cor} onChange={alterar("cor")} />
                    </RgCampo>
                </RgBloco>

                <RgBloco id="doacao-local" numero="02" titulo="LOCAL E DETALHES" ajuda="Onde o material está, para o laboratório combinar a coleta ou a entrega." indice={1}>
                    <RgCampo id="cidade" rotulo="Cidade" erro={erros.cidade}>
                        <input className="rg-entrada" autoComplete="address-level2" value={form.cidade} onChange={alterar("cidade")} />
                    </RgCampo>
                    <RgCampo id="uf" rotulo="UF" erro={erros.uf} ajuda="Sigla com 2 letras.">
                        <input className="rg-entrada rg-entrada--maiuscula" autoComplete="address-level1" maxLength={2} placeholder="PR" value={form.uf} onChange={alterar("uf", (v) => v.replace(/[^a-zA-Z]/g, "").toUpperCase())} />
                    </RgCampo>
                    <RgCampo id="descricao" rotulo="Descrição (opcional)" erro={erros.descricao} inteiro contador={<RgContagem valor={form.descricao} maximo={5000} />}>
                        <textarea className="rg-entrada" maxLength={5000} placeholder="Estado do material, se há suportes, etiquetas ou metais misturados..." value={form.descricao} onChange={alterar("descricao")} />
                    </RgCampo>
                </RgBloco>

                <RgBloco id="doacao-fotos" numero="03" titulo="FOTOS" ajuda={`Até ${MAX_FOTOS} fotos. Os metadados de localização são removidos no envio.`} indice={2}>
                    <AreaEnvio
                        classe="rg-inteiro"
                        icone={ImagePlus}
                        titulo={fotos.length ? `${fotos.length} de ${MAX_FOTOS} foto(s) selecionada(s)` : `Adicionar fotos (até ${MAX_FOTOS})`}
                        ajuda={progresso || "Clique ou arraste. JPG, PNG ou WebP."}
                        accept="image/*"
                        multiple
                        enviando={enviando && fotos.length > 0}
                        aoEscolher={(arquivos) => setFotos((atual) => [...atual, ...arquivos].slice(0, MAX_FOTOS))}
                    />
                    <Miniaturas fotos={fotos} aoRemover={(i) => setFotos((atual) => atual.filter((_, j) => j !== i))} />
                </RgBloco>

                <RgAcoes
                    aoCancelar={() => navigate(-1)}
                    enviando={enviando}
                    sucesso={concluida}
                    rotulo={criada.current ? "ENVIAR FOTOS" : "PUBLICAR DOAÇÃO"}
                    rotuloEnviando={progresso ? "ENVIANDO FOTOS..." : "PUBLICANDO..."}
                    nota="Cada doação concluída rende pontos no ranking da rede."
                />
            </form>
        </div>
    );
}
