import React, { useState } from "react";

// --- DADOS AMPLIADOS PARA PREENCHER O LAYOUT ---
const NOTICIAS_DATA = Array.from({ length: 120 }, (_, i) => ({
    id: `n-${i}`,
    nome:
        [
            "IA GENERATIVA 2026: O FIM DO CÓDIGO MANUAL?",
            "MICROSOFT CONTRATA SAM ALTMAN APÓS CRISE NA OPENAI",
            "APPLE ANUNCIA INTEGRAÇÃO NATIVA COM MODELOS LOCAIS",
            "BLOCKCHAIN REVOLUCIONA RASTREABILIDADE EM LOGÍSTICA",
            "NOVOS SEMICONDUTORES DE GRAFENO ATINGEM 50GHZ",
            "QUANTUM COMPUTING: O PRIMEIRO ALGORITMO DE QUEBRA DE CRIPTOGRAFIA",
            "CIDADES INTELIGENTES: SENSORES REDUZEM TRÂNSITO EM 40%",
            "CYBERSECURITY: O ATAQUE DE DIA ZERO QUE ABALOU A CLOUD",
        ][i % 8] + (i > 7 ? ` #${i}` : ""),
    desc: "Especialistas discutem como a automação de baixo nível está permitindo que desenvolvedores foquem em arquitetura e lógica de negócios complexa, eliminando o boilerplate.",
    tag:
        i % 3 === 0
            ? "5 MIN READ"
            : i % 3 === 1
                ? "AUDIO"
                : "TECH INSIGHT",
    tempo: `${Math.floor(Math.random() * 59) + 1}m ago`,
    categoria: ["TECNOLOGIA", "MERCADO", "INOVAÇÃO", "CIÊNCIA"][
    i % 4
        ],
}));

// --- PAGINAÇÃO MODERNA (POSICIONADA À DIREITA COM ESCOLHA DE PÁGINA) ---
const PaginacaoModerna = ({
                              total,
                              atual,
                              setPagina,
                              itensPorPagina,
                          }) => {
    const totalPaginas = Math.ceil(total / itensPorPagina);
    const paginasVisiveis = 5;

    let start = Math.max(
        0,
        atual - Math.floor(paginasVisiveis / 2),
    );
    let end = Math.min(totalPaginas, start + paginasVisiveis);

    if (end - start < paginasVisiveis) {
        start = Math.max(0, end - paginasVisiveis);
    }

    return (
        <div className="flex items-center gap-2">
            {/* Botão Anterior */}
            <button
                onClick={() => setPagina(Math.max(0, atual - 1))}
                disabled={atual === 0}
                className="size-10 flex items-center justify-center border border-gray-200 hover:border-black disabled:opacity-30 transition-all"
            >
                ←
            </button>

            {/* Lista de Páginas para Escolha */}
            <div className="flex gap-1">
                {Array.from(
                    { length: end - start },
                    (_, i) => start + i,
                ).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPagina(p)}
                        className={`size-10 flex items-center justify-center text-[12px] font-black transition-all ${
                            atual === p
                                ? "bg-[#3800df] text-white"
                                : "bg-transparent hover:bg-gray-100 text-black border border-transparent"
                        }`}
                    >
                        {p + 1}
                    </button>
                ))}
            </div>

            {/* Botão Próximo */}
            <button
                onClick={() =>
                    setPagina(Math.min(totalPaginas - 1, atual + 1))
                }
                disabled={atual === totalPaginas - 1}
                className="size-10 flex items-center justify-center border border-gray-200 hover:border-black disabled:opacity-30 transition-all"
            >
                →
            </button>
        </div>
    );
};

