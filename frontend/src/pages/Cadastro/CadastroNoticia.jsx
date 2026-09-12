import React, { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import {
    PictureAsPdf as PdfIcon,
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import { IconButton } from '@mui/material';

// --- COMPONENTE DE INPUT NAMEDLY ---
const CustomInput = ({ label, placeholder, multiline = false, height = "55px" }) => (
    <div className="input-group relative w-full mb-6">
        <label className="absolute -top-2.5 left-2 bg-white px-1.5 text-[11px] text-[#858585] z-10 font-bold uppercase tracking-widest leading-none">
            {label}
        </label>
        {multiline ? (
            <textarea
                placeholder={placeholder}
                className="w-full border-[1.5px] border-[#d1d1d1] p-4 outline-none focus:border-[#3800df] transition-colors font-['Inter'] text-sm resize-none"
                style={{ height }}
            />
        ) : (
            <input
                type="text"
                placeholder={placeholder}
                className="w-full h-[55px] border-[1.5px] border-[#d1d1d1] px-4 outline-none focus:border-[#3800df] transition-colors font-['Inter'] text-sm"
            />
        )}
    </div>
);

// --- COMPONENTE DE COMPETÊNCIAS DINÂMICAS ---
const DynamicSkills = ({ label }) => {
    const [items, setItems] = useState(["React", "3D Design"]);
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            setItems([...items, inputValue.trim()]);
            setInputValue("");
        }
    };

    return (
        <div className="input-group relative w-full mb-6 border-[1.5px] border-[#d1d1d1] p-4 pt-7 focus-within:border-[#3800df] transition-colors">
            <label className="absolute -top-2.5 left-2 bg-white px-1.5 text-[11px] text-[#858585] z-10 font-bold uppercase tracking-widest leading-none">
                {label}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center bg-black text-white px-3 py-1 gap-2">
                        <span className="text-[10px] font-black uppercase tracking-tighter">{item}</span>
                        <button onClick={() => setItems(items.filter((_, i) => i !== index))}>
                            <CloseIcon sx={{ fontSize: 12, color: '#fff' }} />
                        </button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Adicionar competência (Enter)..."
                className="w-full outline-none font-['Inter'] text-[12px] uppercase tracking-wider"
            />
        </div>
    );
};

const PDFS_ANEXADOS = [
    { nome: "DETALHES_VAGA.PDF", tamanho: "1.2 MB" },
    { nome: "LAYOUT_PROJETO.PNG", tamanho: "2.5 MB" },
    { nome: "CONTRATO_MODELO.PDF", tamanho: "800 KB" },
];

export default function Group() {
    const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
        AutoScroll({ speed: 1, stopOnInteraction: false })
    ]);

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 font-['Inter',sans-serif] text-black max-w-[1280px] mx-auto overflow-x-hidden">

            {/* HEADER - ESTILO PAINEL DE EDIÇÃO */}
            <header className="mb-16 border-b border-[#f0f0f0] pb-8">
                <h1 className="text-[28px] font-black uppercase tracking-[0.2em] text-black mb-2">
                    CADASTRO DE <span className="text-[#3800df]">NOTÍCIA</span>
                </h1>
                <p className="text-[11px] text-[#858585] font-black uppercase tracking-[0.4em]">
                    Painel de Edição de Perfil & Conteúdo
                </p>
            </header>

            <div className="flex flex-col gap-10">

                {/* GRID PRINCIPAL (40/60) */}
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* COLUNA ESQUERDA - INPUTS */}
                    <div className="flex-[0.4] flex flex-col">
                        <CustomInput label="TÍTULO DA VAGA" placeholder="Ex: Engenheiro de Software" />
                        <div className="grid grid-cols-2 gap-4">
                            <CustomInput label="DATA INÍCIO" placeholder="DD/MM/AAAA" />
                            <CustomInput label="DATA FIM" placeholder="DD/MM/AAAA" />
                        </div>
                        <DynamicSkills label="COMPETÊNCIAS / REQUISITOS" />
                        <CustomInput label="EMPRESA" placeholder="Unidade Namedly" />
                        <CustomInput label="RESPONSÁVEL" placeholder="Nome do Gestor" />
                    </div>

                    {/* COLUNA DIREITA - DESCRIÇÃO */}
                    <div className="flex-[0.6]">
                        <CustomInput label="DESCRIÇÃO DA VAGA" placeholder="Conteúdo da vaga..." multiline height="450px" />
                    </div>
                </div>

                {/* ÁREAS DE UPLOAD SEPARADAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-[1.5px] border-[#d1d1d1] border-dashed p-8 flex flex-col items-center justify-center bg-gray-50/20 hover:border-[#3800df] transition-colors cursor-pointer group">
                        <ImageIcon sx={{ color: '#d1d1d1', mb: 1, fontSize: 32, ".group:hover &": { color: "#3800df" } }} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#858585]">Anexar Imagens</span>
                    </div>
                    <div className="border-[1.5px] border-[#d1d1d1] border-dashed p-8 flex flex-col items-center justify-center bg-gray-50/20 hover:border-[#3800df] transition-colors cursor-pointer group">
                        <CloudUploadIcon sx={{ color: '#d1d1d1', mb: 1, fontSize: 32, ".group:hover &": { color: "#3800df" } }} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#858585]">Anexar Documentos</span>
                    </div>
                </div>

                {/* CARROSSEL DE ARQUIVOS INFINITO */}
                <div className="overflow-hidden mb-6" ref={emblaRef}>
                    <div className="flex -ml-4">
                        {PDFS_ANEXADOS.concat(PDFS_ANEXADOS).map((file, index) => (
                            <div key={index} className="flex-[0_0_300px] pl-4">
                                <div className="bg-white border border-[#d1d1d1] p-5 flex items-center justify-between hover:border-[#3800df] transition-all group">
                                    <div className="flex items-center gap-4">
                                        <PdfIcon sx={{ color: '#3800df', fontSize: 26 }} />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-[11px] font-black uppercase truncate w-[160px]">{file.nome}</span>
                                            <span className="text-[9px] text-gray-400 font-bold">{file.tamanho}</span>
                                        </div>
                                    </div>
                                    <IconButton size="small"><DeleteIcon sx={{ fontSize: 18, color: '#ff4d4f' }} /></IconButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTEÚDO FINAL */}
                <CustomInput label="CONTEÚDO ADICIONAL" placeholder="Informações complementares..." multiline height="280px" />

                {/* BOTÃO ENVIAR CENTRALIZADO */}
                <div className="flex flex-col items-center mt-12 py-16 border-t border-[#f0f0f0] w-full">
                    <button className="w-full max-w-[480px] h-[70px] bg-[#3800df] text-white font-black text-[14px] uppercase tracking-[0.4em] flex items-center justify-center hover:bg-black transition-all duration-500 shadow-[0_20px_50px_rgba(56,0,223,0.2)] active:scale-95 outline-none">
                        ENVIAR E PUBLICAR VAGA
                    </button>
                    <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-[0.2em] font-bold">
                        Resolução recomendada: 1280 x 1600 px
                    </p>
                </div>
            </div>
        </div>
    );
}