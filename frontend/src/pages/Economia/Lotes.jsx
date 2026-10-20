import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Factory, Plus } from "lucide-react";
import { Aviso, CabecalhoPagina, Campo, Carregando, Chip, Dialogo, errosPorCampo, Vazio } from "../../components/ui";
import { api, ApiError, lista } from "../../services/api";
import { formatarData, formatarPeso, STATUS_LOTE } from "../../utils/formatar";
import "../../styles/pages/economia.css";

function NovoLote({ aoFechar, aoCriar }) {
    const [polimeros, setPolimeros] = useState([]);
    const [coletas, setColetas] = useState([]);
    const [form, setForm] = useState({ id_polimero: "", diametro_nominal_mm: "1.75", cor: "" });
    const [pesos, setPesos] = useState({});
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        api("/polimeros").then((r) => setPolimeros(r.data));
        api("/coleta?papel=laboratorio&status=concluida&per_page=100").then((r) => setColetas(lista(r)));
    }, []);

    const disponiveis = coletas.filter((c) => !form.id_polimero || c.doacao?.polimero?.id === Number(form.id_polimero));

    const criar = async () => {
        setErros({});
        setMensagem("");
        const origens = Object.entries(pesos).filter(([, peso]) => Number(peso) > 0).map(([id, peso]) => ({ id: Number(id), peso_g: Number(peso) }));
        try {
            const lote = await api("/lote", { method: "POST", body: { ...form, id_polimero: Number(form.id_polimero) || null, diametro_nominal_mm: Number(form.diametro_nominal_mm), coletas: origens } });
            aoCriar(lote);
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) {
                setErros(errosPorCampo(e));
                setMensagem(Object.values(errosPorCampo(e)).join(" "));
            } else setMensagem(e.message);
        }
    };

    return (
        <Dialogo aberto aoFechar={aoFechar} titulo="Novo lote">
            <div className="pilha">
                <span className="sobrelinha">Produção</span>
                <h2>Formar lote de filamento</h2>
                {mensagem && <Aviso tom="perigo">{mensagem}</Aviso>}
                <div className="formulario-grade">
                    <Campo id="lote-polimero" rotulo="Polímero" erro={erros.id_polimero}>
                        <select id="lote-polimero" className="entrada" value={form.id_polimero} onChange={(e) => { setForm({ ...form, id_polimero: e.target.value }); setPesos({}); }}>
                            <option value="">Selecione</option>
                            {polimeros.map((p) => <option key={p.id} value={p.id}>{p.sigla}</option>)}
                        </select>
                    </Campo>
                    <Campo id="lote-diametro" rotulo="Diâmetro (mm)" erro={erros.diametro_nominal_mm}>
                        <select id="lote-diametro" className="entrada" value={form.diametro_nominal_mm} onChange={(e) => setForm({ ...form, diametro_nominal_mm: e.target.value })}>
                            <option value="1.75">1,75</option>
                            <option value="2.85">2,85</option>
                        </select>
                    </Campo>
                    <div className="inteiro">
                        <Campo id="lote-cor" rotulo="Cor">
                            <input id="lote-cor" className="entrada" value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} />
                        </Campo>
                    </div>
                </div>
                <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="pilha">
                    <legend className="campo__rotulo">Coletas de origem (peso aproveitado em gramas)</legend>
                    {disponiveis.length === 0 && <p className="texto-suave">Nenhuma coleta concluída {form.id_polimero && "deste polímero"} ainda.</p>}
                    {disponiveis.map((c) => (
                        <label key={c.id} className="linha linha--entre" style={{ fontSize: "var(--texto-sm)" }}>
                            <span>#{c.id} · {c.doacao?.titulo} <span className="texto-suave">({formatarPeso(c.peso_recebido_g)} recebidos)</span></span>
                            <input type="number" min="0" className="entrada" style={{ width: 120 }} aria-label={`Peso da coleta ${c.id}`} value={pesos[c.id] ?? ""} onChange={(e) => setPesos({ ...pesos, [c.id]: e.target.value })} />
                        </label>
                    ))}
                </fieldset>
                <div className="linha linha--entre">
                    <button type="button" className="botao botao--secundario" onClick={aoFechar}>Cancelar</button>
                    <button type="button" className="botao" onClick={criar}>Criar lote</button>
                </div>
            </div>
        </Dialogo>
    );
}

export default function Lotes() {
    const [lotes, setLotes] = useState(null);
    const [novo, setNovo] = useState(false);

    useEffect(() => {
        api("/lote?per_page=100").then((r) => setLotes(lista(r))).catch(() => setLotes([]));
    }, []);

    return (
        <div className="container">
            <CabecalhoPagina sobrelinha="Receptores e reciclagem" titulo="Lotes de filamento" descricao="Forme lotes a partir das coletas concluídas, registre as etapas de produção e emita o laudo. Cada lote ganha um QR Code público.">
                <button type="button" className="botao" onClick={() => setNovo(true)}><Plus size={16} aria-hidden="true" /> Novo lote</button>
            </CabecalhoPagina>

            {lotes === null && <Carregando />}
            {lotes?.length === 0 && <Vazio icone={Factory} titulo="Nenhum lote ainda">Conclua coletas em Doações › Minhas coletas e forme o primeiro lote.</Vazio>}
            {lotes?.length > 0 && (
                <div className="tabela-container">
                    <table className="tabela">
                        <thead>
                            <tr><th>Código</th><th>Material</th><th>Entrada</th><th>Saída</th><th>Status</th><th>Criado</th></tr>
                        </thead>
                        <tbody>
                            {lotes.map((lote) => (
                                <tr key={lote.id}>
                                    <td><Link to={`/lotes/${lote.id}`} className="codigo" style={{ color: "var(--cor-primaria)" }}>{lote.codigo}</Link></td>
                                    <td>{lote.polimero?.sigla} · {lote.diametro_nominal_mm.toLocaleString("pt-BR")} mm {lote.cor && `· ${lote.cor}`}</td>
                                    <td>{formatarPeso(lote.peso_entrada_g)}</td>
                                    <td>{formatarPeso(lote.peso_saida_g)}</td>
                                    <td><Chip tom={STATUS_LOTE[lote.status]?.tom} ponto>{STATUS_LOTE[lote.status]?.rotulo}</Chip></td>
                                    <td className="texto-suave">{formatarData(lote.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {novo && <NovoLote aoFechar={() => setNovo(false)} aoCriar={(lote) => { setLotes((atual) => [lote, ...(atual ?? [])]); setNovo(false); }} />}
        </div>
    );
}
