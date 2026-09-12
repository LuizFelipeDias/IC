import React from "react";

// Dados extraídos das informações do seu código (Vaga atual do Recrutador)
const VAGAS_RECRUTADOR = [
    {
        titulo: "ENGENHEIRO DE SOFTWARE",
        dataInicio: "16/05/2026",
        dataFim: "16/06/2026",
        empresa: "UNIDADE NAMEDLY",
        responsavel: "NOME DO GESTOR",
        competencias: ["REACT", "3D DESIGN"],
    },
];

// Mock de opções de vagas disponíveis no sistema
const OPCOES_VAGAS_SISTEMA = [
    {
        id: "VG-01",
        titulo: "DESENVOLVEDOR FRONTEND SENIOR",
        departamento: "TECNOLOGIA",
        status: "ATIVO",
    },
    {
        id: "VG-02",
        titulo: "DESIGNER UX/UI PLENO",
        departamento: "PRODUTO",
        status: "EM REVISÃO",
    },
    {
        id: "VG-03",
        titulo: "GERENTE DE PRODUTOS DIGITAIS",
        departamento: "PRODUTO",
        status: "FECHADO",
    },
    {
        id: "VG-04",
        titulo: "ANALISTA DE INFRAESTRUTURA DE TI",
        departamento: "OPERAÇÕES",
        status: "ATIVO",
    },
];

export default function VisualizacaoVagasTabelas() {
    return (
        <div className="content-stretch flex flex-col items-center justify-center py-10 px-4 md:py-20 md:px-16 relative size-full bg-white font-['Inter',sans-serif] text-black overflow-x-hidden">
            <div className="content-stretch flex flex-col flex-[1_0_0] gap-10 md:gap-[56px] items-center min-h-px min-w-full relative max-w-[1400px] mx-auto">
                {/* =========================================================================
            1. HEADER CENTRALIZADO E CLEAN
           ========================================================================= */}
                <header
                    className="content-stretch flex flex-col gap-4 md:gap-[20px] items-center text-center relative shrink-0 w-full"
                    data-name="Header-Clean"
                >
                    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
                        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[1.2] text-center relative text-[24px] md:text-[32px] text-black tracking-[-0.05em]">
                            <h1>PAINEL DE GERENCIAMENTO DE VAGAS</h1>
                        </div>
                    </div>
                    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full px-2">
                        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center text-center leading-[1.4] text-[10px] md:text-[13px] text-[#858585] font-bold tracking-[0.2em]">
                            <p className="uppercase">
                                CONTROLE DE RECRUTAMENTO • NAMEDLY LABS
                            </p>
                        </div>
                    </div>
                    <div className="w-full border-b border-[#f0f0f0] pb-2" />
                </header>

                {/* =========================================================================
            2. TABELA 1: VAGAS LISTADAS PELO RECRUTADOR (INFO DO SEU CÓDIGO)
           ========================================================================= */}
                <section className="w-full flex flex-col items-center gap-4">
                    <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold text-center text-[10px] md:text-[12px] text-[rgba(0,0,0,0.45)] tracking-[2px] md:tracking-[2.5px] uppercase w-full">
                        <p>1. VAGAS ATUAIS LISTADAS PELO RECRUTADOR</p>
                    </div>

                    <div className="w-full overflow-x-auto border border-[#e5e7eb]">
                        <table className="w-full border-collapse text-left text-sm text-black min-w-[700px]">
                            <thead>
                            <tr className="border-b border-[#e5e7eb] bg-gray-50/50">
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] whitespace-nowrap">
                                    Título da Vaga
                                </th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] whitespace-nowrap">
                                    Período
                                </th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] whitespace-nowrap">
                                    Empresa / Unidade
                                </th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] whitespace-nowrap">
                                    Responsável
                                </th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] whitespace-nowrap">
                                    Competências Obrigatórias
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {VAGAS_RECRUTADOR.map((vaga, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-[#f3f4f6] last:border-0 hover:bg-gray-50/30 transition-colors"
                                >
                                    <td className="p-4 font-bold text-black tracking-tight whitespace-nowrap">
                                        {vaga.titulo}
                                    </td>
                                    <td className="p-4 text-gray-600 whitespace-nowrap">
                                        {vaga.dataInicio} até {vaga.dataFim}
                                    </td>
                                    <td className="p-4 text-gray-600 uppercase text-[12px] whitespace-nowrap">
                                        {vaga.empresa}
                                    </td>
                                    <td className="p-4 text-gray-600 uppercase text-[12px] whitespace-nowrap">
                                        {vaga.responsavel}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1.5">
                                            {vaga.competencias.map(
                                                (skill, sIdx) => (
                                                    <span
                                                        key={sIdx}
                                                        className="bg-black text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 inline-block"
                                                    >
                                                        {skill}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* =========================================================================
            3. TABELA 2: OPÇÕES DE VAGAS DISPONÍVEIS NO SISTEMA
           ========================================================================= */}
                <section className="w-full flex flex-col items-center gap-4 pt-4 md:pt-8">
                    <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold text-center text-[10px] md:text-[12px] text-[rgba(0,0,0,0.45)] tracking-[2px] md:tracking-[2.5px] uppercase w-full">
                        <p>2. BANCO DE OPÇÕES DE VAGAS DISPONÍVEIS</p>
                    </div>

                    <div className="w-full overflow-x-auto border border-[#e5e7eb]">
                        <table className="w-full border-collapse text-left text-sm text-black min-w-[700px]">
                            <thead>
                            <tr className="border-b border-[#e5e7eb] bg-gray-50/50">
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] whitespace-nowrap">
                                    Código ID
                                </th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] whitespace-nowrap">
                                    Título Opcional
                                </th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] whitespace-nowrap">
                                    Departamento
                                </th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] whitespace-nowrap">
                                    Status Interno
                                </th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-[#858585] text-center whitespace-nowrap">
                                    Ação
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {OPCOES_VAGAS_SISTEMA.map((opcao) => (
                                <tr
                                    key={opcao.id}
                                    className="border-b border-[#f3f4f6] last:border-0 hover:bg-gray-50/30 transition-colors"
                                >
                                    <td className="p-4 text-gray-400 font-mono text-[12px] whitespace-nowrap">
                                        {opcao.id}
                                    </td>
                                    <td className="p-4 font-medium text-black whitespace-nowrap">
                                        {opcao.titulo}
                                    </td>
                                    <td className="p-4 text-gray-600 uppercase text-[12px] tracking-wide whitespace-nowrap">
                                        {opcao.departamento}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                                                opcao.status === "ATIVO"
                                                    ? "text-green-600 bg-green-50"
                                                    : opcao.status === "EM REVISÃO"
                                                        ? "text-amber-600 bg-amber-50"
                                                        : "text-gray-400 bg-gray-50"
                                            }`}
                                        >
                                            {opcao.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center whitespace-nowrap">
                                        <button className="text-[#3800df] hover:text-black font-bold uppercase text-[11px] tracking-widest transition-colors">
                                            Selecionar →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* METADADOS/NOTAS DE DESIGN INFERIOR */}
                <footer className="w-full text-center mt-4 pt-8 border-t border-[#f0f0f0]">
                    <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.1em] md:tracking-[0.2em] font-bold">
                        Visualização de Dados Otimizada • Estilo Clean Sem Inputs
                    </p>
                </footer>
            </div>
        </div>
    );
}