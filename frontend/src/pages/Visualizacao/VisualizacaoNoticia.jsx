import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Mídias já anexadas para exibição no carrossel
const IMAGENS_ANEXADAS = [
    {
        id: 1,
        nome: "FOTO_NOTICIA_PRINCIPAL.JPG",
        desc: "Imagem principal do artigo em alta resolução",
        cor: "#f3f4f6",
    },
    {
        id: 2,
        nome: "GRAFICO_DADOS_MAIO.PNG",
        desc: "Infográfico demonstrativo anexado",
        cor: "#e5e7eb",
    },
];

// Arquivos e links já anexados
const ARQUIVOS_E_LINKS = [
    { nome: "📄 REQUISITOS_NOTICIA_V2.PDF", url: "#" },
    { nome: "📄 COBERTURA_COMPLETA_PAUTA.PDF", url: "#" },
    { nome: "🔗 FONTE_DA_MATERIA_ORIGINAL.HTML", url: "#" },
];

export default function VisualizacaoArtigoClean() {
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
            1. ESTRUTURA DO TOPO (ESCREVA SUA NOTÍCIA)
           ========================================================================= */}
                <header
                    className="content-stretch flex flex-col gap-4 md:gap-5 items-center text-center relative shrink-0 w-full"
                    data-name="Header-Clean"
                >
                    {/* TÍTULO PRINCIPAL */}
                    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
                        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[1.2] text-center relative text-[24px] md:text-[32px] text-black tracking-[-0.05em]">
                            <h1>ESCREVA SUA NOTÍCIA</h1>
                        </div>
                    </div>

                    {/* METADADOS CENTRALIZADOS */}
                    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full px-2">
                        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center text-center leading-[1.6] md:leading-[1.4] text-[10px] md:text-[12px] text-black font-bold tracking-[0.05em]">
                            <p className="uppercase">
                                AUTOR • DATA • TÍTULO • TEMA • EMPRESA • PROFISSÃO
                            </p>
                        </div>
                    </div>

                    {/* LINHA DE DIVISÃO SIMPLES */}
                    <div className="w-full border-b border-[#f0f0f0] pb-2" />
                </header>

                {/* =========================================================================
            2. DESCRIÇÃO DA NOTÍCIA (TEXTO CENTRALIZADO)
           ========================================================================= */}
                <section className="w-full flex flex-col items-center text-center px-2">
                    <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold text-center text-[10px] md:text-[11px] text-[rgba(0,0,0,0.45)] tracking-[2px] md:tracking-[2.5px] uppercase mb-3">
                        <p>DESCRIÇÃO</p>
                    </div>
                    <div className="w-full max-w-[800px] font-['Inter:Medium',sans-serif] font-medium text-[14px] md:text-[16px] text-[rgba(0,0,0,0.65)] leading-[1.6] text-center">
                        <p>
                            Breve resumo explicativo sobre os acontecimentos
                            da notícia, contextualizando os pontos que serão
                            destrinchados no corpo do texto abaixo.
                        </p>
                    </div>
                </section>

                {/* =========================================================================
            3. CARROSSEL DE IMAGENS JÁ ANEXADAS
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
                            {IMAGENS_ANEXADAS.map((slide) => (
                                <div
                                    key={slide.id}
                                    className="relative flex-[0_0_100%] min-w-0 h-full w-full"
                                >
                                    <div
                                        className="absolute inset-0 w-full h-full"
                                        style={{ backgroundColor: slide.cor }}
                                    />
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8">
                                        <h2 className="text-[18px] md:text-[24px] font-black text-black uppercase mb-2 tracking-tighter">
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
            4. CORPO DA NOTÍCIA (TEXTO TOTALMENTE CENTRALIZADO)
           ========================================================================= */}
                <main
                    className="content-stretch flex flex-col gap-3 md:gap-4 items-center text-center relative shrink-0 w-full px-2"
                    data-name="Corpo-Clean"
                >
                    <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] relative text-[10px] md:text-[11px] text-[rgba(0,0,0,0.45)] tracking-[2px] md:tracking-[2.5px] uppercase whitespace-nowrap mb-2">
                        <p>TEXTO</p>
                    </div>

                    <div className="w-full max-w-[900px] font-['Inter:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.03px] space-y-5 md:space-y-6 text-center leading-[1.6] md:leading-[1.8]">
                        <p>
                            O corpo do texto da sua notícia fica posicionado
                            de forma centralizada nesta área, garantindo uma
                            leitura limpa, focada e elegante. Toda a
                            distribuição do conteúdo foi otimizada para
                            remover elementos laterais pesados.
                        </p>
                        <p>
                            Novos parágrafos inseridos aqui herdarão
                            automaticamente a centralização e o espaçamento
                            adequados para manter a harmonia visual proposta
                            na interface.
                        </p>
                    </div>
                </main>

                {/* =========================================================================
            5. SEÇÃO DE ARQUIVOS ANEXADOS E LINKS (SUBSTITUINDO OS ANEXOS MANUAIS)
           ========================================================================= */}
                <footer
                    className="content-stretch flex flex-col gap-3 md:gap-4 items-center text-center relative shrink-0 w-full pt-8 md:pt-12 border-t border-[#f0f0f0] px-2"
                    data-name="Arquivos-Anexados-Clean"
                >
                    <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] text-[10px] md:text-[11px] text-[rgba(0,0,0,0.45)] tracking-[2px] md:tracking-[2.5px] uppercase whitespace-nowrap mb-2">
                        <p>ARQUIVOS ANEXADOS E LINKS</p>
                    </div>

                    <div className="flex flex-col gap-3 items-center w-full">
                        {ARQUIVOS_E_LINKS.map((item, index) => (
                            <div
                                key={index}
                                className="font-['Inter:Medium',sans-serif] font-medium text-[12px] md:text-[14px] text-[#3800df] hover:underline cursor-pointer font-bold tracking-tight break-all max-w-full"
                            >
                                <a href={item.url}>{item.nome}</a>
                            </div>
                        ))}
                    </div>
                </footer>
            </div>
        </div>
    );
}