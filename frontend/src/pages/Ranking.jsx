import React, { useEffect, useState } from "react";
import { Award, Crown, Trophy } from "lucide-react";
import { CabecalhoPagina, Carregando, Contador, Vazio } from "../components/ui";
import { api, lista, query } from "../services/api";
import { iniciais, TIPOS_USUARIO } from "../utils/formatar";
import "../styles/pages/ranking.css";

const TIPOS = [["", "Todos"], ["pessoa_fisica", "Makers e profissionais"], ["laboratorio", "Laboratórios"], ["empresa", "Empresas"]];

/* Ordem visual do pódio: 2º à esquerda, 1º no centro, 3º à direita. */
const ORDEM_PODIO = [1, 0, 2];

function Selos({ selos }) {
    if (!selos?.length) return null;
    return (
        <span className="selos">
            {selos.map((selo) => (
                <span key={selo.slug} className="selo" title={selo.descricao ?? selo.nome}>
                    <Award size={12} aria-hidden="true" /> {selo.nome}
                </span>
            ))}
        </span>
    );
}

export default function Ranking() {
    const [tipo, setTipo] = useState("");
    const [itens, setItens] = useState(null);

    useEffect(() => {
        setItens(null);
        api(`/ranking${query({ tipo })}`).then((r) => setItens(lista(r))).catch(() => setItens([]));
    }, [tipo]);

    const maximo = Math.max(1, ...(itens ?? []).map((i) => i.pontos));
    const podio = (itens ?? []).slice(0, 3);
    const demais = (itens ?? []).slice(3);

    return (
        <div className="container" style={{ maxWidth: 960 }}>
            <CabecalhoPagina sobrelinha="Gamificação" titulo="Ranking de impacto" descricao="Pontos por chamados concluídos (50), coletas (30), projetos aprovados (20) e doações entregues (15)." />

            <div className="segmentado" style={{ marginBottom: "var(--esp-8)" }} role="group" aria-label="Tipo de participante">
                {TIPOS.map(([valor, rotulo]) => (
                    <button key={valor} type="button" aria-pressed={tipo === valor} onClick={() => setTipo(valor)}>{rotulo}</button>
                ))}
            </div>

            {itens === null && <Carregando />}
            {itens?.length === 0 && <Vazio icone={Trophy} titulo="Ninguém pontuou nesta categoria ainda" />}

            {itens?.length > 0 && (
                <div key={tipo} className="troca-suave">
                    <ol className="podio" aria-label="Três primeiros colocados" style={{ "--colunas": podio.length }}>
                        {ORDEM_PODIO.filter((i) => podio[i]).map((i) => {
                            const item = podio[i];
                            return (
                                <li key={item.id} className={`podio__lugar podio__lugar--${i + 1}`} style={{ "--atraso": `${[200, 0, 400][ORDEM_PODIO.indexOf(i)]}ms` }}>
                                    <div className="podio__pessoa">
                                        {i === 0 && <Crown className="podio__coroa" size={26} aria-hidden="true" />}
                                        <span className="avatar avatar--grande">{iniciais(item.nome)}</span>
                                        <strong>{item.nome}</strong>
                                        <span className="texto-suave">{TIPOS_USUARIO[item.tipo]}</span>
                                        <Selos selos={item.selos} />
                                    </div>
                                    <div className="podio__degrau">
                                        <span className="podio__posicao">{item.posicao}º</span>
                                        <span className="podio__pontos"><Contador valor={item.pontos} /> pts</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>

                    {demais.length > 0 && (
                        <ol className="cartao ranking" start={4}>
                            {demais.map((item, i) => (
                                <li key={item.id} data-revelar style={{ "--atraso": `${Math.min(i, 10) * 50}ms` }}>
                                    <span className="ranking__posicao">{item.posicao}</span>
                                    <span className="ranking__pessoa">
                                        <span className="avatar">{iniciais(item.nome)}</span>
                                        <span>
                                            <strong>{item.nome}</strong>
                                            <br />
                                            <span className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>{TIPOS_USUARIO[item.tipo]}</span>
                                        </span>
                                        <Selos selos={item.selos} />
                                    </span>
                                    <span className="ranking__pontos">
                                        {item.pontos} pts
                                        <span className="ranking__barra" aria-hidden="true">
                                            <span style={{ "--fracao": item.pontos / maximo }} />
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            )}
        </div>
    );
}
