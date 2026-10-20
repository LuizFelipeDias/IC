import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError, lista } from "../services/api";

/* ================================================================== *
 * Chamados (pedidos de escolas e empresas)
 *
 *   solicitante (escola/empresa): abre, acompanha, edita enquanto aberto e cancela
 *   prestador (laboratório/maker): vê os abertos, escolhe o local e aceita; conclui
 *   moderador: acompanha todos
 * ================================================================== */

const STATUS_ESTILO = {
    Aberto: "bg-brand/10 text-brand",
    "Em Atendimento": "bg-amber-100 text-amber-800",
    Resolvido: "bg-green-100 text-green-700",
    Cancelado: "bg-gray-100 text-gray-600",
};

const FORM_VAZIO = { titulo: "", tipo_servico: "", data_limite: "", cidade: "", uf: "", descricao: "" };

const classeInput =
    "w-full border-[1.5px] border-[#d1d1d1] px-3 py-2.5 text-[14px] outline-none focus:border-brand transition-colors bg-white";

const formatarData = (valor) => (valor ? new Date(valor).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—");

function StatusPill({ status }) {
    return (
        <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${STATUS_ESTILO[status] ?? "bg-gray-100"}`}>
            {status}
        </span>
    );
}

function Campo({ id, label, erro, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-[#858585]">
                {label}
            </label>
            {children}
            {erro && <span className="text-[12px] text-red-600">{erro}</span>}
        </div>
    );
}

function NovoChamado({ opcoes, onCriado, onCancelar }) {
    const [form, setForm] = useState(FORM_VAZIO);
    const [erros, setErros] = useState({});
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

    const enviar = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setErros({});
        setMensagem("");
        try {
            const criado = await api("/chamado", { method: "POST", body: form });
            onCriado(criado);
        } catch (erro) {
            if (erro instanceof ApiError && erro.status === 422) {
                setErros(Object.fromEntries(Object.entries(erro.erros).map(([campo, msgs]) => [campo, msgs[0]])));
            } else {
                setMensagem(erro.message);
            }
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form onSubmit={enviar} className="border-[1.5px] border-black p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-5" noValidate>
            <h2 className="md:col-span-2 text-[16px] font-black uppercase tracking-tight">Novo chamado</h2>

            <div className="md:col-span-2">
                <Campo id="titulo" label="Título *" erro={erros.titulo}>
                    <input id="titulo" className={classeInput} value={form.titulo} onChange={alterar("titulo")} maxLength={255} />
                </Campo>
            </div>
            <Campo id="tipo_servico" label="Tipo de serviço *" erro={erros.tipo_servico}>
                <select id="tipo_servico" className={classeInput} value={form.tipo_servico} onChange={alterar("tipo_servico")}>
                    <option value="">Selecione</option>
                    {opcoes.tipos_servico.map((tipo) => (
                        <option key={tipo.valor} value={tipo.valor}>
                            {tipo.rotulo}
                        </option>
                    ))}
                </select>
            </Campo>
            <Campo id="data_limite" label="Prazo desejado *" erro={erros.data_limite}>
                <input id="data_limite" type="date" className={classeInput} value={form.data_limite} onChange={alterar("data_limite")} />
            </Campo>
            <Campo id="cidade" label="Cidade" erro={erros.cidade}>
                <input id="cidade" className={classeInput} value={form.cidade} onChange={alterar("cidade")} maxLength={100} />
            </Campo>
            <Campo id="uf" label="UF" erro={erros.uf}>
                <input id="uf" className={classeInput} value={form.uf} onChange={alterar("uf")} maxLength={2} placeholder="PR" />
            </Campo>
            <div className="md:col-span-2">
                <Campo id="descricao" label="Descrição *" erro={erros.descricao}>
                    <textarea
                        id="descricao"
                        className={`${classeInput} min-h-[140px] resize-y`}
                        value={form.descricao}
                        onChange={alterar("descricao")}
                        placeholder="Público atendido, equipamentos disponíveis, o que precisa ser feito."
                    />
                </Campo>
            </div>

            {mensagem && (
                <p role="alert" className="md:col-span-2 text-[13px] text-red-600">
                    {mensagem}
                </p>
            )}

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                <button type="submit" disabled={enviando} className="flex-1 h-[48px] bg-brand text-white font-black text-[12px] uppercase tracking-[0.25em] hover:bg-black transition-colors disabled:opacity-60">
                    {enviando ? "Enviando..." : "Abrir chamado"}
                </button>
                <button type="button" onClick={onCancelar} className="h-[48px] px-6 border-[1.5px] border-black font-black text-[12px] uppercase tracking-[0.25em] hover:bg-black hover:text-white transition-colors">
                    Cancelar
                </button>
            </div>
        </form>
    );
}

function CartaoChamado({ chamado, usuario, pode, opcoes, onAtualizado, onRemovido }) {
    const [local, setLocal] = useState("");
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState("");

    const souSolicitante = chamado.id_usuario === usuario?.id;
    const souPrestador = chamado.id_prestador === usuario?.id;
    const aberto = chamado.status === "Aberto";
    const emAtendimento = chamado.status === "Em Atendimento";

    const executar = async (acao, opcoesRequisicao) => {
        setProcessando(true);
        setErro("");
        try {
            const resposta = await api(`/chamado/${chamado.id}/${acao}`, { method: "POST", ...opcoesRequisicao });
            onAtualizado(resposta);
        } catch (e) {
            setErro(e.message);
        } finally {
            setProcessando(false);
        }
    };

    const excluir = async () => {
        if (!window.confirm(`Excluir o chamado "${chamado.titulo}"?`)) return;
        try {
            await api(`/chamado/${chamado.id}`, { method: "DELETE" });
            onRemovido(chamado.id);
        } catch (e) {
            setErro(e.message);
        }
    };

    return (
        <article className="border border-[#e5e5e5] p-5 flex flex-col gap-3 hover:border-black transition-colors">
            <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={chamado.status} />
                {chamado.tipo_servico_rotulo && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#858585]">{chamado.tipo_servico_rotulo}</span>
                )}
                <span className="ml-auto text-[11px] text-[#858585]">Prazo: {formatarData(chamado.data_limite)}</span>
            </div>

            <h3 className="text-[16px] font-black">{chamado.titulo}</h3>
            <p className="text-[14px] text-[#444] whitespace-pre-line">{chamado.descricao}</p>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[12px] text-[#555]">
                <div>
                    <dt className="inline font-bold">Solicitante: </dt>
                    <dd className="inline">{chamado.usuario?.nome ?? "—"}</dd>
                </div>
                <div>
                    <dt className="inline font-bold">Local: </dt>
                    <dd className="inline">{[chamado.cidade, chamado.uf].filter(Boolean).join(" / ") || "—"}</dd>
                </div>
                {chamado.prestador && (
                    <>
                        <div>
                            <dt className="inline font-bold">Atendido por: </dt>
                            <dd className="inline">{chamado.prestador.nome}</dd>
                        </div>
                        <div>
                            <dt className="inline font-bold">Atendimento: </dt>
                            <dd className="inline">{chamado.local_atendimento_rotulo}</dd>
                        </div>
                    </>
                )}
                {chamado.contato && (
                    <div className="sm:col-span-2">
                        <dt className="inline font-bold">Contato: </dt>
                        <dd className="inline">
                            {souPrestador
                                ? `${chamado.contato.solicitante.email} · ${chamado.contato.solicitante.telefone}`
                                : `${chamado.contato.prestador.email} · ${chamado.contato.prestador.telefone}`}
                        </dd>
                    </div>
                )}
            </dl>

            {/* Ações do prestador: escolher o local e aceitar (só ele vê essas opções) */}
            {pode("prestador") && aberto && !souSolicitante && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#f0f0f0]">
                    <label htmlFor={`local-${chamado.id}`} className="sr-only">
                        Local de atendimento
                    </label>
                    <select id={`local-${chamado.id}`} className={`${classeInput} sm:max-w-xs`} value={local} onChange={(e) => setLocal(e.target.value)}>
                        <option value="">Onde você vai atender?</option>
                        {opcoes.locais_atendimento.map((opcao) => (
                            <option key={opcao.valor} value={opcao.valor}>
                                {opcao.rotulo}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        disabled={!local || processando}
                        onClick={() => executar("aceitar", { body: { local_atendimento: local } })}
                        className="h-[44px] px-6 bg-brand text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-colors disabled:opacity-50"
                    >
                        Aceitar chamado
                    </button>
                </div>
            )}

            {souPrestador && emAtendimento && (
                <div className="pt-2 border-t border-[#f0f0f0]">
                    <button type="button" disabled={processando} onClick={() => executar("concluir")} className="h-[44px] px-6 bg-black text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-green-700 transition-colors disabled:opacity-50">
                        Marcar como concluído
                    </button>
                </div>
            )}

            {/* Ações do solicitante */}
            {souSolicitante && (aberto || emAtendimento) && (
                <div className="flex gap-2 pt-2 border-t border-[#f0f0f0]">
                    <button type="button" disabled={processando} onClick={() => executar("cancelar")} className="h-[40px] px-5 border-[1.5px] border-black font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors">
                        Cancelar chamado
                    </button>
                    {aberto && (
                        <button type="button" onClick={excluir} className="h-[40px] px-5 text-red-600 font-black text-[11px] uppercase tracking-[0.2em] hover:underline">
                            Excluir
                        </button>
                    )}
                </div>
            )}

            {erro && (
                <p role="alert" className="text-[12px] text-red-600">
                    {erro}
                </p>
            )}
        </article>
    );
}

export default function Chamados() {
    const { usuario, pode } = useAuth();
    const [chamados, setChamados] = useState([]);
    const [opcoes, setOpcoes] = useState({ tipos_servico: [], locais_atendimento: [] });
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [mostrarForm, setMostrarForm] = useState(false);
    const [aba, setAba] = useState("todos");
    const [busca, setBusca] = useState("");

    const carregar = useCallback(async () => {
        try {
            const [respostaLista, respostaOpcoes] = await Promise.all([api("/chamado?per_page=100"), api("/chamado/opcoes")]);
            setChamados(lista(respostaLista));
            setOpcoes(respostaOpcoes);
        } catch (e) {
            setErro(e.message || "Não foi possível carregar os chamados.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const ehPrestador = pode("prestador");
    const abas = ehPrestador
        ? [
              { id: "todos", rotulo: "Todos" },
              { id: "disponiveis", rotulo: "Disponíveis" },
              { id: "meus", rotulo: "Meus atendimentos" },
          ]
        : [];

    const visiveis = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return chamados
            .filter((c) => aba !== "disponiveis" || c.status === "Aberto")
            .filter((c) => aba !== "meus" || c.id_prestador === usuario?.id)
            .filter((c) => !termo || c.titulo.toLowerCase().includes(termo) || (c.cidade ?? "").toLowerCase().includes(termo));
    }, [chamados, aba, busca, usuario]);

    const substituir = (atualizado) => setChamados((atual) => atual.map((c) => (c.id === atualizado.id ? atualizado : c)));

    return (
        <div className="flex flex-col min-h-screen bg-white font-['Inter',sans-serif]">
            <Navbar />

            <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#858585] mb-1 font-bold">
                            {pode("solicitante") ? "Pedidos da sua instituição" : ehPrestador ? "Demandas de escolas e empresas" : "Moderação"}
                        </p>
                        <h1 className="text-[28px] font-black uppercase tracking-tight">Chamados</h1>
                    </div>
                    {pode("solicitante") && !mostrarForm && (
                        <button type="button" onClick={() => setMostrarForm(true)} className="h-[48px] px-6 bg-brand text-white font-black text-[12px] uppercase tracking-[0.25em] hover:bg-black transition-colors">
                            + Novo chamado
                        </button>
                    )}
                </div>

                {mostrarForm && (
                    <NovoChamado
                        opcoes={opcoes}
                        onCancelar={() => setMostrarForm(false)}
                        onCriado={(novo) => {
                            setChamados((atual) => [{ ...novo, usuario }, ...atual]);
                            setMostrarForm(false);
                        }}
                    />
                )}

                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    {abas.length > 0 && (
                        <div className="flex border-[1.5px] border-[#d1d1d1] p-1 gap-1" role="tablist">
                            {abas.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={aba === item.id}
                                    onClick={() => setAba(item.id)}
                                    className={`px-4 h-[34px] text-[11px] font-black uppercase tracking-wider ${aba === item.id ? "bg-black text-white" : "text-[#858585] hover:text-black"}`}
                                >
                                    {item.rotulo}
                                </button>
                            ))}
                        </div>
                    )}
                    <label htmlFor="busca-chamados" className="sr-only">
                        Buscar
                    </label>
                    <input id="busca-chamados" className={`${classeInput} md:max-w-sm`} placeholder="Buscar por título ou cidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>

                {carregando && <p className="text-[11px] font-bold uppercase tracking-widest text-[#858585]">Carregando chamados...</p>}
                {erro && (
                    <p role="alert" className="text-[13px] text-red-600">
                        {erro}
                    </p>
                )}
                {!carregando && !erro && visiveis.length === 0 && (
                    <p className="text-[14px] text-[#858585] border border-dashed border-[#d1d1d1] p-10 text-center">
                        {pode("solicitante") ? "Você ainda não abriu nenhum chamado." : "Nenhum chamado por aqui no momento."}
                    </p>
                )}

                <div className="flex flex-col gap-4">
                    {visiveis.map((chamado) => (
                        <CartaoChamado
                            key={chamado.id}
                            chamado={chamado}
                            usuario={usuario}
                            pode={pode}
                            opcoes={opcoes}
                            onAtualizado={substituir}
                            onRemovido={(id) => setChamados((atual) => atual.filter((c) => c.id !== id))}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
