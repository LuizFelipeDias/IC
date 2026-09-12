import React, { useState, useMemo } from "react";
import {
    Search as SearchIcon,
    Add as Plus,
    KeyboardArrowDown as ChevronDown,
    Close as X,
    ArrowBack as ArrowLeft,
    ArrowForward as ArrowRight
} from "@mui/icons-material";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CHAMADOS_DATA = [
    { id:"c1",  num:"#2401", quemChamou:"Ana Souza",      avatarChamou:"AS", onde:"Filial SP – Sala 3",    quemAtende:"Carlos Lima",    avatarAtende:"CL", urgencia:"Crítica",  status:"Em Atendimento", data:"17/07/2025", desc:"Servidor de produção fora do ar. Toda a equipe de vendas sem acesso ao sistema." },
    { id:"c2",  num:"#2400", quemChamou:"Bruno Ferreira", avatarChamou:"BF", onde:"HQ – TI Andar 8",       quemAtende:"Juliana Paz",    avatarAtende:"JP", urgencia:"Alta",     status:"Em Atendimento", data:"17/07/2025", desc:"Falha no backup automático. Última cópia bem-sucedida foi há 4 dias." },
    { id:"c3",  num:"#2399", quemChamou:"Carla Mendes",   avatarChamou:"CM", onde:"Filial RJ – Recepção",  quemAtende:null,             urgencia:"Média",    status:"Aberto",         data:"16/07/2025", desc:"Impressora de recepção não reconhece os cartuchos após substituição." },
    { id:"c4",  num:"#2398", quemChamou:"Diego Alves",    avatarChamou:"DA", onde:"HQ – Financeiro",       quemAtende:"Marcos Braga",   avatarAtende:"MB", urgencia:"Crítica",  status:"Em Atendimento", data:"16/07/2025", desc:"ERP retornando erro 500 ao gerar relatórios de fechamento mensal." },
    { id:"c5",  num:"#2397", quemChamou:"Elisa Ramos",    avatarChamou:"ER", onde:"Remoto",                quemAtende:"Carlos Lima",    avatarAtende:"CL", urgencia:"Baixa",    status:"Resolvido",      data:"15/07/2025", desc:"Solicitação de acesso ao novo repositório do projeto Alpha." },
    { id:"c6",  num:"#2396", quemChamou:"Fernando Costa", avatarChamou:"FC", onde:"Filial MG – Lab",       quemAtende:"Patrícia Nunes", avatarAtende:"PN", urgencia:"Alta",     status:"Resolvido",      data:"15/07/2025", desc:"VPN bloqueando acesso ao ambiente de staging após atualização." },
    { id:"c7",  num:"#2395", quemChamou:"Gabi Lopes",     avatarChamou:"GL", onde:"HQ – Marketing",        quemAtende:null,             urgencia:"Média",    status:"Aberto",         data:"14/07/2025", desc:"Licença do Adobe Creative Cloud expirada para 3 usuários do setor." },
    { id:"c8",  num:"#2394", quemChamou:"Henrique Melo",  avatarChamou:"HM", onde:"HQ – Jurídico",         quemAtende:"Juliana Paz",    avatarAtende:"JP", urgencia:"Alta",     status:"Em Atendimento", data:"14/07/2025", desc:"Sistema de assinatura digital não envia e-mail de confirmação." },
    { id:"c9",  num:"#2393", quemChamou:"Isabela Teixeira",avatarChamou:"IT",onde:"Filial SP – Depósito",  quemAtende:"Marcos Braga",   avatarAtende:"MB", urgencia:"Média",    status:"Resolvido",      data:"13/07/2025", desc:"Leitor de código de barras desconfigurado após queda de energia." },
    { id:"c10", num:"#2392", quemChamou:"João Pinheiro",  avatarChamou:"JP", onde:"Remoto",                quemAtende:null,             urgencia:"Baixa",    status:"Cancelado",      data:"13/07/2025", desc:"Pedido de novo monitor cancelado — compra aprovada via outro canal." },
    { id:"c11", num:"#2391", quemChamou:"Karla Barbosa",  avatarChamou:"KB", onde:"HQ – RH",               quemAtende:"Patrícia Nunes", avatarAtende:"PN", urgencia:"Alta",     status:"Resolvido",      data:"12/07/2025", desc:"Portal de benefícios sem carregamento de dados para novos colaboradores." },
    { id:"c12", num:"#2390", quemChamou:"Lucas Vieira",   avatarChamou:"LV", onde:"Filial RS – Logística", quemAtende:null,             urgencia:"Crítica",  status:"Aberto",         data:"12/07/2025", desc:"Sistema de roteirização parado. 40 entregas pendentes de despacho." },
    { id:"c13", num:"#2389", quemChamou:"Mariana Duarte", avatarChamou:"MD", onde:"HQ – Comercial",        quemAtende:"Carlos Lima",    avatarAtende:"CL", urgencia:"Média",    status:"Em Atendimento", data:"11/07/2025", desc:"CRM não sincronizando dados com planilha de forecast do diretoria." },
    { id:"c14", num:"#2388", quemChamou:"Natan Rocha",    avatarChamou:"NR", onde:"Filial PR – Escritório", quemAtende:"Juliana Paz",   avatarAtende:"JP", urgencia:"Baixa",    status:"Resolvido",      data:"11/07/2025", desc:"Configuração de e-mail corporativo em novo notebook do colaborador." },
    { id:"c15", num:"#2387", quemChamou:"Olívia Santos",  avatarChamou:"OS", onde:"HQ – Diretoria",        quemAtende:"Marcos Braga",   avatarAtende:"MB", urgencia:"Crítica",  status:"Resolvido",      data:"10/07/2025", desc:"Projetor da sala de reunião da presidência sem sinal de vídeo." },
    { id:"c16", num:"#2386", quemChamou:"Pedro Guimarães",avatarChamou:"PG", onde:"Remoto",                quemAtende:null,             urgencia:"Média",    status:"Aberto",         data:"10/07/2025", desc:"Acesso à VPN instável durante videoconferências. Desconexões frequentes." },
    { id:"c17", num:"#2385", quemChamou:"Rafaela Cunha",  avatarChamou:"RC", onde:"Filial SP – Atendimento",quemAtende:"Patrícia Nunes",avatarAtende:"PN", urgencia:"Alta",     status:"Resolvido",      data:"09/07/2025", desc:"Telefonia VoIP com eco e latência alta após troca de roteador." },
    { id:"c18", num:"#2384", quemChamou:"Samuel Faria",   avatarChamou:"SF", onde:"HQ – TI Andar 8",       quemAtende:"Carlos Lima",    avatarAtende:"CL", urgencia:"Baixa",    status:"Cancelado",      data:"09/07/2025", desc:"Instalação de software duplicado — usuário resolveu via self-service." },
];

