import React, { useState, useMemo } from "react";
import {
    Search as SearchIcon,
    BookmarkBorder as Bookmark,
    Bookmark as BookmarkCheck,
    Close as X,
    Group as Users,
    CalendarMonth as Calendar,
    ArrowForward as ArrowRight,
    Tune as SlidersHorizontal,
    KeyboardArrowDown as ChevronDown
} from "@mui/icons-material";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PROJECTS = [
    {
        id: "p1",
        titulo: "Redesign do Portal do Cliente",
        desc: "Reestruturação completa da experiência B2B com novo sistema de design, componentes acessíveis e fluxos simplificados para onboarding.",
        area: "Design",
        status: "Em Andamento",
        equipe: "Studio UX",
        prazo: "Set 2025",
        membros: 6,
        progresso: 62,
        badge: "Destaque",
        image: "https://images.unsplash.com/photo-1680016661694-1cd3faf31c3a?w=800&h=500&fit=crop&auto=format",
    },
    {
        id: "p2",
        titulo: "Migração para Microsserviços",
        desc: "Desmembramento do monólito legado em serviços independentes com Kafka, deploy contínuo e feature flags por ambiente.",
        area: "Engenharia",
        status: "Em Andamento",
        equipe: "Core Platform",
        prazo: "Dez 2025",
        membros: 12,
        progresso: 38,
        badge: "Crítico",
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=500&fit=crop&auto=format",
    },
    {
        id: "p3",
        titulo: "Pipeline ML para Churn",
        desc: "Modelo preditivo treinado com 3 anos de dados comportamentais integrado ao CRM com alertas em tempo real por segmento.",
        area: "Dados",
        status: "Concluído",
        equipe: "Data Intelligence",
        prazo: "Jun 2025",
        membros: 4,
        progresso: 100,
        image: "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?w=800&h=500&fit=crop&auto=format",
    },
    {
        id: "p4",
        titulo: "App Mobile de Gestão de Frotas",
        desc: "React Native para motoristas e gestores com rastreamento GPS, alertas de manutenção preventiva e relatórios de consumo.",
        area: "Produto",
        status: "Em Andamento",
        equipe: "Mobile Squad",
        prazo: "Out 2025",
        membros: 8,
        progresso: 55,
        image: "https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=800&h=500&fit=crop&auto=format",
    },
    {
        id: "p5",
        titulo: "Infraestrutura Multi-Cloud",
        desc: "Provisionamento automatizado em AWS e GCP com Terraform, políticas de segurança, backups e disaster recovery testado.",
        area: "Infraestrutura",
        status: "Concluído",
        equipe: "DevOps",
        prazo: "Mar 2025",
        membros: 3,
        progresso: 100,
        image: "https://images.unsplash.com/photo-1695668548342-c0c1ad479aee?w=800&h=500&fit=crop&auto=format",
    },
    {
        id: "p6",
        titulo: "Sistema de Design Unificado v2",
        desc: "Biblioteca de componentes compartilhada entre 7 produtos internos, documentada no Storybook com tokens semânticos e dark mode.",
        area: "Design",
        status: "Em Andamento",
        equipe: "Design Systems",
        prazo: "Nov 2025",
        membros: 5,
        progresso: 71,
        badge: "Novo",
        image: "https://images.unsplash.com/photo-1772272935464-2e90d8218987?w=800&h=500&fit=crop&auto=format",
    },
];

const AREAS = ["Todos", "Design", "Engenharia", "Produto", "Dados", "Infraestrutura"];
const SORTS = [
    { value: "recentes", label: "Mais Recentes" },
    { value: "progresso", label: "Maior Progresso" },
    { value: "equipe", label: "Maior Equipe" },
    { value: "az", label: "A → Z" },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
    "Em Andamento": "bg-[#3800df] text-white",
    Concluído:      "bg-emerald-600 text-white",
    Novo:           "bg-violet-600 text-white",
    Pausado:        "bg-gray-400 text-white",
};

