import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Download, FileBox, Pencil, Ruler, ShieldCheck, Trash2 } from "lucide-react";
import { BotaoDenunciar, BotoesModeracao } from "../../components/Curadoria";
import { Aviso, Carregando, Chip } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { api, baixarAnexo } from "../../services/api";
import { AREAS_PROJETO, formatarBytes, formatarData, LICENCAS, STATUS_PUBLICACAO } from "../../utils/formatar";
import ilustracao from "../../assets/ilustracoes/maker.png";
import { RodapePortfolio, TituloSecao } from "./Projetos";
import "../../styles/pages/projetos.css";

/*
 * Detalhe do projeto — frame "About with Form" do mesmo arquivo Figma:
 * texto à esquerda (588 px) e círculo amarelo de 524 px com a imagem à direita;
 * abaixo, seções com título sublinhado, cartões brancos e a onda do rodapé.
 */

const VERIFICACAO = { aprovado: ["Verificado", "sucesso"], pendente: ["Verificação pendente", "alerta"], rejeitado: ["Bloqueado", "perigo"] };

export default function ProjetoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario, pode } = useAuth();
    const [projeto, setProjeto] = useState(null);
    const [erro, setErro] = useState("");
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
        <div className="pf">
            <section className="pf-sobre">
                <div className="pf-sobre__texto">
                    <nav className="pf-migalhas" aria-label="Você está em">
                        <Link to="/projetos">Projetos</Link> / <span>{AREAS_PROJETO[projeto.area]}</span>
                    </nav>
                    {projeto.status !== "publicado" && (
                        <Aviso tom={projeto.status === "rejeitado" ? "perigo" : "alerta"}>
                            <strong>{status.rotulo}.</strong> {projeto.status === "rejeitado" ? `Motivo: ${projeto.motivo_rejeicao}` : "O projeto aparece no catálogo depois da aprovação da curadoria."}
                        </Aviso>
                    )}
                    <h1 className="projeto__titulo">{projeto.titulo}</h1>
                    <p className="pf-sobre__corpo">{projeto.texto}</p>
                    <div className="pf-botoes">
                        {modelos[0] ? (
                            <button type="button" className="pf-botao pf-botao--primario" onClick={() => baixarAnexo(modelos[0].id)}>
                                Baixar modelo
                            </button>
                        ) : (
                            <a href="#arquivos" className="pf-botao pf-botao--primario">Arquivos</a>
                        )}
                        {(autor || pode("moderador")) && (
                            <Link to={`/projetos/${id}/editar`} className="pf-botao pf-botao--secundario">Editar</Link>
                        )}
                    </div>
                </div>

                <div className="pf-sobre__imagem">
                    <div className="pf-circulo">
                        <img src={imagens[imagemAtual]?.url ?? ilustracao} alt={imagens[imagemAtual] ? `Imagem de ${projeto.titulo}` : ""} className={imagens[imagemAtual] ? "" : "pf-circulo__ilustracao"} />
                    </div>
                    {imagens.length > 1 && (
                        <div className="pf-miniaturas">
                            {imagens.map((imagem, i) => (
                                <button key={imagem.id} type="button" aria-pressed={i === imagemAtual} aria-label={`Imagem ${i + 1}`} onClick={() => setImagemAtual(i)}>
                                    <img src={imagem.url} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="pf-secao">
                <TituloSecao id="arquivos">Arquivos</TituloSecao>
                <div className="pf-cartao">
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
                                    <button type="button" className="pf-botao pf-botao--pilula pf-botao--pequeno" disabled={modelo.status_verificacao === "rejeitado"} onClick={() => baixarAnexo(modelo.id)}>
                                        <Download size={14} aria-hidden="true" /> Baixar
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="pf-nota">
                        <ShieldCheck size={14} aria-hidden="true" /> Arquivos validados pelo conteúdo e entregues por link temporário.
                    </p>
                </div>
            </section>

            <section className="pf-secao pf-secao--form">
                <TituloSecao>Ficha</TituloSecao>
                <div className="pf-ficha">
                    <dl>
                        <div><dt>Autor</dt><dd>{projeto.usuario?.nome ?? "Autor removido"}</dd></div>
                        {projeto.usuario?.profissao && <div><dt>Atuação</dt><dd>{projeto.usuario.profissao}</dd></div>}
                        <div><dt>Área</dt><dd>{AREAS_PROJETO[projeto.area]}</dd></div>
                        <div><dt>Licença</dt><dd>{licenca?.nome} — {licenca?.descricao}</dd></div>
                        <div><dt>Publicado</dt><dd>{formatarData(projeto.data_publicacao)}</dd></div>
                        <div><dt>Status</dt><dd><Chip tom={status.tom} ponto>{status.rotulo}</Chip></dd></div>
                    </dl>

                    {pode("moderador") && projeto.status === "em_revisao" && !autor && (
                        <div className="pf-ficha__bloco">
                            <span className="pf-ficha__rotulo">Curadoria</span>
                            <BotoesModeracao recurso="projeto" id={projeto.id} aoDecidir={(p) => setProjeto((atual) => ({ ...atual, ...p }))} />
                        </div>
                    )}

                    <div className="pf-ficha__acoes">
                        {(autor || pode("moderador")) && (
                            <>
                                <Link to={`/projetos/${id}/editar`} className="pf-botao pf-botao--pilula pf-botao--pequeno"><Pencil size={14} aria-hidden="true" /> Editar e arquivos</Link>
                                <button type="button" className="pf-botao pf-botao--perigo pf-botao--pequeno" onClick={excluir}><Trash2 size={14} aria-hidden="true" /> Excluir</button>
                            </>
                        )}
                        {projeto.status === "publicado" && !autor && <BotaoDenunciar tipo="projeto" id={projeto.id} />}
                        {modelos[0] && (
                            <button type="button" className="pf-botao pf-botao--primario" onClick={() => baixarAnexo(modelos[0].id)}>
                                Baixar
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <RodapePortfolio />
        </div>
    );
}