// ─── STYLE MAPS ───────────────────────────────────────────────────────────────

const URG_STYLE = {
    Crítica: { pill: "bg-red-50 text-red-700", dot: "bg-red-600" },
    Alta:    { pill: "bg-orange-50 text-orange-700", dot: "bg-orange-600" },
    Média:   { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    Baixa:   { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
};

const ST_STYLE = {
    "Aberto":         { pill: "bg-[#3800df]/10 text-[#3800df]",  dot: "bg-[#3800df]" },
    "Em Atendimento": { pill: "bg-green-100 text-green-700", dot: "bg-green-600" },
    "Resolvido":      { pill: "bg-green-100 text-green-700", dot: "bg-green-600" },
    "Cancelado":      { pill: "bg-red-100 text-red-700",     dot: "bg-red-600" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Avatar({ initials, size = "sm" }) {
    const colors = {
        A:"bg-blue-100 text-blue-700", B:"bg-purple-100 text-purple-700",
        C:"bg-green-100 text-green-700", D:"bg-orange-100 text-orange-700",
        E:"bg-pink-100 text-pink-700", F:"bg-teal-100 text-teal-700",
        G:"bg-indigo-100 text-indigo-700", H:"bg-red-100 text-red-700",
        I:"bg-amber-100 text-amber-700", J:"bg-cyan-100 text-cyan-700",
        K:"bg-lime-100 text-lime-700", L:"bg-violet-100 text-violet-700",
        M:"bg-fuchsia-100 text-fuchsia-700", N:"bg-emerald-100 text-emerald-700",
        O:"bg-sky-100 text-sky-700", P:"bg-rose-100 text-rose-700",
        R:"bg-blue-100 text-blue-700", S:"bg-slate-100 text-slate-700",
    };
    const cl = colors[initials[0]] ?? "bg-gray-100 text-gray-700";
    const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-[12px]";
    return (
        <div className={`${dim} ${cl} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
}

function UrgPill({ u }) {
    const s = URG_STYLE[u];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase ${s.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
            {u}
        </span>
    );
}

function StatusPill({ st }) {
    const s = ST_STYLE[st];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase ${s.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
            {st}
        </span>
    );
}

// ─── NEW TICKET MODAL ─────────────────────────────────────────────────────────

function NovoChamadoModal({ onClose }) {
    const [done, setDone] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-['Inter',sans-serif]" onClick={onClose}>
            <div className="bg-white rounded-xl border border-[#e5e7eb] w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
                    <div>
                        <p className="text-[10px] text-[#858585] font-black uppercase tracking-widest">Sistema de Chamados</p>
                        <h2 className="text-[18px] font-black text-black uppercase mt-1">Abrir Novo Chamado</h2>
                    </div>
                    <button onClick={onClose} className="text-[#858585] hover:text-black transition-colors p-1">
                        <X sx={{ fontSize: 20 }} />
                    </button>
                </div>

                {!done ? (
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-black text-[#858585] uppercase tracking-wide mb-1.5">Quem Chamou</label>
                                <input className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-[13px] text-black font-medium focus:outline-none focus:border-[#3800df] transition-colors bg-white" placeholder="Nome do solicitante" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-[#858585] uppercase tracking-wide mb-1.5">Onde</label>
                                <input className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-[13px] text-black font-medium focus:outline-none focus:border-[#3800df] transition-colors bg-white" placeholder="Local / filial" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-black text-[#858585] uppercase tracking-wide mb-1.5">Quem Irá Atender</label>
                                <select className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-[13px] text-black font-medium focus:outline-none focus:border-[#3800df] transition-colors bg-white">
                                    <option value="">— Não atribuído —</option>
                                    <option>Carlos Lima</option>
                                    <option>Juliana Paz</option>
                                    <option>Marcos Braga</option>
                                    <option>Patrícia Nunes</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-[#858585] uppercase tracking-wide mb-1.5">Urgência</label>
                                <select defaultValue="Média" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-[13px] text-black font-medium focus:outline-none focus:border-[#3800df] transition-colors bg-white">
                                    <option>Crítica</option>
                                    <option>Alta</option>
                                    <option value="Média">Média</option>
                                    <option>Baixa</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-[#858585] uppercase tracking-wide mb-1.5">Descrição do Problema</label>
                            <textarea rows={4} className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-[13px] text-black font-medium focus:outline-none focus:border-[#3800df] transition-colors bg-white resize-none" placeholder="Descreva o problema em detalhes..." />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button onClick={() => setDone(true)} className="flex-1 bg-[#3800df] hover:bg-black text-white rounded-lg py-3 text-[11px] tracking-widest uppercase font-black transition-colors flex items-center justify-center gap-2">
                                <Plus sx={{ fontSize: 18 }} /> Abrir Chamado
                            </button>
                            <button onClick={onClose} className="px-6 py-3 sm:py-0 border border-[#e5e7eb] rounded-lg text-[11px] tracking-widest uppercase font-black text-[#858585] hover:border-black hover:text-black transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                            </div>
                        </div>
                        <h3 className="text-[18px] font-black uppercase tracking-wide text-black mb-2">Chamado Aberto!</h3>
                        <p className="text-[13px] font-medium text-[#858585] mb-6">Seu chamado foi registrado e a equipe de suporte foi notificada.</p>
                        <button onClick={onClose} className="border border-black rounded-lg px-8 py-2.5 text-[11px] font-black tracking-widest uppercase text-black hover:bg-black hover:text-white transition-colors">
                            Fechar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────

function DetalheModal({ c, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-['Inter',sans-serif]" onClick={onClose}>
            <div className="bg-white rounded-xl border border-[#e5e7eb] w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
                    <div className="flex items-center gap-3">
                        <span className="text-[14px] font-black text-[#3800df]">{c.num}</span>
                        <StatusPill st={c.status} />
                    </div>
                    <button onClick={onClose} className="text-[#858585] hover:text-black transition-colors">
                        <X sx={{ fontSize: 20 }} />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <p className="text-[11px] font-black text-[#858585] uppercase tracking-widest mb-1">Descrição</p>
                        <p className="text-[13px] font-medium text-black leading-relaxed">{c.desc}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg p-4">
                            <p className="text-[10px] font-black text-[#858585] uppercase tracking-widest mb-2">Quem Chamou</p>
                            <div className="flex items-center gap-2">
                                <Avatar initials={c.avatarChamou} />
                                <span className="text-[12px] font-black uppercase text-black">{c.quemChamou}</span>
                            </div>
                        </div>
                        <div className="bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg p-4">
                            <p className="text-[10px] font-black text-[#858585] uppercase tracking-widest mb-2">Quem Atende</p>
                            {c.quemAtende ? (
                                <div className="flex items-center gap-2">
                                    <Avatar initials={c.avatarAtende} />
                                    <span className="text-[12px] font-black uppercase text-black">{c.quemAtende}</span>
                                </div>
                            ) : (
                                <span className="text-[12px] font-bold text-[#858585] italic">Não atribuído</span>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg p-3">
                            <p className="text-[10px] font-black text-[#858585] uppercase tracking-widest mb-1.5">Onde</p>
                            <p className="text-[12px] font-bold text-black">{c.onde}</p>
                        </div>
                        <div className="bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg p-3">
                            <p className="text-[10px] font-black text-[#858585] uppercase tracking-widest mb-2">Urgência</p>
                            <UrgPill u={c.urgencia} />
                        </div>
                        <div className="bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg p-3">
                            <p className="text-[10px] font-black text-[#858585] uppercase tracking-widest mb-1.5">Data</p>
                            <p className="text-[12px] font-bold text-black">{c.data}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────

function Pagination({ page, total, perPage, setPage }) {
    const totalPages = Math.ceil(total / perPage);
    const vis = 3;
    let start = Math.max(0, page - Math.floor(vis / 2));
    let end = Math.min(totalPages, start + vis);
    if (end - start < vis) start = Math.max(0, end - vis);

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-black text-[#858585] hover:bg-black hover:text-white disabled:opacity-40 transition-colors uppercase tracking-widest">
                <ArrowLeft sx={{ fontSize: 14 }} />
            </button>
            <div className="flex items-center gap-1 hidden sm:flex">
                {Array.from({ length: end - start }, (_, i) => start + i).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                            className={`w-7 h-7 rounded flex items-center justify-center text-[11px] font-black transition-colors ${
                                page === p ? "bg-[#3800df] text-white" : "text-[#858585] hover:bg-[#e5e7eb]"
                            }`}>
                        {p + 1}
                    </button>
                ))}
                {end < totalPages && (
                    <>
                        <span className="text-[#858585] px-1 text-[11px] font-bold">...</span>
                        <button onClick={() => setPage(totalPages - 1)}
                                className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-black text-[#858585] hover:bg-[#e5e7eb] transition-colors">
                            {totalPages}
                        </button>
                    </>
                )}
            </div>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-black text-[#858585] hover:bg-black hover:text-white disabled:opacity-40 transition-colors uppercase tracking-widest">
                <ArrowRight sx={{ fontSize: 14 }} />
            </button>
        </div>
    );
}

// ─── WAVE BG DECORATION ───────────────────────────────────────────────────────

function WaveBg() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <svg className="absolute -left-32 -top-32 opacity-[0.03] w-[700px] h-[700px]" viewBox="0 0 700 700" fill="none">
                {[80,140,200,260,320,380,440,500].map((r, i) => (
                    <circle key={i} cx="350" cy="350" r={r} stroke="#3800df" strokeWidth="2" fill="none" />
                ))}
            </svg>
            <svg className="absolute -right-20 -bottom-20 opacity-[0.02] w-[500px] h-[500px]" viewBox="0 0 500 500" fill="none">
                {[60,110,160,210,260,310].map((r, i) => (
                    <circle key={i} cx="250" cy="250" r={r} stroke="#3800df" strokeWidth="2" fill="none" />
                ))}
            </svg>
        </div>
    );
}

// ─── SORT HEADER CELL ─────────────────────────────────────────────────────────

function SortTh({ label, col, sortCol, sortDir, onClick }) {
    const active = sortCol === col;
    return (
        <th className="text-left px-4 py-3 whitespace-nowrap">
            <button onClick={() => onClick(col)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#858585] hover:text-[#3800df] transition-colors">
                {label}
                <ChevronDown sx={{ fontSize: 14 }} className={`transition-transform ${active && sortDir === "asc" ? "rotate-180" : ""} ${active ? "text-[#3800df]" : "text-[#d1d1d1]"}`} />
            </button>
        </th>
    );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

const FILTERS = ["Todos", "Aberto", "Em Atendimento", "Resolvido", "Cancelado"];
const PER_PAGE = 8;

export default function ChamadosApp() {
    const [search, setSearch]       = useState("");
    const [filter, setFilter]       = useState("Todos");
    const [urgFilter, setUrgFilter] = useState("Todos");
    const [page, setPage]           = useState(0);
    const [showNovo, setShowNovo]   = useState(false);
    const [detail, setDetail]       = useState(null);
    const [sortCol, setSortCol]     = useState("num");
    const [sortDir, setSortDir]     = useState("desc");

    const handleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortCol(col); setSortDir("asc"); }
        setPage(0);
    };

    const filtered = useMemo(() => {
        let list = CHAMADOS_DATA.filter(c => {
            const q = search.toLowerCase();
            const matchSearch = !q || c.num.includes(q) || c.quemChamou.toLowerCase().includes(q)
                || c.onde.toLowerCase().includes(q) || (c.quemAtende?.toLowerCase().includes(q) ?? false);
            const matchSt  = filter === "Todos" || c.status === filter;
            const matchUrg = urgFilter === "Todos" || c.urgencia === urgFilter;
            return matchSearch && matchSt && matchUrg;
        });
        list = [...list].sort((a, b) => {
            let va = "", vb = "";
            if (sortCol === "num")        { va = a.num; vb = b.num; }
            if (sortCol === "quemChamou") { va = a.quemChamou; vb = b.quemChamou; }
            if (sortCol === "onde")       { va = a.onde; vb = b.onde; }
            if (sortCol === "urgencia")   { const o = ["Crítica","Alta","Média","Baixa"]; va = String(o.indexOf(a.urgencia)); vb = String(o.indexOf(b.urgencia)); }
            if (sortCol === "status")     { va = a.status; vb = b.status; }
            if (sortCol === "data")       { va = a.data.split("/").reverse().join(""); vb = b.data.split("/").reverse().join(""); }
            return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        });
        return list;
    }, [search, filter, urgFilter, sortCol, sortDir]);

    const visible = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

    const counts = {
        aberto: CHAMADOS_DATA.filter(c => c.status === "Aberto").length,
        atendimento: CHAMADOS_DATA.filter(c => c.status === "Em Atendimento").length,
        critico: CHAMADOS_DATA.filter(c => c.urgencia === "Crítica" && c.status !== "Resolvido" && c.status !== "Cancelado").length,
    };

    return (
        <div className="min-h-screen bg-[#f9f9f9] relative font-['Inter',sans-serif]">
            <WaveBg />

            {/* ── NAV ── */}
            <nav className="bg-white border-b border-[#e5e7eb] relative z-10">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto gap-6">
                        <span className="font-black text-2xl tracking-widest uppercase text-black">NAMEDLY<span className="text-[#3800df]">.</span></span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center w-full md:w-auto gap-3 md:gap-4">
                        <div className="flex items-center gap-2 border border-[#e5e7eb] rounded-lg bg-[#f9f9f9] px-3 py-2.5 w-full sm:w-auto">
                            <SearchIcon sx={{ fontSize: 18 }} className="text-[#858585]" />
                            <input
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(0); }}
                                className="w-full sm:w-48 text-[13px] text-black font-medium placeholder:text-[#858585] focus:outline-none bg-transparent"
                                placeholder="Buscar chamados..."
                            />
                        </div>
                        <button onClick={() => setShowNovo(true)}
                                className="w-full sm:w-auto bg-[#3800df] hover:bg-black text-white rounded-lg px-4 py-2.5 text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-colors">
                            <Plus sx={{ fontSize: 16 }} /> Novo Chamado
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">

                {/* ── PAGE TITLE ── */}
                <div className="mb-8 md:mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-widest">Painel de Suporte</h1>
                    <p className="text-[12px] font-bold text-[#858585] uppercase tracking-widest mt-2">Gerencie e acompanhe todos os chamados.</p>
                </div>

                {/* ── STAT CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                    {[
                        { label: "Total", value: CHAMADOS_DATA.length, color: "text-black" },
                        { label: "Em Aberto", value: counts.aberto, color: "text-[#3800df]" },
                        { label: "Em Atendimento", value: counts.atendimento, color: "text-green-600" },
                        { label: "Críticos Ativos", value: counts.critico, color: "text-red-600", icon: counts.critico > 0 },
                    ].map(({ label, value, color, icon }) => (
                        <div key={label} className="bg-white rounded-xl border border-[#e5e7eb] px-5 py-4 shadow-sm text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center justify-between mb-2">
                                <p className="text-[10px] text-[#858585] font-black uppercase tracking-widest">{label}</p>
                                {icon && <span className="text-red-600 hidden md:block font-black text-[16px]">⚠️</span>}
                            </div>
                            <p className={`text-3xl md:text-4xl font-black ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* ── TABLE CARD ── */}
                <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm">

                    {/* Tab filters + urgência */}
                    <div className="border-b border-[#e5e7eb] px-4 md:px-6 pt-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                        <div className="flex items-center overflow-x-auto w-full xl:w-auto hide-scrollbar pb-2 xl:pb-0">
                            {FILTERS.map(f => (
                                <button key={f} onClick={() => { setFilter(f); setPage(0); }}
                                        className={`px-4 py-3 text-[11px] uppercase tracking-widest font-black border-b-[2.5px] transition-colors whitespace-nowrap ${
                                            filter === f
                                                ? "border-[#3800df] text-[#3800df]"
                                                : "border-transparent text-[#858585] hover:text-black"
                                        }`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 pb-4 overflow-x-auto w-full xl:w-auto hide-scrollbar">
                            {["Todos","Crítica","Alta","Média","Baixa"].map(u => (
                                <button key={u} onClick={() => { setUrgFilter(u); setPage(0); }}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                                            urgFilter === u
                                                ? "bg-black text-white border-black"
                                                : "border-[#e5e7eb] bg-[#f9f9f9] text-[#858585] hover:border-black hover:text-black"
                                        }`}>
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                            <tr className="bg-[#f9f9f9] border-b border-[#e5e7eb]">
                                <SortTh label="Chamado"      col="num"        sortCol={sortCol} sortDir={sortDir} onClick={handleSort} />
                                <SortTh label="Quem Chamou"  col="quemChamou" sortCol={sortCol} sortDir={sortDir} onClick={handleSort} />
                                <SortTh label="Onde"         col="onde"       sortCol={sortCol} sortDir={sortDir} onClick={handleSort} />
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#858585] whitespace-nowrap">Quem Atende</th>
                                <SortTh label="Urgência"     col="urgencia"   sortCol={sortCol} sortDir={sortDir} onClick={handleSort} />
                                <SortTh label="Status"       col="status"     sortCol={sortCol} sortDir={sortDir} onClick={handleSort} />
                                <SortTh label="Data"         col="data"       sortCol={sortCol} sortDir={sortDir} onClick={handleSort} />
                            </tr>
                            </thead>
                            <tbody>
                            {visible.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-16 text-center text-[13px] font-bold uppercase tracking-widest text-[#858585]">Nenhum chamado encontrado.</td></tr>
                            ) : visible.map((c, i) => (
                                <tr key={c.id}
                                    onClick={() => setDetail(c)}
                                    className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f9f9f9] cursor-pointer transition-colors">
                                    <td className="px-4 py-4">
                                        <span className="text-[13px] font-black text-[#3800df]">{c.num}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar initials={c.avatarChamou} />
                                            <span className="text-[12px] font-black text-black whitespace-nowrap uppercase">{c.quemChamou}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-[12px] font-bold text-[#858585] whitespace-nowrap">{c.onde}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {c.quemAtende ? (
                                            <div className="flex items-center gap-3">
                                                <Avatar initials={c.avatarAtende} />
                                                <span className="text-[12px] font-black text-black whitespace-nowrap uppercase">{c.quemAtende}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-[#d1d1d1] font-black uppercase tracking-widest">Não atribuído</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap"><UrgPill u={c.urgencia} /></td>
                                    <td className="px-4 py-4 whitespace-nowrap"><StatusPill st={c.status} /></td>
                                    <td className="px-4 py-4">
                                        <span className="text-[12px] font-bold text-[#858585] whitespace-nowrap">{c.data}</span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-[#e5e7eb] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-[10px] font-black tracking-widest uppercase text-[#858585]">
                            Exibindo {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} de {filtered.length} chamados
                        </span>
                        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} setPage={setPage} />
                    </div>
                </div>
            </div>

            {showNovo && <NovoChamadoModal onClose={() => setShowNovo(false)} />}
            {detail    && <DetalheModal c={detail} onClose={() => setDetail(null)} />}
        </div>
    );
}