const AREA_STYLE = {
    Design:         { pill: "bg-pink-50 text-pink-700 border-pink-200",   dot: "bg-pink-500" },
    Engenharia:     { pill: "bg-blue-50 text-blue-700 border-blue-200",   dot: "bg-blue-500" },
    Produto:        { pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    Dados:          { pill: "bg-teal-50 text-teal-700 border-teal-200",   dot: "bg-teal-500" },
    Infraestrutura: { pill: "bg-gray-100 text-gray-600 border-gray-200",  dot: "bg-gray-500" },
};

const PROGRESS_COLOR = {
    "Em Andamento": "bg-[#3800df]",
    Concluído:      "bg-emerald-500",
    Novo:           "bg-violet-500",
    Pausado:        "bg-gray-400",
};

const ITEMS_PER_PAGE = 9;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function AreaPill({ area }) {
    const s = AREA_STYLE[area];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${s.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {area}
        </span>
    );
}

function StatusChip({ status }) {
    return (
        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black tracking-wide uppercase ${STATUS_STYLE[status]}`}>
            {status}
        </span>
    );
}

function ProgressBar({ value, status }) {
    return (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${PROGRESS_COLOR[status]}`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────

function ProjectCard({ project, saved, onSave, onClick }) {
    return (
        <div
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                    src={project.image}
                    alt={project.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    <StatusChip status={project.status} />
                    {project.badge && (
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-black tracking-wide uppercase bg-black text-white">
                            {project.badge}
                        </span>
                    )}
                </div>

                {/* Save button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onSave(); }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        saved
                            ? "bg-white text-[#3800df] shadow"
                            : "bg-black/30 text-white hover:bg-white hover:text-gray-800 backdrop-blur-sm"
                    }`}
                >
                    {saved ? <BookmarkCheck sx={{ fontSize: 18 }} /> : <Bookmark sx={{ fontSize: 18 }} />}
                </button>

                {/* Progress overlay bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                    <div className="flex justify-between text-white text-[10px] font-black mb-1">
                        <span>Progresso</span>
                        <span>{project.progresso}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${project.progresso}%` }} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-5 flex flex-col gap-3">
                <div className="self-start">
                    <AreaPill area={project.area} />
                </div>

                <div>
                    <h3 className="font-black text-black text-[16px] leading-snug group-hover:text-[#3800df] transition-colors line-clamp-1">
                        {project.titulo}
                    </h3>
                    <p className="text-[13px] text-[#858585] font-medium leading-relaxed mt-1.5 line-clamp-2">
                        {project.desc}
                    </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 pt-3 border-t border-gray-100 mt-auto uppercase tracking-wide">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Users sx={{ fontSize: 14 }} className="text-gray-400" />
                            {project.membros}
                        </span>
                        <span className="text-gray-600 truncate max-w-[90px]">{project.equipe}</span>
                    </div>
                    <span className="flex items-center gap-1">
                        <Calendar sx={{ fontSize: 14 }} className="text-gray-400" />
                        {project.prazo}
                    </span>
                </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-5">
                <button className="w-full py-3 bg-[#3800df] hover:bg-black text-white text-[11px] font-black tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-colors group/btn">
                    Ver Projeto
                    <ArrowRight sx={{ fontSize: 16 }} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────

function DetailModal({ project, saved, onSave, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-['Inter',sans-serif]" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Image */}
                <div className="relative h-48 md:h-72 overflow-hidden rounded-t-2xl">
                    <img src={project.image} alt={project.titulo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                        <X sx={{ fontSize: 20 }} />
                    </button>
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                        <div className="flex gap-2 flex-wrap">
                            <StatusChip status={project.status} />
                            {project.badge && (
                                <span className="px-2 py-0.5 rounded-sm text-[10px] font-black uppercase bg-black text-white">
                                    {project.badge}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 md:p-8 space-y-6">
                    <div>
                        <AreaPill area={project.area} />
                        <h2 className="text-2xl font-black text-black mt-3 leading-tight">{project.titulo}</h2>
                        <p className="text-[#858585] font-medium leading-relaxed mt-3 text-sm md:text-base">{project.desc}</p>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className="flex justify-between text-sm font-black mb-2">
                            <span className="text-gray-600">Progresso</span>
                            <span className="text-black">{project.progresso}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${PROGRESS_COLOR[project.status]}`}
                                style={{ width: `${project.progresso}%` }}
                            />
                        </div>
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {[
                            { label: "Equipe", value: project.equipe },
                            { label: "Membros", value: `${project.membros} pessoas` },
                            { label: "Prazo", value: project.prazo },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-[#f9f9f9] rounded-xl p-4 border border-[#e5e7eb]">
                                <p className="text-[10px] text-[#858585] font-black uppercase tracking-widest mb-1">{label}</p>
                                <p className="text-[13px] md:text-[14px] font-black text-black">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button className="flex-1 py-3 bg-[#3800df] hover:bg-black text-white font-black tracking-widest text-[11px] uppercase rounded-xl flex items-center justify-center gap-2 transition-colors">
                            Solicitar Acesso <ArrowRight sx={{ fontSize: 18 }} />
                        </button>
                        <button
                            onClick={onSave}
                            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                                saved
                                    ? "border-[#3800df] bg-blue-50 text-[#3800df]"
                                    : "border-[#e5e7eb] hover:border-gray-400 text-gray-500"
                            }`}
                        >
                            {saved ? <BookmarkCheck sx={{ fontSize: 20 }} /> : <Bookmark sx={{ fontSize: 20 }} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── SAVED PANEL ─────────────────────────────────────────────────────────────

function SavedPanel({ saved, all, onRemove, onClose }) {
    const projects = all.filter((p) => saved.includes(p.id));
    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 font-['Inter',sans-serif]" onClick={onClose}>
            <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7eb]">
                    <div>
                        <h2 className="font-black text-black uppercase tracking-wide">Salvos</h2>
                        <p className="text-[11px] font-bold text-[#858585]">{projects.length} projeto{projects.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={onClose} className="text-[#858585] hover:text-black transition-colors">
                        <X sx={{ fontSize: 24 }} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-[#d1d1d1] gap-3">
                            <Bookmark sx={{ fontSize: 40 }} />
                            <p className="text-sm font-bold uppercase tracking-widest">Nenhum salvo</p>
                        </div>
                    ) : (
                        projects.map((p) => (
                            <div key={p.id} className="flex gap-3 p-4 border-b border-[#f9f9f9] hover:bg-[#f9f9f9] transition-colors">
                                <img src={p.image} alt={p.titulo} className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-black text-black line-clamp-1">{p.titulo}</p>
                                    <p className="text-[10px] font-bold text-[#858585] mt-0.5">{p.equipe} · {p.membros} membros</p>
                                    <div className="mt-2">
                                        <ProgressBar value={p.progresso} status={p.status} />
                                    </div>
                                </div>
                                <button onClick={() => onRemove(p.id)} className="text-[#d1d1d1] hover:text-red-500 transition-colors flex-shrink-0 self-start mt-0.5">
                                    <X sx={{ fontSize: 18 }} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────

function Pagination({ total, page, perPage, setPage }) {
    const totalPages = Math.ceil(total / perPage);
    const vis = 5;
    let start = Math.max(0, page - Math.floor(vis / 2));
    let end = Math.min(totalPages, start + vis);
    if (end - start < vis) start = Math.max(0, end - vis);

    return (
        <div className="flex items-center gap-1 font-['Inter',sans-serif]">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="h-10 px-3 flex items-center justify-center border border-[#e5e7eb] rounded-lg hover:border-black disabled:opacity-30 transition-all text-sm font-black text-black">
                ←
            </button>
            {Array.from({ length: end - start }, (_, i) => start + i).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-[13px] font-black transition-all ${
                            page === p ? "bg-[#3800df] text-white border-[#3800df]" : "bg-white text-black border border-[#e5e7eb] hover:border-black"
                        }`}>
                    {p + 1}
                </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
                    className="h-10 px-3 flex items-center justify-center border border-[#e5e7eb] rounded-lg hover:border-black disabled:opacity-30 transition-all text-sm font-black text-black">
                →
            </button>
        </div>
    );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function Projeto() {
    const [area, setArea] = useState("Todos");
    const [sort, setSort] = useState("recentes");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [saved, setSaved] = useState([]);
    const [selected, setSelected] = useState(null);
    const [showSaved, setShowSaved] = useState(false);
    const [showSort, setShowSort] = useState(false);

    const filtered = useMemo(() => {
        let list = PROJECTS.filter((p) => {
            const matchArea = area === "Todos" || p.area === area;
            const matchSearch =
                p.titulo.toLowerCase().includes(search.toLowerCase()) ||
                p.equipe.toLowerCase().includes(search.toLowerCase()) ||
                p.desc.toLowerCase().includes(search.toLowerCase());
            return matchArea && matchSearch;
        });
        if (sort === "progresso") list = [...list].sort((a, b) => b.progresso - a.progresso);
        if (sort === "equipe") list = [...list].sort((a, b) => b.membros - a.membros);
        if (sort === "az") list = [...list].sort((a, b) => a.titulo.localeCompare(b.titulo));
        return list;
    }, [area, search, sort]);

    const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const currentPage = Math.min(page, Math.max(0, pages - 1));
    const visible = filtered.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    const toggleSave = (id) =>
        setSaved((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    const stats = {
        total: PROJECTS.length,
        ativos: PROJECTS.filter((p) => p.status === "Em Andamento").length,
        concluidos: PROJECTS.filter((p) => p.status === "Concluído").length,
        novos: PROJECTS.filter((p) => p.status === "Novo").length,
    };

    return (
        <div className="min-h-screen bg-[#f9f9f9] font-['Inter',sans-serif]">

            {/* ── HEADER ── */}
            <header className="bg-white border-b border-[#e5e7eb] sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-shrink-0 w-full md:w-auto flex justify-between items-center">
                        <span className="text-xl font-black tracking-widest uppercase text-black">NAMEDLY<span className="text-[#3800df]">.</span></span>

                        {/* Botão de Salvos no mobile vai pro topo junto com a logo */}
                        <button onClick={() => setShowSaved(true)} className="md:hidden relative flex items-center gap-2 p-2 rounded-xl text-black">
                            <Bookmark sx={{ fontSize: 24 }} />
                            {saved.length > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-[#3800df] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                    {saved.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 relative w-full max-w-xl mx-auto md:mx-0 md:ml-auto">
                        <SearchIcon sx={{ fontSize: 18 }} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858585]" />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            className="w-full pl-10 pr-4 py-3 border border-[#e5e7eb] bg-white text-sm font-medium focus:outline-none focus:border-[#3800df] transition-all text-black"
                            placeholder="Buscar projetos, equipes..."
                        />
                    </div>

                    {/* Botão de Salvos no Desktop */}
                    <button
                        onClick={() => setShowSaved(true)}
                        className="hidden md:flex relative items-center gap-2 px-5 py-3 border-2 border-black hover:bg-black hover:text-white text-[11px] uppercase font-black tracking-widest text-black transition-colors"
                    >
                        <Bookmark sx={{ fontSize: 18 }} />
                        <span>Salvos</span>
                        {saved.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#3800df] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                {saved.length}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">

                {/* ── HERO STATS ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
                    {[
                        { label: "Total", value: stats.total, color: "text-black" },
                        { label: "Em Andamento", value: stats.ativos, color: "text-[#3800df]" },
                        { label: "Concluídos", value: stats.concluidos, color: "text-emerald-600" },
                        { label: "Novos", value: stats.novos, color: "text-violet-600" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white border border-[#e5e7eb] px-5 py-4 md:py-6 text-center shadow-sm">
                            <p className="text-[10px] text-[#858585] font-black uppercase tracking-widest mb-1">{label}</p>
                            <p className={`text-3xl md:text-4xl font-black ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* ── FILTERS BAR ── */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center justify-between">
                    {/* Area pills */}
                    <div className="flex gap-2 flex-wrap">
                        {AREAS.map((a) => (
                            <button
                                key={a}
                                onClick={() => { setArea(a); setPage(0); }}
                                className={`px-4 py-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest border transition-all ${
                                    area === a
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-[#858585] border-[#e5e7eb] hover:border-black hover:text-black"
                                }`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="relative self-start lg:self-auto w-full lg:w-auto mt-2 lg:mt-0">
                        <button
                            onClick={() => setShowSort((v) => !v)}
                            className="flex items-center justify-between w-full lg:w-auto gap-3 px-5 py-2.5 border border-[#e5e7eb] bg-white text-[11px] uppercase font-black tracking-widest text-black hover:border-black transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal sx={{ fontSize: 16 }} />
                                {SORTS.find((s) => s.value === sort)?.label}
                            </div>
                            <ChevronDown sx={{ fontSize: 16 }} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
                        </button>
                        {showSort && (
                            <div className="absolute right-0 top-full mt-2 bg-white border border-[#e5e7eb] shadow-xl py-2 z-10 w-full lg:min-w-[200px]">
                                {SORTS.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => { setSort(s.value); setShowSort(false); setPage(0); }}
                                        className={`w-full text-left px-5 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#f9f9f9] transition-colors ${
                                            sort === s.value ? "text-[#3800df]" : "text-[#858585]"
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Result count */}
                <p className="text-[11px] font-bold text-[#858585] uppercase tracking-widest mb-6 border-b border-[#e5e7eb] pb-2">
                    {filtered.length} projeto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                </p>

                {/* ── GRID ── */}
                {visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 md:py-32 text-[#d1d1d1] gap-4">
                        <SearchIcon sx={{ fontSize: 48 }} />
                        <p className="font-black text-lg uppercase tracking-widest">Nenhum projeto encontrado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {visible.map((p) => (
                            <ProjectCard
                                key={p.id}
                                project={p}
                                saved={saved.includes(p.id)}
                                onSave={() => toggleSave(p.id)}
                                onClick={() => setSelected(p)}
                            />
                        ))}
                    </div>
                )}

                {/* ── PAGINATION ── */}
                {pages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-[#e5e7eb]">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#858585]">
                            Exibindo <strong className="text-black">{currentPage * ITEMS_PER_PAGE + 1}–{Math.min((currentPage + 1) * ITEMS_PER_PAGE, filtered.length)}</strong> de <strong className="text-black">{filtered.length}</strong>
                        </p>
                        <Pagination total={filtered.length} page={currentPage} perPage={ITEMS_PER_PAGE} setPage={setPage} />
                    </div>
                )}
            </main>

            {/* ── MODALS ── */}
            {selected && (
                <DetailModal
                    project={selected}
                    saved={saved.includes(selected.id)}
                    onSave={() => toggleSave(selected.id)}
                    onClose={() => setSelected(null)}
                />
            )}
            {showSaved && (
                <SavedPanel
                    saved={saved}
                    all={PROJECTS}
                    onRemove={toggleSave}
                    onClose={() => setShowSaved(false)}
                />
            )}
        </div>
    );
}