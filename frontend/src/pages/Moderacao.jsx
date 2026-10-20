import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, FileSearch, Flag, ShieldCheck } from "lucide-react";
import { BotoesModeracao } from "../components/Curadoria";
import { Aviso, CabecalhoPagina, Campo, Carregando, Chip, Dialogo, Vazio } from "../components/ui";
import { api, lista } from "../services/api";
import { formatarData, TIPOS_USUARIO } from "../utils/formatar";

function Instituicoes() {
    const [itens, setItens] = useState(null);
    const [consultas, setConsultas] = useState({});
    const [rejeitando, setRejeitando] = useState(null);
    const [motivo, setMotivo] = useState("");
    const [erro, setErro] = useState("");

    const carregar = useCallback(() => api("/moderacao/instituicoes?per_page=100").then((r) => setItens(lista(r))), []);
    useEffect(() => {
        carregar();
    }, [carregar]);

    const consultar = async (id) => {
        setConsultas((atual) => ({ ...atual, [id]: {} }));
        try {
            const dados = await api(`/moderacao/instituicoes/${id}/cnpj`);
            setConsultas((atual) => ({ ...atual, [id]: { dados } }));
        } catch (e) {
            setConsultas((atual) => ({ ...atual, [id]: { erro: e.message } }));
        }
    };

    const decidir = async (id, decisao, justificativa) => {
        setErro("");
        try {
            await api(`/moderacao/instituicoes/${id}/verificacao`, { method: "POST", body: { decisao, motivo: justificativa } });
            setItens((atual) => atual.filter((i) => i.id !== id));
            setRejeitando(null);
            setMotivo("");
        } catch (e) {
            setErro(e.message);
        }
    };

    if (itens === null) return <Carregando />;
    if (itens.length === 0) return <Vazio icone={ShieldCheck} titulo="Nenhuma instituição aguardando verificação" />;

    return (
        <div className="pilha">
            {erro && <Aviso tom="perigo">{erro}</Aviso>}
            {itens.map((inst) => {
                const consulta = consultas[inst.id];
                return (
                    <article key={inst.id} className="cartao cartao--padding pilha">
                        <div className="linha linha--entre">
                            <div className="linha">
                                <span className="avatar avatar--grande"><Building2 size={18} aria-hidden="true" /></span>
                                <div>
                                    <strong>{inst.nome}</strong>
                                    <div className="texto-suave" style={{ fontSize: "var(--texto-sm)" }}>{TIPOS_USUARIO[inst.tipo_usuario]} · {inst.email} · {inst.telefone}</div>
                                </div>
                            </div>
                            <Chip tom="alerta" ponto>Desde {formatarData(inst.created_at)}</Chip>
                        </div>
                        <div className="linha" style={{ fontSize: "var(--texto-sm)" }}>
                            <span>CNPJ <strong className="codigo" style={{ fontSize: "var(--texto-sm)", color: "var(--cor-texto)" }}>{inst.cnpj}</strong></span>
                            {inst.codigo_inep && <span>INEP <strong className="codigo" style={{ fontSize: "var(--texto-sm)", color: "var(--cor-texto)" }}>{inst.codigo_inep}</strong></span>}
                        </div>
                        {consulta?.dados && (
                            <Aviso tom={consulta.dados.situacao === "ATIVA" ? "sucesso" : "alerta"}>
                                Receita Federal: <strong>{consulta.dados.razao_social}</strong> — situação {consulta.dados.situacao}
                                {consulta.dados.municipio && ` · ${consulta.dados.municipio}/${consulta.dados.uf}`}
                            </Aviso>
                        )}
                        {consulta?.erro && <Aviso tom="alerta">{consulta.erro}</Aviso>}
                        <div className="linha">
                            <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => consultar(inst.id)}><FileSearch size={14} aria-hidden="true" /> Consultar CNPJ</button>
                            <button type="button" className="botao botao--eco botao--pequeno" onClick={() => decidir(inst.id, "aprovar")}>Aprovar</button>
                            <button type="button" className="botao botao--perigo botao--pequeno" onClick={() => setRejeitando(inst)}>Rejeitar</button>
                        </div>
                    </article>
                );
            })}

            <Dialogo aberto={Boolean(rejeitando)} aoFechar={() => setRejeitando(null)} titulo="Rejeitar cadastro">
                <div className="pilha">
                    <h2>Rejeitar cadastro de {rejeitando?.nome}</h2>
                    <Campo id="motivo-inst" rotulo="Motivo (a instituição verá esta mensagem)">
                        <textarea id="motivo-inst" className="entrada" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                    </Campo>
                    <div className="linha linha--entre">
                        <button type="button" className="botao botao--secundario" onClick={() => setRejeitando(null)}>Cancelar</button>
                        <button type="button" className="botao" disabled={!motivo.trim()} onClick={() => decidir(rejeitando.id, "rejeitar", motivo)}>Confirmar</button>
                    </div>
                </div>
            </Dialogo>
        </div>
    );
}