export default function PortalNoticias() {
    const [pagina, setPagina] = useState(0);
    const [busca, setBusca] = useState("");
    const itensPorPagina = 12;

    const filteredData = NOTICIAS_DATA.filter((n) =>
        n.nome.toLowerCase().includes(busca.toLowerCase()),
    );

    const inicio = pagina * itensPorPagina;
    const exibidos = filteredData.slice(
        inicio,
        inicio + itensPorPagina,
    );

    return (
        <div className="w-full min-h-screen bg-white flex flex-col items-center font-['Inter',sans-serif] pb-20">
            <div className="w-full max-w-[1440px] px-10 pt-10">
                {/* HEADER JORNALÍSTICO */}
                <header className="border-b-[4px] border-black pb-6 mb-12">
                    <div className="flex justify-between items-end mb-4">
            <span className="text-[12px] font-black tracking-widest uppercase">
              Vol. CXIV — No. 342
            </span>
                        <h1 className="text-[64px] font-black tracking-[-0.04em] uppercase leading-none font-['Georgia'] italic">
                            The Tech Post
                        </h1>
                        <span className="text-[12px] font-black tracking-widest uppercase">
              {new Date().toLocaleDateString("pt-BR")}
            </span>
                    </div>
                    <div className="border-t border-black pt-2 flex justify-center gap-10 text-[11px] font-bold tracking-[0.3em] uppercase">
                        <span>Inteligência Artificial</span>
                        <span>Desenvolvimento</span>
                        <span>Cloud Computing</span>
                        <span>Hardware</span>
                    </div>
                </header>

                {/* BUSCA E FILTRO */}
                <div className="flex gap-4 mb-16 justify-center">
                    <div className="relative w-full max-w-[800px]">
                        <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest z-10">
                            Search Archive
                        </label>
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setPagina(0);
                            }}
                            className="w-full h-[60px] border-2 border-gray-200 px-6 outline-none focus:border-[#3800df] transition-colors font-medium"
                            placeholder="Filter stories by keyword..."
                        />
                    </div>
                    <button className="h-[60px] px-12 bg-[#3800df] text-white font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                        Filter
                    </button>
                </div>

                {/* GRID PRINCIPAL */}
                <div className="flex flex-col lg:flex-row gap-12 border-b border-gray-200 pb-16">
                    <div className="flex-[2] space-y-12">
                        {exibidos.slice(0, 1).map((n) => (
                            <article
                                key={n.id}
                                className="group cursor-pointer"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                    <span className="text-[12px] font-black text-[#ce0b24] tracking-tighter uppercase">
                      ● Live Update
                    </span>
                                        <h2 className="text-[38px] font-bold leading-none font-['Georgia'] group-hover:text-[#3800df] transition-colors italic">
                                            {n.nome}
                                        </h2>
                                        <p className="text-[#555] leading-relaxed font-['Georgia'] text-[18px]">
                                            {n.desc}
                                        </p>
                                        <div className="flex items-center gap-4 pt-2">
                      <span className="text-[10px] font-black uppercase border border-black px-2 py-1">
                        {n.tag}
                      </span>
                                            <span className="text-[11px] font-bold text-gray-400 uppercase">
                        {n.tempo}
                      </span>
                                        </div>
                                    </div>
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gray-200 group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                </div>
                            </article>
                        ))}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-gray-100">
                            {exibidos.slice(1, 5).map((n) => (
                                <article
                                    key={n.id}
                                    className="group cursor-pointer flex flex-col gap-4"
                                >
                                    <div className="h-[200px] bg-gray-50 overflow-hidden">
                                        <div className="w-full h-full bg-gray-200 group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <h3 className="text-[20px] font-bold font-['Georgia'] leading-tight group-hover:underline">
                                        {n.nome}
                                    </h3>
                                    <p className="text-[14px] text-gray-500 line-clamp-2">
                                        {n.desc}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <aside className="flex-1 space-y-10 border-l border-gray-100 pl-10">
                        <h4 className="text-[14px] font-black uppercase border-b-2 border-black pb-1">
                            The Latest
                        </h4>
                        <div className="space-y-8">
                            {exibidos.slice(5, 10).map((n) => (
                                <div
                                    key={n.id}
                                    className="group cursor-pointer border-b border-gray-100 pb-6 last:border-0"
                                >
                  <span className="text-[10px] font-black text-[#3800df] uppercase mb-1 block">
                    {n.categoria}
                  </span>
                                    <h5 className="text-[16px] font-bold leading-tight group-hover:text-[#3800df]">
                                        {n.nome}
                                    </h5>
                                    <span className="text-[11px] text-gray-400 mt-2 block">
                    {n.tempo} — {n.tag}
                  </span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-[#f9f9f9] p-6 border-t-4 border-[#3800df] mt-12">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                Opinion
              </span>
                            <p className="text-[20px] font-bold font-['Georgia'] italic leading-tight mb-4">
                                "Por que a arquitetura de micro-frontends é o
                                futuro do desenvolvimento escalável."
                            </p>
                            <p className="text-[12px] font-black uppercase tracking-tighter">
                                By Senior Architect
                            </p>
                        </div>
                    </aside>
                </div>

                {/* RODAPÉ DE PAGINAÇÃO (TEXTO À ESQUERDA, BOTÕES À DIREITA) */}
                <footer className="py-20 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col text-left">
            <span className="text-[13px] font-black uppercase tracking-[0.3em]">
              See More Updates
            </span>
                        <span className="text-[11px] text-gray-400 font-medium">
              Showing {inicio + 1}-
                            {Math.min(
                                inicio + itensPorPagina,
                                filteredData.length,
                            )}{" "}
                            of {filteredData.length} stories
            </span>
                    </div>

                    <PaginacaoModerna
                        total={filteredData.length}
                        atual={pagina}
                        setPagina={setPagina}
                        itensPorPagina={itensPorPagina}
                    />
                </footer>
            </div>
        </div>
    );
}