import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Mídias e imagens vinculadas à vaga para o carrossel
const IMAGENS_VAGA = [
    {
        id: 1,
        nome: "INFOGRAFICO_AMBIENTE_TRABALHO.JPG",
        desc: "Conheça a nossa estrutura de desenvolvimento e laboratórios",
        cor: "#f3f4f6",
    },
    {
        id: 2,
        nome: "BENEFICIOS_E_CULTURA.PNG",
        desc: "Cultura de inovação Namedly Labs",
        cor: "#e5e7eb",
    },
];

// Documentos técnicos e links oficiais vinculados à vaga
const DOCUMENTOS_E_LINKS = [
    { nome: "📄 DETALHES_VAGA.PDF", url: "#" },
    { nome: "📄 LAYOUT_PROJETO.PNG", url: "#" },
    { nome: "📄 CONTRATO_MODELO.PDF", url: "#" },
];

// Competências/Requisitos extraídos do seu código
const COMPETENCIAS = ["React", "3D Design"];

export default function VisualizacaoVagaClean() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState([]);

    // Configuração do Carrossel Dinâmico
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true },
        [Autoplay({ delay: 4000, stopOnInteraction: false })],
    );

    const scrollTo = useCallback(
        (index) => emblaApi && emblaApi.scrollTo(index),
        [emblaApi],
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="content-stretch flex flex-col items-center justify-center py-10 px-4 md:py-20 md:px-16 relative size-full bg-white font-['Inter',sans-serif] text-black overflow-x-hidden">
            <div className="content-stretch flex flex-col flex-[1_0_0] gap-8 md:gap-12 items-center min-h-px w-full relative max-w-[1400px] mx-auto">
                {/* =========================================================================
            1. ESTRUTURA DO TOPO (TÍTULO DA VAGA + METADADOS CENTRALIZADOS)
           ========================================================================= */}
                <header
                    className="content-stretch flex flex-col gap-4 md:gap-5 items-center text-center relative shrink-0 w-full"
                    data-name="Header-Clean"
                >
                    {/* TÍTULO PRINCIPAL DA VAGA */}
                    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
                        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[1.2] text-center relative text-[24px] md:text-[32px] text-black tracking-[-0.05em]">
                            <h1>ENGENHEIRO DE SOFTWARE</h1>
                        </div>
                    </div>

                    {/* METADADOS DA VAGA CENTRALIZADOS */}
                    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full px-2">
                        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center text-center leading-[1.6] md:leading-[1.4] text-[10px] md:text-[13px] text-black font-bold tracking-[0.05em]">
                            <p className="uppercase">
                                INÍCIO: 16/05/2026 • FIM: 16/06/2026 • UNIDADE
                                NAMEDLY • GESTOR: LUIZ AUGUSTO
                            </p>
                        </div>
                    </div>

                    {/* LINHA DE DIVISÃO SIMPLES */}
                    <div className="w-full border-b border-[#f0f0f0] pb-2" />
                </header>

                {/* =========================================================================
            2. COMPETÊNCIAS / REQUISITOS (ESTILO CLEAN TAGS CENTRALIZADAS)
           ========================================================================= */}
                <section className="w-full flex flex-col items-center text-center px-2">
                    <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold text-center text-[10px] md:text-[11px] text-[rgba(0,0,0,0.45)] tracking-[2px] md:tracking-[2.5px] uppercase mb-4">
                        <p>COMPETÊNCIAS / REQUISITOS</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center max-w-[600px]">
                        {COMPETENCIAS.map((item, index) => (
                            <div
                                key={index}
                                className="bg-black text-white px-3 py-1 md:px-4 md:py-1.5 flex items-center"
                            >
                                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider">
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* =========================================================================
            3. DESCRIÇÃO DA VAGA (TEXTO CENTRALIZADO)
           ========================================================================= */}
                <section className="w-full flex flex-col items-center text-center px-2">
                    <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold text-center text-[10px] md:text-[11px] text-[rgba(0,0,0,0.45)] tracking-[2px] md:tracking-[2.5px] uppercase mb-3">
                        <p>DESCRIÇÃO DA VAGA</p>
                    </div>
                    <div className="w-full max-w-[800px] font-['Inter:Medium',sans-serif] font-medium text-[14px] md:text-[16px] text-[rgba(0,0,0,0.65)] leading-[1.6] text-center">
                        <p>
                            Procuramos profissionais capacitados para atuar na
                            arquitetura de sistemas robustos, focando na
                            escalabilidade da plataforma digital e no
                            desenvolvimento de interfaces inovadoras. Trabalho
                            em sinergia direta com o time global de engenharia
                            da Unidade Namedly.
                        </p>
                    </div>
                </section>

                {/* =========================================================================
            4. CARROSSEL DE IMAGENS DA VAGA
           ========================================================================= */}
                <section
                    className="relative w-full h-[250px] sm:h-[300px] md:h-[380px] overflow-hidden bg-white border border-[#e5e7eb]"
                    data-name="Carrossel-Container"
                >
                    <div
                        className="w-full h-full overflow-hidden"
                        ref={emblaRef}
                    >
                        <div className="flex h-full w-full">
                            {IMAGENS_VAGA.map((slide) => (
                                <div
                                    key={slide.id}
                                    className="relative flex-[0_0_100%] min-w-0 h-full w-full"
                                >
                                    <div
                                        className="absolute inset-0 w-full h-full"
                                        style={{ backgroundColor: slide.cor }}
                                    />
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8">
                                        <h2 className="text-[18px] md:text-[22px] font-black text-black uppercase mb-2 tracking-tighter">
                                            {slide.nome}
                                        </h2>
                                        <p className="text-[12px] md:text-[14px] text-gray-600 max-w-[450px] font-medium">
                                            {slide.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dots de navegação */}
                    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={`transition-all duration-300 rounded-full h-1.5 md:h-2 border-none cursor-pointer ${
                                    index === selectedIndex
                                        ? "w-6 md:w-8 bg-[#3800df]"
                                        : "w-1.5 md:w-2 bg-gray-400/60"
                                }`}
                            />
                        ))}
                    </div>
                </section>

                {/* =========================================================================
            5. CONTEÚDO ADICIONAL (TEXTO PRINCIPAL CENTRALIZADO)
           ========================================================================= */}
                <main
                    className="content-stretch flex flex-col gap-3 md:gap-4 items-center text-center relative shrink-0 w-full px-2"
                    data-name="Corpo-Clean"
                >
                    <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] relative text-[10px] md:text-[11px] text-[rgba(0,0,0,0.45)] tracking-[2px] md:tracking-[2.5px] uppercase whitespace-nowrap mb-2">
                        <p>CONTEÚDO ADICIONAL</p>
                    </div>

                    <div className="w-full max-w-[900px] font-['Inter:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.03px] space-y-5 md:space-y-6 text-center leading-[1.6] md:leading-[1.8]">
                        <p>
                            Oferecemos contratação em regime flexível, plano
                            de saúde premium internacional, participação nos
                            lucros semestral e suporte completo para o
                            desenvolvimento de suas competências técnicas
                            através de certificações pagas e subsídios
                            educacionais.
                        </p>
                        <p>
                            Os candidatos selecionados passarão por uma
                            triagem técnica simplificada seguida de um
                            bate-papo descontraído com o time operacional para
                            alinhar cultura e expectativas.
                        </p>
                    </div>
                </main>

                {/* =========================================================================
            6. SEÇÃO DE DOCUMENTOS ANEXADOS DA VAGA E LINKS
           ========================================================================= */}
                <footer
                    className="content-stretch flex flex-col gap-3 md:gap-4 items-center text-center relative shrink-0 w-full pt-8 md:pt-12 border-t border-[#f0f0f0] px-2"
                    data-name="Arquivos-Anexados-Clean"
                >
                    <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] text-[10px] md:text-[11px] text-[rgba(0,0,0,0.45)] tracking-[2px] md:tracking-[2.5px] uppercase whitespace-nowrap mb-2">
                        <p>DOCUMENTOS DA VAGA E LINKS ÚTEIS</p>
                    </div>

                    <div className="flex flex-col gap-3 items-center w-full">
                        {DOCUMENTOS_E_LINKS.map((item, index) => (
                            <div
                                key={index}
                                className="font-['Inter:Medium',sans-serif] font-medium text-[12px] md:text-[14px] text-[#3800df] hover:underline cursor-pointer font-bold tracking-tight break-all max-w-full"
                            >
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {item.nome}
                                </a>
                            </div>
                        ))}
                    </div>
                </footer>
            </div>
        </div>
    );
}