import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Box, Download, FileBox, Pencil, Ruler, ShieldCheck, Trash2 } from "lucide-react";
import { BotaoDenunciar, BotoesModeracao } from "../../components/Curadoria";
import { Aviso, Carregando, Chip } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { api, baixarAnexo } from "../../services/api";
import { AREAS_PROJETO, formatarBytes, formatarData, iniciais, LICENCAS, STATUS_PUBLICACAO } from "../../utils/formatar";
import "../../styles/pages/projetos.css";

const VERIFICACAO = { aprovado: ["Verificado", "sucesso"], pendente: ["Verificação pendente", "alerta"], rejeitado: ["Bloqueado", "perigo"] };

export default function ProjetoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario, pode } = useAuth();
    const [projeto, setProjeto] = useState(null);
    const [erro, setErro] = useState("");
    const [aba, setAba] = useState("visao");
    const [imagemAtual, setImagemAtual] = useState(0);

    useEffect(() => {
        api(`/projeto/${id}`).then(setProjeto).catch((e) => setErro(e.message));
    }, [id]);

    if (erro) return <div className="container" style={{ paddingTop: "var(--esp-12)" }}><Aviso tom="perigo">{erro}</Aviso></div>;
    if (!projeto) return <Carregando />;

    const imagens = projeto.anexos.filter((a) => a.tipo === "imagem");
    const modelos = projeto.anexos.filter((a) => a.tipo === "modelo");
    const autor = projeto.id_usuario === usuario?.id;
    const status = STATUS_PUBLICACAO[projeto.status];
    const licenca = LICENCAS[projeto.licenca];

    const excluir = async () => {
        if (!window.confirm("Excluir este projeto e seus arquivos?")) return;
        await api(`/projeto/${id}`, { method: "DELETE" });
        navigate("/projetos", { replace: true });
    };

    return (
        <div className="container">
            <nav className="migalhas" aria-label="Você está em">
                <Link to="/projetos">Projetos</Link> / <span>{AREAS_PROJETO[projeto.area]}</span>
            </nav>

            <div className="projeto">
                <div>
                    {projeto.status !== "publicado" && (
                        <div style={{ marginBottom: "var(--esp-5)" }}>
                            <Aviso tom={projeto.status === "rejeitado" ? "perigo" : "alerta"}>
                                <strong>{status.rotulo}.</strong> {projeto.status === "rejeitado" ? `Motivo: ${projeto.motivo_rejeicao}` : "O projeto aparece no catálogo depois da aprovação da curadoria."}
                            </Aviso>
                        </div>
                    )}

                    <div className="galeria">
                        <div className="galeria__principal">
                            {imagens[imagemAtual] ? <img src={imagens[imagemAtual].url} alt={`Imagem de ${projeto.titulo}`} /> : <Box size={96} strokeWidth={1} aria-hidden="true" />}
                        </div>
                        {imagens.length > 1 && (
                            <div className="galeria__miniaturas">
                                {imagens.map((imagem, i) => (
                                    <button key={imagem.id} type="button" aria-pressed={i === imagemAtual} aria-label={`Imagem ${i + 1}`} onClick={() => setImagemAtual(i)}>
                                        <img src={imagem.url} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <h1 className="projeto__titulo">{projeto.titulo}</h1>

                    <div className="abas" role="tablist" style={{ marginTop: "var(--esp-6)" }}>
                        {[["visao", "Visão geral"], ["arquivos", `Arquivos (${modelos.length})`], ["licenca", "Licença"]].map(([valor, rotulo]) => (
                            <button key={valor} type="button" role="tab" aria-selected={aba === valor} onClick={() => setAba(valor)}>
                                {rotulo}
                            </button>
                        ))}
                    </div>

                    {aba === "visao" && <div className="projeto__texto">{projeto.texto}</div>}

                    {aba === "arquivos" && (
                        <ul className="lista-arquivos">
                            {modelos.length === 0 && <li className="texto-suave">Nenhum modelo 3D enviado ainda.</li>}
                            {modelos.map((modelo) => {
                                const [rotulo, tom] = VERIFICACAO[modelo.status_verificacao];
                                const medidas = modelo.metadados;
                                return (
                                    <li key={modelo.id}>
                                        <span className="lista-arquivos__icone"><FileBox size={22} aria-hidden="true" /></span>
                                        <div className="lista-arquivos__info">
                                            <strong>{modelo.nome_arquivo}</strong>
                                            <span>
                                                {formatarBytes(modelo.tamanho_bytes)} · {medidas?.triangulos?.toLocaleString("pt-BR")} triângulos · {medidas?.volume_cm3} cm³ ·{" "}
                                                <Ruler size={12} aria-hidden="true" style={{ display: "inline", verticalAlign: "-1px" }} /> {medidas?.dimensoes_mm?.x} × {medidas?.dimensoes_mm?.y} × {medidas?.dimensoes_mm?.z} mm
                                            </span>
                                        </div>
                                        <Chip tom={tom}>{rotulo}</Chip>
                                        <button type="button" className="botao botao--secundario botao--pequeno" disabled={modelo.status_verificacao === "rejeitado"} onClick={() => baixarAnexo(modelo.id)}>
                                            <Download size={14} aria-hidden="true" /> Baixar
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {aba === "licenca" && (
                        <div className="projeto__texto">
                            <strong>{licenca?.nome}</strong> — {licenca?.descricao}
                            {"\n\n"}Ao baixar, você concorda em respeitar os termos da licença escolhida pelo autor.
                        </div>
                    )}
                </div>

                <aside className="ficha">
                    <div className="cartao cartao--padding pilha">
                        <div className="linha">
                            <span className="avatar avatar--grande">{iniciais(projeto.usuario?.nome)}</span>
                            <div>
                                <strong>{projeto.usuario?.nome ?? "Autor removido"}</strong>
                                <div className="texto-suave" style={{ fontSize: "var(--texto-xs)" }}>{projeto.usuario?.profissao}</div>
                            </div>
                        </div>
                        <dl>
                            <dt>Área</dt>
                            <dd>{AREAS_PROJETO[projeto.area]}</dd>
                            <dt>Licença</dt>
                            <dd>{licenca?.nome}</dd>
                            <dt>Publicado</dt>
                            <dd>{formatarData(projeto.data_publicacao)}</dd>
                            <dt>Status</dt>
                            <dd><Chip tom={status.tom} ponto>{status.rotulo}</Chip></dd>
                        </dl>
                        {modelos[0] && (
                            <button type="button" className="botao botao--grande botao--bloco" onClick={() => baixarAnexo(modelos[0].id)}>
                                <Download size={18} aria-hidden="true" /> Baixar modelo
                            </button>
                        )}
                        <p className="linha linha--compacta texto-suave" style={{ fontSize: "var(--texto-xs)", alignItems: "flex-start" }}>
                            <ShieldCheck size={14} aria-hidden="true" /> Arquivos validados pelo conteúdo e entregues por link temporário.
                        </p>
                    </div>

                    {(autor || pode("moderador")) && (
                        <div className="cartao cartao--padding linha">
                            <Link to={`/projetos/${id}/editar`} className="botao botao--secundario botao--pequeno"><Pencil size={14} aria-hidden="true" /> Editar e arquivos</Link>
                            <button type="button" className="botao botao--perigo botao--pequeno" onClick={excluir}><Trash2 size={14} aria-hidden="true" /> Excluir</button>
                        </div>
                    )}
                    {pode("moderador") && projeto.status === "em_revisao" && !autor && (
                        <div className="cartao cartao--padding pilha">
                            <span className="sobrelinha">Curadoria</span>
                            <BotoesModeracao recurso="projeto" id={projeto.id} aoDecidir={(p) => setProjeto((atual) => ({ ...atual, ...p }))} />
                        </div>
                    )}
                    {projeto.status === "publicado" && !autor && (
                        <div className="linha"><BotaoDenunciar tipo="projeto" id={projeto.id} /></div>
                    )}
                </aside>
            </div>
        </div>
    );
}
