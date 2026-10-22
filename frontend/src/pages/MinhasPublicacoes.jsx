import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { CabecalhoPagina, Carregando, Chip, Vazio } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { api, lista } from "../services/api";
import { STATUS_PUBLICACAO, tempoRelativo } from "../utils/formatar";

/** Acompanhamento da curadoria das notícias e projetos do próprio usuário. */
export default function MinhasPublicacoes() {
    const { pode } = useAuth();
    const [aba, setAba] = useState("projetos");
    const [itens, setItens] = useState(null);

    useEffect(() => {
        setItens(null);
        const recurso = aba === "projetos" ? "projeto" : "noticia";
        api(`/${recurso}/minhas?per_page=100`).then((r) => setItens(lista(r))).catch(() => setItens([]));
    }, [aba]);

    const base = aba === "projetos" ? "/projetos" : "/noticias";

    return (
        <div className="container">
            <CabecalhoPagina sobrelinha="Curadoria" titulo="Minhas publicações" descricao="Tudo o que você enviou e em que ponto da revisão está.">
                <Link to="/projetos/novo" className="botao botao--secundario">Novo projeto</Link>
                {pode("publicador") && <Link to="/noticias/nova" className="botao">Nova notícia</Link>}
            </CabecalhoPagina>

            <div className="abas" role="tablist" style={{ marginBottom: "var(--esp-6)" }}>
                {[["projetos", "Projetos"], ["noticias", "Notícias"]].map(([valor, rotulo]) => (
                    <button key={valor} type="button" role="tab" aria-selected={aba === valor} onClick={() => setAba(valor)}>
                        {rotulo}
                    </button>
                ))}
            </div>

            <div key={aba} className="troca-suave">
            {itens === null && <Carregando />}
            {itens?.length === 0 && <Vazio icone={FileText} titulo="Nada por aqui ainda">Quando você enviar algo, acompanhe a revisão nesta página.</Vazio>}
            {itens?.length > 0 && (
                <div className="tabela-container">
                    <table className="tabela">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Status</th>
                                <th>Observação da curadoria</th>
                                <th>Atualizado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itens.map((item, i) => {
                                const status = STATUS_PUBLICACAO[item.status];
                                return (
                                    <tr key={item.id} className="linha-entra" style={{ "--atraso": `${Math.min(i, 10) * 50}ms` }}>
                                        <td><Link to={`${base}/${item.id}`}><strong>{item.titulo}</strong></Link></td>
                                        <td><Chip tom={status.tom} ponto>{status.rotulo}</Chip></td>
                                        <td className="texto-suave">{item.motivo_rejeicao ?? "—"}</td>
                                        <td className="texto-suave">{tempoRelativo(item.moderado_em ?? item.data_publicacao)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            </div>
        </div>
    );
}
