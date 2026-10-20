import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Nav.jsx";
import { api, lista } from "../services/api";

const GRID_ITEMS = [
    { title: "CHAMADOS", link: "VEJA MAIS >", path: "/chamados" },
    { title: "VAGAS", link: "VEJA MAIS >", path: "/vaga" },
    { title: "CURRÍCULO", link: "VEJA MAIS >", path: "/cadastro/curriculo" },
    { title: "PROJETOS", link: "VEJA MAIS >", path: "/projetos" },
    { title: "NOTÍCIAS", link: "VEJA MAIS >", path: "/noticias" },
];

function FeatureGrid() {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row flex-wrap">
                {GRID_ITEMS.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(item.path)}
                        className="flex-1 min-w-[200px] h-[250px] flex flex-col items-center justify-center transition-all duration-300 hover:bg-gray-50 group cursor-pointer"
                    >
                        <h3 className="font-['Open_Sans',sans-serif] font-bold text-[24px] tracking-tight text-black mt-4 group-hover:text-[#3800df] transition-colors">
                            {item.title}
                        </h3>
                        <div className="mt-12 flex flex-col items-center gap-4">
                            <span className="font-['Open_Sans',sans-serif] font-medium text-[11px] text-[#3800df] cursor-pointer hover:opacity-70 uppercase tracking-[0.3em] transition-all">
                                {item.link}
                            </span>
                            <div className="w-10 h-[2px] bg-[#3800df] group-hover:w-16 transition-all duration-500" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const SLIDES = [
    { id: 1, nome: "PRODUTO ALPHA", desc: "Descrição do primeiro produto incrível", cor: "#f3f4f6" },
    { id: 2, nome: "PRODUTO BETA", desc: "Este aqui tem funcionalidades únicas", cor: "#e5e7eb" },
    { id: 3, nome: "PRODUTO GAMMA", desc: "A melhor escolha para sua biblioteca", cor: "#d1d5db" },
];

function Carrossel() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState([]);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 4000, stopOnInteraction: false }),
    ]);

    const scrollTo = useCallback(
        (index) => emblaApi && emblaApi.scrollTo(index),
        [emblaApi]
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
        <section className="relative w-full h-[500px] overflow-hidden bg-white">
            <div className="w-full h-full overflow-hidden" ref={emblaRef}>
                <div className="flex h-full w-full">
                    {SLIDES.map((slide) => (
                        <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-full w-full">
                            <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: slide.cor }} />
                            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                                <h2 className="text-[48px] font-bold text-black uppercase mb-4 tracking-tighter">
                                    {slide.nome}
                                </h2>
                                <p className="text-[20px] text-gray-500 max-w-[450px]">
                                    {slide.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`transition-all duration-300 rounded-full h-2 border-none cursor-pointer ${
                            index === selectedIndex ? "w-10 bg-[#1b85db]" : "w-2 bg-gray-400"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}

const PaginacaoDash = ({ total, atual, setPagina, itensPorPagina }) => {
    const totalPaginas = Math.ceil(total / itensPorPagina) || 1;
    return (
        <div className="flex gap-1.5 h-[4px]">
            {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                    key={i}
                    onClick={() => setPagina(i)}
                    className={`h-[4px] transition-all duration-300 border-none cursor-pointer ${
                        atual === i ? "w-12 bg-[#3800df]" : "w-8 bg-[#e9ecef]"
                    }`}
                />
            ))}
        </div>
    );
};

export default function Home() {
    const [vagas, setVagas] = useState([]);
    const [projetos, setProjetos] = useState([]);
    const [noticias, setNoticias] = useState([]);

    const [inputBusca, setInputBusca] = useState("");
    const [filtroAtivo, setFiltroAtivo] = useState("");

    useEffect(() => {
        const buscarDados = async () => {
            const [resVagas, resProjetos, resNoticias] = await Promise.allSettled([
                api('/vaga?per_page=50'),
                api('/projeto?per_page=50'),
                api('/noticia?per_page=50')
            ]);

            if (resVagas.status === 'fulfilled') setVagas(lista(resVagas.value));
            if (resProjetos.status === 'fulfilled') setProjetos(lista(resProjetos.value));
            if (resNoticias.status === 'fulfilled') setNoticias(lista(resNoticias.value));

            [resVagas, resProjetos, resNoticias]
                .filter((r) => r.status === 'rejected')
                .forEach((r) => console.error("Erro ao carregar dados da API:", r.reason));
        };

        buscarDados().catch(console.error);
    }, []);

    const handleFiltrar = (e) => {
        e.preventDefault();
        setFiltroAtivo(inputBusca.trim().toLowerCase());
    };

    const aplicarFiltro = (lista) => {
        if (!filtroAtivo) return lista;
        return lista.filter(item => {
            const nome = (item.titulo || item.nome || "").toLowerCase();
            const desc = (item.descricao || item.desc || "").toLowerCase();
            return nome.includes(filtroAtivo) || desc.includes(filtroAtivo);
        });
    };

    const SECOES_DATA = [
        {
            titulo: "Vagas",
            path: "/vaga",
            items: aplicarFiltro(vagas).map((v, i) => ({
                id: v.id || `v-${i}`,
                nome: v.titulo || v.nome || "Oportunidade Tech",
                desc: v.descricao || v.desc || "Detalhes da vaga disponível.",
            })),
        },
        {
            titulo: "Projetos",
            path: "/projetos",
            items: aplicarFiltro(projetos).map((p, i) => ({
                id: p.id || `p-${i}`,
                nome: p.titulo || p.nome || "Projeto Ativo",
                desc: p.descricao || p.desc || "Confira os detalhes deste projeto.",
            })),
        },
        {
            titulo: "Notícias",
            path: "/noticias",
            items: aplicarFiltro(noticias).map((n, i) => ({
                id: n.id || `n-${i}`,
                nome: n.titulo || n.nome || "Atualização de Mercado",
                desc: n.descricao || n.desc || "Saiba as novidades recentes.",
            })),
        },
    ];

    return (
        <main className="w-full bg-white">
            <Navbar />
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Raleway:wght@400;500;600&display=swap');
                    `,
                }}
            />
            <Carrossel />
            <FeatureGrid />

            <div className="w-full bg-white flex flex-col items-center pt-20 px-10 font-['Inter',sans-serif] overflow-hidden">
                <div className="w-full max-w-[1280px]">
                    <h1 className="text-black text-[24px] font-black tracking-[1.2em] uppercase text-center mb-16">
                        Bem Vindo
                    </h1>

                    <form onSubmit={handleFiltrar} className="flex justify-center items-center gap-6 mb-20 w-full px-4">
                        <div className="relative w-full max-w-[750px]">
                            <label className="absolute -top-2.5 left-3 bg-white px-2 text-[11px] text-[#858585] font-bold uppercase tracking-widest z-10 border-x border-gray-100">
                                PESQUISAR
                            </label>
                            <input
                                type="text"
                                value={inputBusca}
                                onChange={(e) => setInputBusca(e.target.value)}
                                placeholder="Digite para filtrar..."
                                className="w-full h-[65px] border-[1.5px] border-[#d1d1d1] px-6 outline-none focus:border-[#3800df] text-[14px] font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-[65px] px-20 bg-[#3800df] text-white text-[14px] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                            FILTRO
                        </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 px-4 pb-20">
                        {SECOES_DATA.map((secao) => (
                            <ColunaLista key={secao.titulo} secao={secao} />
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}

function ColunaLista({ secao }) {
    const navigate = useNavigate();
    const [pagina, setPagina] = useState(0);
    const itensPorPagina = 12;

    const itemsSeguros = secao.items || [];
    const itensExibidos = itemsSeguros.slice(
        pagina * itensPorPagina,
        (pagina + 1) * itensPorPagina
    );

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b-[2.5px] border-[#1b85db] pb-1 px-2">
                <h3 className="text-[#1b85db] text-[16px] font-black uppercase tracking-[0.2em]">
                    {secao.titulo}
                </h3>
                <PaginacaoDash
                    total={itemsSeguros.length}
                    atual={pagina}
                    setPagina={setPagina}
                    itensPorPagina={itensPorPagina}
                />
            </div>

            <div className="flex flex-col gap-8 mb-4 px-2 min-h-[400px]">
                {itemsSeguros.length === 0 ? (
                    <p className="text-[12px] text-gray-400 italic">Nenhum registro encontrado...</p>
                ) : (
                    itensExibidos.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 group cursor-pointer transition-opacity hover:opacity-70"
                        >
                            <div className="size-[70px] bg-[#ced4da] flex-shrink-0" />
                            <div className="flex flex-col text-left">
                                <h4 className="text-[12px] font-bold text-black uppercase leading-tight font-['Open_Sans',serif] group-hover:text-[#3800df] transition-colors">
                                    {item.nome}
                                </h4>
                                <p className="text-[11px] text-[#8a8a8a] font-medium mt-1 leading-snug font-['Raleway',sans-serif]">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-5 border-t-[2.5px] border-[#1b85db] pt-3 px-2">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(secao.path)}
                        className="text-[13px] font-black text-black uppercase tracking-[0.3em] hover:text-[#3800df] transition-all cursor-pointer bg-transparent border-none p-0"
                    >
                        VEJA MAIS
                    </button>
                    <PaginacaoDash
                        total={itemsSeguros.length}
                        atual={pagina}
                        setPagina={setPagina}
                        itensPorPagina={itensPorPagina}
                    />
                </div>
            </div>
        </div>
    );
}