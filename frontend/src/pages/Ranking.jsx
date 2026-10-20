import React, { useEffect, useState } from "react";
import { Award, Trophy } from "lucide-react";
import { CabecalhoPagina, Carregando, Chip, Vazio } from "../components/ui";
import { api, lista, query } from "../services/api";
import { iniciais, TIPOS_USUARIO } from "../utils/formatar";
import "../styles/pages/home.css";

export default function Ranking() {
    const [tipo, setTipo] = useState("");
    const [itens, setItens] = useState(null);

    useEffect(() => {
        setItens(null);
        api(`/ranking${query({ tipo })}`).then((r) => setItens(lista(r)));
    }, [tipo]);

    return (
        <div className="container" style={{ maxWidth: 880 }}>
            <CabecalhoPagina sobrelinha="Gamificação" titulo="Ranking de impacto" descricao="Pontos por chamados concluídos (50), coletas (30), projetos aprovados (20) e doações entregues (15)." />
            <div className="segmentado" style={{ marginBottom: "var(--esp-6)" }} role="group" aria-label="Tipo de participante">
                {[["", "Todos"], ["pessoa_fisica", "Makers e profissionais"], ["laboratorio", "Laboratórios"], ["empresa", "Empresas"]].map(([valor, rotulo]) => (
                    <button key={valor} type="button" aria-pressed={tipo === valor} onClick={() => setTipo(valor)}>{rotulo}</button>
                ))}
            </div>
            {itens === null && <Carregando />}
            {itens?.length === 0 && <Vazio icone={Trophy} titulo="Ninguém pontuou nesta categoria ainda" />}
            {itens?.length > 0 && (
                <ol className="cartao ranking">
                    {itens.map((item) => (
                        <li key={item.id}>
                            <span className="ranking__posicao">{item.posicao}</span>
                            <span className="linha">
                                <span className="avatar">{iniciais(item.nome)}</span>
                                <span>
                                    <strong>{item.nome}</strong>
                                    <br />
                                    <span className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>{TIPOS_USUARIO[item.tipo]}</span>
                                </span>
                                {item.selos.map((selo) => <Chip key={selo.slug} tom="primaria"><Award size={12} aria-hidden="true" /> {selo.nome}</Chip>)}
                            </span>
                            <span className="ranking__pontos">{item.pontos} pts</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
