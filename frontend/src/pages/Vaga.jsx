import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../contexts/AuthContext";
import { api, lista } from "../services/api";

const ITEMS_PER_PAGE = 10;
const ROTA_CADASTRO = "/cadastro/vaga";


const Svg = ({ size = 20, children, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        {children}
    </svg>
);

const IconeBusca = (p) => (
    <Svg {...p}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
    </Svg>
);

const IconeAnterior = (p) => (
    <Svg {...p}>
        <path d="M15 18l-6-6 6-6" />
    </Svg>
);

const IconeProxima = (p) => (
    <Svg {...p}>
        <path d="M9 18l6-6-6-6" />
    </Svg>
);

const IconeFechar = (p) => (
    <Svg {...p}>
        <path d="M18 6L6 18M6 6l12 12" />
    </Svg>
);

const IconeMais = (p) => (
    <Svg {...p}>
        <path d="M12 5v14M5 12h14" />
    </Svg>
);

const IconeExcluir = (p) => (
    <Svg {...p}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
    </Svg>
);

const IconeLocal = (p) => (
    <Svg size={13} {...p}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
    </Svg>
);

/* ================================================================== *
 * Normalização — colunas reais do banco
 *   vagas:        id · id_usuario · titulo · tema · cep · cidade · texto
 *                 data_publicacao · created_at · updated_at
 *   candidaturas: id · id_usuario · id_vaga · status · data_candidatura
 * ================================================================== */

const formatarData = (valor) => {
    if (!valor) return null;
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("pt-BR");
};

function normalizarVaga(bruta) {
    return {
        id: bruta.id,
        titulo: bruta.titulo ?? "Vaga sem título",
        tema: bruta.tema ?? null,
        cep: bruta.cep ?? null,
        cidade: bruta.cidade ?? null,
        texto: bruta.texto ?? "",
        dataPublicacao: bruta.data_publicacao ?? bruta.created_at ?? null,
        idUsuario: bruta.id_usuario ?? null,
    };
}

const resumir = (texto, limite = 160) => (texto.length > limite ? `${texto.slice(0, limite).trimEnd()}...` : texto);

// cores por status, conforme os valores gravados na coluna status
const TOM_STATUS = {
    "em análise": "cinza",
    aprovada: "roxo",
    reprovada: "cinza",
    cancelada: "cinza",
};

/* ================================================================== *
 * Perfil do usuário — CPF → candidato · CNPJ → empregador
 * ================================================================== */

function identificarPerfil(usuario) {
    if (!usuario) return null;

    const tipo = String(usuario.tipo ?? usuario.perfil ?? "").toLowerCase();
    if (tipo.includes("empreg") || tipo.includes("empresa") || tipo === "cnpj") return "empregador";
    if (tipo.includes("candidat") || tipo === "cpf") return "candidato";

    if (usuario.cnpj) return "empregador";
    if (usuario.cpf) return "candidato";

    const documento = String(usuario.documento ?? usuario.cpf_cnpj ?? "").replace(/\D/g, "");
    if (documento.length === 14) return "empregador";
    if (documento.length === 11) return "candidato";

    return "candidato";
}

function useUsuario() {
    const { usuario, carregando } = useAuth();

    return { usuario, perfil: useMemo(() => identificarPerfil(usuario), [usuario]), carregando };
}

/* ================================================================== *
 * UI compartilhada
 * ================================================================== */

function Badge({ children, tom = "preto" }) {
    const estilos = {
        preto: "bg-black text-white",
        roxo: "bg-[#3800df] text-white",
        cinza: "border border-[#e5e7eb] text-[#858585]",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap ${estilos[tom]}`}>
            {children}
        </span>
    );
}

function usePagination(items, perPage = ITEMS_PER_PAGE) {
    const [page, setPage] = useState(1);
    const total = Math.ceil(items.length / perPage) || 1;

    useEffect(() => {
        if (page > total) setPage(1);
    }, [page, total]);

    return { page, total, slice: items.slice((page - 1) * perPage, page * perPage), setPage };
}

function Paginator({ page, total, setPage }) {
    return (
        <div className="flex items-center justify-between pt-3 border-t border-[#e5e7eb] mt-2">
            <span className="text-[11px] text-[#858585] tracking-widest uppercase font-bold">
                Página <strong className="text-black">{page}</strong> de {total}
            </span>
            <div className="flex gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} aria-label="Página anterior" className="p-1 disabled:opacity-30 hover:text-[#3800df] transition-colors text-black">
                    <IconeAnterior />
                </button>
                <button onClick={() => setPage(Math.min(total, page + 1))} disabled={page === total} aria-label="Próxima página" className="p-1 disabled:opacity-30 hover:text-[#3800df] transition-colors text-black">
                    <IconeProxima />
                </button>
            </div>
        </div>
    );
}

const EstadoVazio = ({ titulo, descricao }) => (
    <div className="px-5 py-12 text-center">
        <p className="text-sm font-black uppercase tracking-wide text-black">{titulo}</p>
        <p className="text-sm text-[#858585] font-medium mt-1">{descricao}</p>
    </div>
);

const Carregando = ({ texto = "Carregando..." }) => (
    <div className="px-5 py-16 text-center text-[#858585] text-xs font-black tracking-[0.2em] uppercase">{texto}</div>
);

const Local = ({ vaga }) => {
    if (!vaga.cidade) return null;
    return (
        <span className="inline-flex items-center gap-1">
            <IconeLocal /> {vaga.cidade}
        </span>
    );
};

/* ================================================================== *
 * Modal de candidatura → POST /api/candidatura
 * O usuário e o status vêm do servidor: o front envia só a vaga.
 * ================================================================== */

function ApplyModal({ vaga, onClose, onEnviada }) {
    const [step, setStep] = useState("form");
    const [status, setStatus] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState(null);

    const enviar = async () => {
        setEnviando(true);
        setErro(null);
        try {
            const criada = await api("/candidatura", { method: "POST", body: { id_vaga: vaga.id } });
            const statusRetornado = criada?.status ?? "Em análise";
            setStatus(statusRetornado);
            onEnviada?.(vaga.id, statusRetornado);
            setStep("success");
        } catch (e) {
            setErro(e.message || "Não foi possível enviar a candidatura.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-['Inter',sans-serif]" onClick={onClose}>
            <div className="bg-white w-full max-w-lg border border-[#e5e7eb] p-6 md:p-8 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-[#858585] hover:text-black transition-colors">
                    <IconeFechar />
                </button>

                {step === "form" ? (
                    <>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#858585] mb-1 font-bold">Candidatar-se</p>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide mb-2 text-black">{vaga.titulo}</h2>

                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            {vaga.tema && <Badge tom="preto">{vaga.tema}</Badge>}
                            {vaga.cidade && <Badge tom="cinza">{vaga.cidade}</Badge>}
                        </div>

                        <p className="text-sm text-[#3a3a3a] font-medium whitespace-pre-line leading-relaxed border-t border-[#e5e7eb] pt-5">
                            {vaga.texto}
                        </p>

                        {erro && <p className="mt-4 text-xs font-bold text-[#c62828]">{erro}</p>}

                        <button onClick={enviar} disabled={enviando} className="mt-6 w-full bg-[#3800df] text-white py-3 text-xs tracking-[0.2em] uppercase font-black hover:bg-black transition-colors disabled:opacity-50">
                            {enviando ? "Enviando..." : "Confirmar candidatura"}
                        </button>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 border-2 border-black flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl font-black text-black">✓</span>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-wide mb-2 text-black">Candidatura registrada</h3>
                        <p className="text-sm text-[#858585] mb-4 font-medium">
                            Sua candidatura para <strong>{vaga.titulo}</strong> foi enviada.
                        </p>
                        <div className="mb-6 flex justify-center">
                            <Badge tom={TOM_STATUS[String(status).toLowerCase()] ?? "cinza"}>{status}</Badge>
                        </div>
                        <button onClick={onClose} className="border border-black text-black px-8 py-2.5 text-xs font-black tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors">
                            Fechar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ================================================================== *
 * Candidato (CPF) — todas as vagas publicadas
 * ================================================================== */

function CandidatoView() {
    const [vagas, setVagas] = useState([]);
    const [minhasCandidaturas, setMinhasCandidaturas] = useState(new Map()); // id_vaga → status
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [search, setSearch] = useState("");
    const [temaFiltro, setTemaFiltro] = useState("TODOS");
    const [selecionada, setSelecionada] = useState(null);

    useEffect(() => {
        let ativo = true;

        (async () => {
            try {
                const resposta = await api("/vaga?per_page=100");
                if (ativo) setVagas(lista(resposta).map(normalizarVaga));
            } catch {
                if (ativo) setErro("Não foi possível carregar as vagas.");
            } finally {
                if (ativo) setCarregando(false);
            }
        })();

        // GET /candidatura já vem filtrado pelo usuário do token
        (async () => {
            try {
                const resposta = await api("/candidatura");
                const mapa = new Map(lista(resposta).map((c) => [String(c.id_vaga), c.status ?? "Em análise"]));
                if (ativo) setMinhasCandidaturas(mapa);
            } catch (e) {
                console.warn("Candidaturas anteriores não carregadas:", e);
            }
        })();

        return () => {
            ativo = false;
        };
    }, []);

    // os filtros saem dos temas existentes no banco
    const temas = useMemo(() => {
        const unicos = [...new Set(vagas.map((v) => v.tema).filter(Boolean))].sort();
        return ["TODOS", ...unicos];
    }, [vagas]);

    const filtradas = useMemo(() => {
        const termo = search.toLowerCase().trim();
        return vagas.filter((v) => {
            if (temaFiltro !== "TODOS" && v.tema !== temaFiltro) return false;
            if (!termo) return true;
            return (
                v.titulo.toLowerCase().includes(termo) ||
                String(v.tema ?? "").toLowerCase().includes(termo) ||
                String(v.cidade ?? "").toLowerCase().includes(termo) ||
                v.texto.toLowerCase().includes(termo)
            );
        });
    }, [vagas, search, temaFiltro]);

    const { page, total, slice, setPage } = usePagination(filtradas);

    return (
        <>
            {selecionada && (
                <ApplyModal
                    vaga={selecionada}
                    onClose={() => setSelecionada(null)}
                    onEnviada={(id, status) => setMinhasCandidaturas((m) => new Map(m).set(String(id), status))}
                />
            )}

            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-6 md:mb-10">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#858585] mb-2">Oportunidades disponíveis</p>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-black">Vagas abertas</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858585]">
                            <IconeBusca size={18} />
                        </span>
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full border border-[#e5e7eb] bg-white pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#3800df] transition-colors text-black"
                            placeholder="Buscar por título, tema ou cidade..."
                        />
                    </div>

                    {temas.length > 1 && (
                        <div className="flex flex-wrap gap-1">
                            {temas.slice(0, 5).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setTemaFiltro(t);
                                        setPage(1);
                                    }}
                                    className={`px-3 py-2 text-[10px] tracking-widest uppercase font-black border transition-colors flex-1 sm:flex-none ${
                                        temaFiltro === t
                                            ? "bg-black text-white border-black"
                                            : "border-[#e5e7eb] text-[#858585] hover:border-black hover:text-black"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border border-[#e5e7eb]">
                    {carregando ? (
                        <Carregando texto="Carregando vagas" />
                    ) : erro ? (
                        <EstadoVazio titulo="Falha ao carregar" descricao={erro} />
                    ) : slice.length === 0 ? (
                        <EstadoVazio titulo="Nenhuma vaga encontrada" descricao="Ajuste a busca ou o filtro de tema." />
                    ) : (
                        slice.map((vaga, i) => {
                            const statusCandidatura = minhasCandidaturas.get(String(vaga.id));
                            return (
                                <div
                                    key={vaga.id}
                                    className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-4 sm:px-5 py-4 ${i < slice.length - 1 ? "border-b border-[#e5e7eb]" : ""} hover:bg-[#f9f9f9] transition-colors`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-black tracking-wide text-black">{vaga.titulo}</p>
                                            {vaga.tema && <Badge tom="preto">{vaga.tema}</Badge>}
                                        </div>
                                        <p className="text-xs text-[#858585] font-medium mt-1 flex flex-wrap items-center gap-x-2">
                                            <Local vaga={vaga} />
                                            {vaga.dataPublicacao && <span>· {formatarData(vaga.dataPublicacao)}</span>}
                                        </p>
                                        {vaga.texto && <p className="text-xs text-[#6b6b6b] font-medium mt-1.5 leading-relaxed">{resumir(vaga.texto)}</p>}
                                    </div>

                                    {statusCandidatura ? (
                                        <div className="w-full sm:w-auto shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#858585]">Candidatura</span>
                                            <Badge tom={TOM_STATUS[statusCandidatura.toLowerCase()] ?? "cinza"}>{statusCandidatura}</Badge>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSelecionada(vaga)}
                                            className="w-full sm:w-auto shrink-0 px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-black border border-black text-black hover:bg-black hover:text-white transition-colors"
                                        >
                                            Ver e candidatar
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {!carregando && !erro && filtradas.length > 0 && (
                    <div className="mt-3">
                        <Paginator page={page} total={total} setPage={setPage} />
                    </div>
                )}
            </div>
        </>
    );
}

/* ================================================================== *
 * Empregador (CNPJ) — GET /vaga/minhas (filtro feito no servidor)
 * ================================================================== */

function EmpregadorView({ usuario }) {
    const navigate = useNavigate();
    const [vagas, setVagas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [busca, setBusca] = useState("");

    const carregar = useCallback(async () => {
        try {
            const resposta = await api("/vaga/minhas?per_page=100");
            setVagas(lista(resposta).map(normalizarVaga));
        } catch {
            setErro("Não foi possível carregar suas vagas.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const excluir = async (vaga) => {
        if (!window.confirm(`Excluir a vaga "${vaga.titulo}"? As candidaturas recebidas também serão apagadas.`)) return;
        try {
            await api(`/vaga/${vaga.id}`, { method: "DELETE" });
            setVagas((v) => v.filter((item) => item.id !== vaga.id));
        } catch (e) {
            window.alert(e.message || "Não foi possível excluir a vaga.");
        }
    };

    const filtradas = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        if (!termo) return vagas;
        return vagas.filter((v) => v.titulo.toLowerCase().includes(termo) || String(v.tema ?? "").toLowerCase().includes(termo));
    }, [vagas, busca]);

    const { page, total, slice, setPage } = usePagination(filtradas);

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#858585] mb-1 font-bold">
                        {usuario?.nome ? `Painel · ${usuario.nome}` : "Painel do empregador"}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-black">Suas vagas</h2>
                </div>
                <button
                    onClick={() => navigate(ROTA_CADASTRO)}
                    className="flex items-center justify-center w-full sm:w-auto gap-2 bg-[#3800df] text-white px-5 py-3 text-xs tracking-[0.2em] uppercase font-black hover:bg-black transition-colors"
                >
                    <IconeMais size={18} /> Cadastrar vaga
                </button>
            </div>

            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs tracking-[0.2em] uppercase font-black text-[#3800df]">Vagas publicadas</h3>
                <span className="text-[11px] text-[#858585] font-bold">{filtradas.length} vagas</span>
            </div>

            <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858585]">
                    <IconeBusca size={16} />
                </span>
                <input
                    value={busca}
                    onChange={(e) => {
                        setBusca(e.target.value);
                        setPage(1);
                    }}
                    className="w-full border border-[#e5e7eb] bg-white pl-9 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#3800df] transition-colors text-black"
                    placeholder="Filtrar por título ou tema..."
                />
            </div>

            <div className="border border-[#e5e7eb]">
                {carregando ? (
                    <Carregando texto="Carregando suas vagas" />
                ) : erro ? (
                    <EstadoVazio titulo="Falha ao carregar" descricao={erro} />
                ) : slice.length === 0 ? (
                    <EstadoVazio titulo="Nenhuma vaga publicada" descricao="Cadastre uma vaga para começar a receber candidaturas." />
                ) : (
                    slice.map((vaga, i) => (
                        <div
                            key={vaga.id}
                            className={`flex items-center gap-3 px-4 sm:px-5 py-4 ${i < slice.length - 1 ? "border-b border-[#e5e7eb]" : ""} hover:bg-[#f9f9f9] transition-colors`}
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-black truncate text-black">{vaga.titulo}</p>
                                    {vaga.tema && <Badge tom="cinza">{vaga.tema}</Badge>}
                                </div>
                                <p className="text-[11px] text-[#858585] font-medium mt-1 flex flex-wrap items-center gap-x-2">
                                    <Local vaga={vaga} />
                                    {vaga.dataPublicacao && <span>· publicada em {formatarData(vaga.dataPublicacao)}</span>}
                                </p>
                            </div>
                            <button
                                onClick={() => excluir(vaga)}
                                aria-label={`Excluir a vaga ${vaga.titulo}`}
                                className="shrink-0 text-[#858585] hover:text-[#c62828] transition-colors"
                            >
                                <IconeExcluir />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {!carregando && !erro && filtradas.length > 0 && (
                <div className="mt-3">
                    <Paginator page={page} total={total} setPage={setPage} />
                </div>
            )}
        </div>
    );
}

/* ================================================================== *
 * Página
 * ================================================================== */

export default function Vaga() {
    const { usuario, perfil, carregando } = useUsuario();

    return (
        <div className="min-h-screen bg-white text-black flex flex-col font-['Inter',sans-serif]">
            <Navbar />

            <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-8 py-10 md:py-16">
                {carregando ? (
                    <Carregando texto="Carregando seu painel" />
                ) : perfil === "empregador" ? (
                    <EmpregadorView usuario={usuario} />
                ) : (
                    <CandidatoView />
                )}
            </main>

            <Footer />
        </div>
    );
}