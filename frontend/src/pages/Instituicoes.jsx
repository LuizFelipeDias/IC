import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Check, Copy, FlaskConical, Inbox, School, Search, Store, X } from "lucide-react";
import { Chip, Dialogo, Vazio } from "../components/ui";
import { OpcaoCaixa, OpcaoSeta, RgErro } from "../components/Squarespace";
import { useAuth } from "../contexts/AuthContext";
import { api, lista, query } from "../services/api";
import { formatarData, iniciais } from "../utils/formatar";
import "../styles/pages/chamados.css";
import "../styles/pages/registro.css";
import "../styles/pages/instituicoes.css";

/* ==================================================================
 * Empresas e instituições verificadas — diretório no visual
 * "Browse templates" (Website Templates — Squarespace): Section 01 com
 * colunas de filtro, Section 02 com resultados sublinhados, grade de
 * cartões de template (monograma no lugar da imagem) e Section 04.
 * ================================================================== */

const TIPOS = {
    empresa: { rotulo: "Empresas", singular: "Empresa", icone: Building2 },
    escola: { rotulo: "Escolas", singular: "Escola", icone: School },
    laboratorio: { rotulo: "Laboratórios", singular: "Laboratório", icone: FlaskConical },
    estabelecimento: { rotulo: "Estabelecimentos", singular: "Estabelecimento", icone: Store },
};

const ORDENS = [
    ["nome", "Nome (A–Z)"],
    ["pontos", "Mais pontos"],
    ["recentes", "Verificadas recentemente"],
];

const NUMEROS = [
    ["vagas", "VAGAS"],
    ["projetos_publicados", "PROJETOS"],
    ["chamados_abertos", "CHAMADOS ABERTOS"],
    ["chamados_resolvidos", "ATENDIDOS"],
    ["lotes", "LOTES"],
];

// Só os números que fazem sentido para cada tipo aparecem no cartão.
const NUMEROS_CARTAO = {
    empresa: ["vagas", "projetos_publicados", "chamados_abertos"],
    escola: ["chamados_abertos", "projetos_publicados", "vagas"],
    laboratorio: ["lotes", "chamados_resolvidos", "projetos_publicados"],
    estabelecimento: ["vagas", "chamados_abertos", "projetos_publicados"],
};

function CartaoInstituicao({ instituicao, indice, aoAbrir }) {
    const tipo = TIPOS[instituicao.tipo] ?? TIPOS.empresa;
    const Icone = tipo.icone;
    const numeros = NUMEROS_CARTAO[instituicao.tipo] ?? NUMEROS_CARTAO.empresa;
    return (
        <article className={`in-cartao in-cartao--${instituicao.tipo}`} data-revelar style={{ "--atraso": `${(indice % 3) * 90}ms` }}>
            <button type="button" className="in-cartao__capa" onClick={aoAbrir} aria-label={`Ver detalhes de ${instituicao.nome}`}>
                <span className="in-cartao__monograma" aria-hidden="true">{iniciais(instituicao.nome)}</span>
                <span className="in-cartao__selo"><BadgeCheck size={14} aria-hidden="true" /> VERIFICADA</span>
                <span className="in-cartao__pontos">{(instituicao.pontos ?? 0).toLocaleString("pt-BR")} PTS</span>
            </button>
            <div className="sq-legenda in-cartao__legenda">
                <div className="in-cartao__nome">
                    <h3>{instituicao.nome}</h3>
                    <span className="sq-rotulo">{(instituicao.tipo_rotulo ?? tipo.singular).toUpperCase()}</span>
                </div>
                <span className="sq-legenda__icone" title={instituicao.tipo_rotulo ?? tipo.singular}><Icone size={20} aria-hidden="true" /></span>
            </div>
            <dl className="in-cartao__numeros">
                {numeros.map((chave) => (
                    <div key={chave}>
                        <dt>{NUMEROS.find(([c]) => c === chave)[1]}</dt>
                        <dd>{instituicao.numeros?.[chave] ?? 0}</dd>
                    </div>
                ))}
            </dl>
        </article>
    );
}