function Publicacoes() {
    const [itens, setItens] = useState(null);

    useEffect(() => {
        Promise.all([api("/noticia?status=em_revisao&per_page=100"), api("/projeto?status=em_revisao&per_page=100")]).then(([n, p]) =>
            setItens([...lista(n).map((x) => ({ ...x, recurso: "noticia" })), ...lista(p).map((x) => ({ ...x, recurso: "projeto" }))]),
        );
    }, []);

    if (itens === null) return <Carregando />;
    if (itens.length === 0) return <Vazio icone={ShieldCheck} titulo="Nada aguardando revisão" />;

    return (
        <div className="tabela-container">
            <table className="tabela">
                <thead><tr><th>Publicação</th><th>Tipo</th><th>Autor</th><th>Decisão</th></tr></thead>
                <tbody>
                    {itens.map((item) => (
                        <tr key={`${item.recurso}-${item.id}`}>
                            <td><Link to={`/${item.recurso === "noticia" ? "noticias" : "projetos"}/${item.id}`}><strong>{item.titulo}</strong></Link></td>
                            <td><Chip>{item.recurso === "noticia" ? "Notícia" : "Projeto"}</Chip></td>
                            <td>{item.usuario?.nome}</td>
                            <td><BotoesModeracao recurso={item.recurso} id={item.id} aoDecidir={() => setItens((atual) => atual.filter((i) => !(i.id === item.id && i.recurso === item.recurso)))} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const MOTIVOS = { peca_perigosa: "Peça perigosa", licenca_violada: "Licença violada", conteudo_ofensivo: "Conteúdo ofensivo", spam: "Spam", outro: "Outro" };

function Denuncias() {
    const [itens, setItens] = useState(null);

    useEffect(() => {
        api("/denuncia?per_page=100").then((r) => setItens(lista(r)));
    }, []);

    const resolver = async (denuncia, procedente) => {
        await api(`/denuncia/${denuncia.id}/resolver`, { method: "POST", body: { procedente } });
        setItens((atual) => atual.filter((d) => d.id !== denuncia.id));
    };

    if (itens === null) return <Carregando />;
    if (itens.length === 0) return <Vazio icone={Flag} titulo="Nenhuma denúncia aberta" />;

    return (
        <div className="tabela-container">
            <table className="tabela">
                <thead><tr><th>Conteúdo</th><th>Motivo</th><th>Denunciante</th><th>Decisão</th></tr></thead>
                <tbody>
                    {itens.map((d) => (
                        <tr key={d.id}>
                            <td>
                                <Link to={`/${d.denunciavel_type === "noticia" ? "noticias" : "projetos"}/${d.denunciavel_id}`}><strong>{d.denunciavel?.titulo ?? "Conteúdo removido"}</strong></Link>
                                {d.descricao && <div className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>“{d.descricao}”</div>}
                            </td>
                            <td><Chip tom="perigo">{MOTIVOS[d.motivo] ?? d.motivo}</Chip></td>
                            <td>{d.denunciante?.nome}</td>
                            <td className="linha">
                                <button type="button" className="botao botao--perigo botao--pequeno" onClick={() => resolver(d, true)}>Procedente (retirar)</button>
                                <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => resolver(d, false)}>Improcedente</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Moderacao() {
    const [aba, setAba] = useState("instituicoes");

    return (
        <div className="container">
            <CabecalhoPagina sobrelinha="Curadoria e segurança" titulo="Moderação" descricao="Verifique instituições, revise publicações e trate denúncias. Toda decisão fica registrada." />
            <div className="abas" role="tablist" style={{ marginBottom: "var(--esp-6)" }}>
                {[["instituicoes", "Instituições"], ["publicacoes", "Publicações em revisão"], ["denuncias", "Denúncias"]].map(([valor, rotulo]) => (
                    <button key={valor} type="button" role="tab" aria-selected={aba === valor} onClick={() => setAba(valor)}>{rotulo}</button>
                ))}
            </div>
            {aba === "instituicoes" && <Instituicoes />}
            {aba === "publicacoes" && <Publicacoes />}
            {aba === "denuncias" && <Denuncias />}
        </div>
    );
}
