import React, { useState } from "react";
import { Check, Flag, X } from "lucide-react";
import { Aviso, Campo, Dialogo } from "./ui";
import { api } from "../services/api";

/** Aprovar ou rejeitar (com motivo) uma notícia ou projeto em revisão. */
export function BotoesModeracao({ recurso, id, aoDecidir }) {
    const [rejeitando, setRejeitando] = useState(false);
    const [motivo, setMotivo] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    const decidir = async (decisao) => {
        setEnviando(true);
        setErro("");
        try {
            const atualizado = await api(`/${recurso}/${id}/moderacao`, { method: "POST", body: { decisao, motivo: decisao === "rejeitar" ? motivo : undefined } });
            setRejeitando(false);
            aoDecidir?.(atualizado);
        } catch (e) {
            setErro(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <>
            <div className="linha">
                <button type="button" className="botao botao--eco botao--pequeno" disabled={enviando} onClick={() => decidir("aprovar")}>
                    <Check size={14} aria-hidden="true" /> Aprovar
                </button>
                <button type="button" className="botao botao--perigo botao--pequeno" disabled={enviando} onClick={() => setRejeitando(true)}>
                    <X size={14} aria-hidden="true" /> Rejeitar
                </button>
            </div>
            {erro && !rejeitando && <Aviso tom="perigo">{erro}</Aviso>}

            <Dialogo aberto={rejeitando} aoFechar={() => setRejeitando(false)} titulo="Rejeitar publicação">
                <div className="pilha">
                    <h2>Rejeitar publicação</h2>
                    <p className="texto-suave">O autor verá o motivo e poderá corrigir e reenviar.</p>
                    {erro && <Aviso tom="perigo">{erro}</Aviso>}
                    <Campo id="motivo-rejeicao" rotulo="Motivo">
                        <textarea id="motivo-rejeicao" className="entrada" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                    </Campo>
                    <div className="linha linha--entre">
                        <button type="button" className="botao botao--secundario" onClick={() => setRejeitando(false)}>
                            Cancelar
                        </button>
                        <button type="button" className="botao" disabled={!motivo.trim() || enviando} onClick={() => decidir("rejeitar")}>
                            Confirmar rejeição
                        </button>
                    </div>
                </div>
            </Dialogo>
        </>
    );
}

const MOTIVOS = {
    peca_perigosa: "Peça perigosa (ex.: arma ou risco à saúde)",
    licenca_violada: "Licença ou autoria violada",
    conteudo_ofensivo: "Conteúdo ofensivo",
    spam: "Spam ou propaganda",
    outro: "Outro motivo",
};

/** Denúncia de conteúdo publicado para a curadoria. */
export function BotaoDenunciar({ tipo, id }) {
    const [aberto, setAberto] = useState(false);
    const [motivo, setMotivo] = useState("peca_perigosa");
    const [descricao, setDescricao] = useState("");
    const [estado, setEstado] = useState({ erro: "", enviado: false });

    const enviar = async () => {
        try {
            await api("/denuncia", { method: "POST", body: { tipo, id, motivo, descricao } });
            setEstado({ erro: "", enviado: true });
        } catch (e) {
            setEstado({ erro: e.message, enviado: false });
        }
    };

    return (
        <>
            <button type="button" className="botao botao--fantasma botao--pequeno" onClick={() => setAberto(true)}>
                <Flag size={14} aria-hidden="true" /> Denunciar
            </button>
            <Dialogo aberto={aberto} aoFechar={() => setAberto(false)} titulo="Denunciar conteúdo">
                <div className="pilha">
                    <h2>Denunciar conteúdo</h2>
                    {estado.enviado ? (
                        <>
                            <Aviso tom="sucesso">Denúncia enviada. A curadoria vai analisar em breve.</Aviso>
                            <button type="button" className="botao" onClick={() => setAberto(false)}>
                                Fechar
                            </button>
                        </>
                    ) : (
                        <>
                            {estado.erro && <Aviso tom="perigo">{estado.erro}</Aviso>}
                            <Campo id="motivo-denuncia" rotulo="Motivo">
                                <select id="motivo-denuncia" className="entrada" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                                    {Object.entries(MOTIVOS).map(([valor, rotulo]) => (
                                        <option key={valor} value={valor}>
                                            {rotulo}
                                        </option>
                                    ))}
                                </select>
                            </Campo>
                            <Campo id="descricao-denuncia" rotulo="Detalhes (opcional)">
                                <textarea id="descricao-denuncia" className="entrada" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                            </Campo>
                            <div className="linha linha--entre">
                                <button type="button" className="botao botao--secundario" onClick={() => setAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="button" className="botao" onClick={enviar}>
                                    Enviar denúncia
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Dialogo>
        </>
    );
}