function DetalheInstituicao({ id, resumo, aberto, aoFechar }) {
    const [dados, setDados] = useState(resumo);
    const [erro, setErro] = useState("");

    useEffect(() => {
        api(`/instituicoes/${id}`).then((r) => setDados(r.data ?? r)).catch((e) => setErro(e.message));
    }, [id]);

    const tipo = TIPOS[dados.tipo] ?? TIPOS.empresa;
    const Icone = tipo.icone;
    return (
        <Dialogo aberto={aberto} aoFechar={aoFechar} titulo={dados.nome}>
            <div className={`sq rg in-detalhe in-cartao--${dados.tipo}`}>
                <div className="in-detalhe__topo">
                    <p className="sq-rotulo">{(dados.tipo_rotulo ?? tipo.singular).toUpperCase()}</p>
                    <button type="button" className="rg-remover" aria-label="Fechar" onClick={aoFechar}><X size={16} aria-hidden="true" /></button>
                </div>
                <div className="in-detalhe__cabeca">
                    <span className="in-detalhe__monograma" aria-hidden="true">{iniciais(dados.nome)}</span>
                    <div>
                        <h2>{dados.nome}</h2>
                        <Chip tom="sucesso" ponto>Verificada em {formatarData(dados.verificado_em)}</Chip>
                    </div>
                    <Icone size={22} aria-hidden="true" className="in-detalhe__icone" />
                </div>
                <RgErro>{erro}</RgErro>
                <dl className="in-detalhe__numeros">
                    <div><dt>PONTOS</dt><dd>{(dados.pontos ?? 0).toLocaleString("pt-BR")}</dd></div>
                    {NUMEROS.map(([chave, rotulo]) => (
                        <div key={chave}><dt>{rotulo}</dt><dd>{dados.numeros?.[chave] ?? 0}</dd></div>
                    ))}
                </dl>
                <div className="rg-acoes__botoes">
                    {(dados.numeros?.vagas ?? 0) > 0 && <Link to="/vagas" className="sq-botao rg-contorno">VER VAGAS</Link>}
                    {(dados.numeros?.projetos_publicados ?? 0) > 0 && <Link to="/projetos" className="sq-botao rg-contorno">VER PROJETOS</Link>}
                    <button type="button" className="sq-botao sq-botao--preto rg-enviar" onClick={aoFechar}>FECHAR</button>
                </div>
            </div>
        </Dialogo>
    );
}

