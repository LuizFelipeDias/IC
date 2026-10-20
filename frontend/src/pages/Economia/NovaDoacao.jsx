import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { Aviso, CabecalhoPagina, Campo, errosPorCampo } from "../../components/ui";
import { api, ApiError } from "../../services/api";
import { TIPOS_DOACAO } from "../../utils/formatar";
import "../../styles/pages/economia.css";

export default function NovaDoacao() {
    const navigate = useNavigate();
    const [polimeros, setPolimeros] = useState([]);
    const [form, setForm] = useState({ id_polimero: "", tipo: "resto_filamento", titulo: "", descricao: "", peso_estimado_g: "", cor: "", cidade: "", uf: "" });
    const [fotos, setFotos] = useState([]);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        api("/polimeros").then((r) => setPolimeros(r.data));
    }, []);

    const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

    const enviar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            const doacao = await api("/doacao", { method: "POST", body: { ...form, id_polimero: Number(form.id_polimero) || null, peso_estimado_g: Number(form.peso_estimado_g) || null } });
            for (const foto of fotos) {
                const dados = new FormData();
                dados.append("arquivo", foto);
                await api(`/doacao/${doacao.id}/fotos`, { method: "POST", body: dados });
            }
            navigate("/doacoes", { replace: true });
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) setErros(errosPorCampo(e));
            else setMensagem(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: 860 }}>
            <CabecalhoPagina sobrelinha="Doação de makers" titulo="Doar resíduos de impressão" descricao="Informe o polímero e uma estimativa de peso. Separar por material faz toda a diferença na reciclagem." />
            <form className="cartao cartao--padding pilha" onSubmit={enviar} noValidate>
                {mensagem && <Aviso tom="perigo">{mensagem}</Aviso>}
                <div className="formulario-grade">
                    <div className="inteiro">
                        <Campo id="titulo" rotulo="Título" erro={erros.titulo}>
                            <input id="titulo" className="entrada" placeholder="Ex.: Sobras de PLA branco" value={form.titulo} onChange={alterar("titulo")} aria-invalid={Boolean(erros.titulo)} />
                        </Campo>
                    </div>
                    <Campo id="id_polimero" rotulo="Polímero" erro={erros.id_polimero}>
                        <select id="id_polimero" className="entrada" value={form.id_polimero} onChange={alterar("id_polimero")} aria-invalid={Boolean(erros.id_polimero)}>
                            <option value="">Selecione</option>
                            {polimeros.map((p) => <option key={p.id} value={p.id}>{p.sigla} — {p.nome}</option>)}
                        </select>
                    </Campo>
                    <Campo id="tipo" rotulo="Tipo de resíduo" erro={erros.tipo}>
                        <select id="tipo" className="entrada" value={form.tipo} onChange={alterar("tipo")}>
                            {Object.entries(TIPOS_DOACAO).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
                        </select>
                    </Campo>
                    <Campo id="peso_estimado_g" rotulo="Peso estimado (gramas)" erro={erros.peso_estimado_g}>
                        <input id="peso_estimado_g" type="number" min="1" className="entrada" value={form.peso_estimado_g} onChange={alterar("peso_estimado_g")} aria-invalid={Boolean(erros.peso_estimado_g)} />
                    </Campo>
                    <Campo id="cor" rotulo="Cor predominante" erro={erros.cor}>
                        <input id="cor" className="entrada" value={form.cor} onChange={alterar("cor")} />
                    </Campo>
                    <Campo id="cidade" rotulo="Cidade" erro={erros.cidade}>
                        <input id="cidade" className="entrada" value={form.cidade} onChange={alterar("cidade")} />
                    </Campo>
                    <Campo id="uf" rotulo="UF" erro={erros.uf}>
                        <input id="uf" className="entrada" maxLength={2} value={form.uf} onChange={alterar("uf")} />
                    </Campo>
                    <div className="inteiro">
                        <Campo id="descricao" rotulo="Descrição" erro={erros.descricao}>
                            <textarea id="descricao" className="entrada" placeholder="Estado do material, se há suportes, etiquetas ou metais misturados..." value={form.descricao} onChange={alterar("descricao")} />
                        </Campo>
                    </div>
                    <label className="area-envio inteiro">
                        <ImagePlus size={28} aria-hidden="true" />
                        <strong>{fotos.length ? `${fotos.length} foto(s) selecionada(s)` : "Adicionar fotos (até 5)"}</strong>
                        <span>Os metadados de localização das fotos são removidos no envio.</span>
                        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setFotos([...e.target.files].slice(0, 5))} />
                    </label>
                </div>
                <div className="linha linha--entre">
                    <button type="button" className="botao botao--secundario" onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className="botao botao--eco" disabled={enviando}>{enviando ? "Publicando..." : "Publicar doação"}</button>
                </div>
            </form>
        </div>
    );
}