export default function Instituicoes() {
    const { usuario } = useAuth();
    const [itens, setItens] = useState(null);
    const [total, setTotal] = useState(0);
    const [erro, setErro] = useState("");
    const [tipos, setTipos] = useState([]);
    const [ordem, setOrdem] = useState("nome");
    const [busca, setBusca] = useState("");
    const [termo, setTermo] = useState("");
    const [aberta, setAberta] = useState(null);
    const [alvo, setAlvo] = useState(null);
    const [copiado, setCopiado] = useState(false);
    const espera = useRef(null);

    // A busca vai para a API depois de uma pausa na digitação.
    useEffect(() => {
        const id = setTimeout(() => setTermo(busca.trim()), 300);
        return () => clearTimeout(id);
    }, [busca]);

    // Um tipo marcado usa o filtro da API; vários tipos são filtrados aqui.
    const tipoApi = tipos.length === 1 ? tipos[0] : "";
    useEffect(() => {
        let ativo = true;
        setErro("");
        api(`/instituicoes${query({ tipo: tipoApi, q: termo, ordem, per_page: 100 })}`)
            .then((r) => {
                if (!ativo) return;
                setItens(lista(r));
                setTotal(r?.meta?.total ?? lista(r).length);
            })
            .catch((e) => {
                if (!ativo) return;
                setErro(e.message);
                setItens([]);
            });
        return () => {
            ativo = false;
        };
    }, [tipoApi, termo, ordem]);

    useEffect(() => () => clearTimeout(espera.current), []);

    const visiveis = useMemo(() => (itens ?? []).filter((i) => tipos.length < 2 || tipos.includes(i.tipo)), [itens, tipos]);
    const contagem = (t) => (itens ?? []).filter((i) => i.tipo === t).length;
    const alternar = (t) => setTipos((atual) => (atual.includes(t) ? atual.filter((x) => x !== t) : [...atual, t]));
    const somente = (t) => setTipos((atual) => (atual.length === 1 && atual[0] === t ? [] : [t]));
    const ehInstituicao = usuario && usuario.tipo_usuario !== "pessoa_fisica";

    const copiarConvite = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/cadastro/usuario`);
            setCopiado(true);
            clearTimeout(espera.current);
            espera.current = setTimeout(() => setCopiado(false), 2500);
        } catch {
            setCopiado(false);
        }
    };

    return (
        <div className="sq in">
            {/* Section 01 — título + texto e colunas de filtro */}
            <section className="sq-secao sq-topo">
                <div className="sq-topo__titulo" data-revelar>
                    <h1>Empresas e instituições.</h1>
                    <p>
                        Empresas, escolas, laboratórios e estabelecimentos com CNPJ conferido pela equipe do EcoHub 3D. Veja quem publica vagas,
                        compartilha projetos, abre chamados e produz filamento reciclado na rede.
                    </p>
                </div>

                <div className="sq-filtros" data-revelar style={{ "--atraso": "120ms" }}>
                    <div className="sq-filtros__coluna" role="group" aria-label="Tipo de instituição">
                        <p className="sq-rotulo">TIPO</p>
                        <OpcaoCaixa papel="checkbox" marcada={tipos.length === 0} aoMarcar={() => setTipos([])}>Todos os tipos</OpcaoCaixa>
                        {Object.entries(TIPOS).map(([valor, t]) => (
                            <OpcaoCaixa key={valor} papel="checkbox" marcada={tipos.includes(valor)} aoMarcar={() => alternar(valor)}>{t.rotulo}</OpcaoCaixa>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna" role="radiogroup" aria-label="Ordenar">
                        <p className="sq-rotulo">ORDENAR</p>
                        {ORDENS.map(([valor, rotulo]) => (
                            <OpcaoSeta key={valor} marcada={ordem === valor} aoMarcar={() => setOrdem(valor)}>{rotulo}</OpcaoSeta>
                        ))}
                    </div>
                    <div className="sq-filtros__coluna">
                        <label className="sq-rotulo" htmlFor="busca-instituicoes">BUSCAR</label>
                        <span className="sq-busca">
                            <Search size={14} aria-hidden="true" />
                            <input id="busca-instituicoes" type="search" placeholder="Nome da instituição" value={busca} onChange={(e) => setBusca(e.target.value)} />
                        </span>
                    </div>
                    <div className="sq-filtros__acoes">
                        <p className="sq-rotulo">{itens ? `${total} NO DIRETÓRIO` : "DIRETÓRIO"}</p>
                        {(tipos.length > 0 || busca) && (
                            <button type="button" className="sq-botao" onClick={() => { setTipos([]); setBusca(""); }}>LIMPAR FILTROS</button>
                        )}
                    </div>
                </div>
            </section>

            {/* Section 02 — linha de resultados */}
            <section className="sq-secao sq-resultados in-resultados" data-revelar="fade">
                <p aria-live="polite">
                    <strong>{itens ? visiveis.length : "—"} {visiveis.length === 1 ? "instituição verificada" : "instituições verificadas"}</strong>
                    {Object.entries(TIPOS).map(([valor, t], i) => (
                        <React.Fragment key={valor}>
                            {i > 0 && ", "}
                            <button type="button" className="sq-link" aria-pressed={tipos.length === 1 && tipos[0] === valor} onClick={() => somente(valor)}>
                                {t.rotulo}{tipos.length === 0 ? ` (${contagem(valor)})` : ""}
                            </button>
                        </React.Fragment>
                    ))}
                </p>
            </section>

            <div className="sq-secao in-conteudo">
                <RgErro>{erro}</RgErro>
                {itens === null && (
                    <div className="in-grade" aria-busy="true" aria-label="Carregando instituições">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="in-cartao">
                                <span className="esqueleto in-cartao__capa" />
                                <span className="esqueleto" style={{ height: 14, width: "65%" }} />
                                <span className="esqueleto" style={{ height: 12, width: "35%" }} />
                            </div>
                        ))}
                    </div>
                )}
                {itens !== null && visiveis.length === 0 && !erro && (
                    <Vazio icone={Inbox} titulo="Nenhuma instituição com esses filtros">Tente outro tipo ou limpe a busca.</Vazio>
                )}
                {visiveis.length > 0 && (
                    <div key={`${tipos.join()}-${ordem}-${termo}`} className="in-grade troca-suave">
                        {visiveis.map((inst, i) => (
                            <CartaoInstituicao key={inst.id} instituicao={inst} indice={i} aoAbrir={() => { setAlvo(inst); setAberta(inst.id); }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Section 04 — faixa preta com botão branco + passos */}
            <section className="sq-secao sq-faixa">
                <div className="sq-faixa__preta" data-revelar="esquerda">
                    <div>
                        <h2>Sua instituição ainda não está aqui?</h2>
                        <p>
                            {ehInstituicao && usuario.verificacao_status === "pendente"
                                ? "Seu cadastro está em análise. Assim que a equipe conferir o CNPJ, sua instituição aparece neste diretório."
                                : "Empresas, escolas, laboratórios e estabelecimentos criam uma conta com CNPJ. Depois da conferência pela moderação, aparecem aqui com o selo de verificada. Envie o link de cadastro para a instituição."}
                        </p>
                    </div>
                    <button type="button" className="sq-botao sq-botao--branco" onClick={copiarConvite} aria-live="polite">
                        {copiado ? <><Check size={16} aria-hidden="true" style={{ marginRight: 8 }} /> LINK COPIADO</> : <><Copy size={16} aria-hidden="true" style={{ marginRight: 8 }} /> COPIAR LINK DE CADASTRO</>}
                    </button>
                </div>
                <ol className="sq-faixa__passos" data-revelar="direita" style={{ "--atraso": "120ms" }}>
                    {[
                        ["01", "Cadastrar", "A instituição cria a conta escolhendo o tipo e informando o CNPJ (e o código INEP, para escolas)."],
                        ["02", "Verificar", "A moderação confere os dados na Receita Federal e aprova o cadastro."],
                        ["03", "Participar", "Verificada, ela publica vagas, abre chamados e aparece neste diretório."],
                    ].map(([n, titulo, texto], i) => (
                        <li key={n} style={{ "--i": i }}>
                            <span>{n}</span>
                            <strong>{titulo}</strong>
                            <p>{texto}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {alvo && <DetalheInstituicao key={alvo.id} id={alvo.id} resumo={alvo} aberto={aberta === alvo.id} aoFechar={() => setAberta(null)} />}
        </div>
    );
}
