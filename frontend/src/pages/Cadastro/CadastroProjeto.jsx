import React, { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import {
    PictureAsPdf as PdfIcon,
    Delete as DeleteIcon,
    Image as ImageIcon,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";

// --- COMPONENTE DE INPUT CUSTOMIZADO ---
const CustomInput = ({
                         label,
                         placeholder,
                         multiline = false,
                         height = "55px",
                     }) => (
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

const IMAGENS_ANEXADAS = [
    { nome: "IMAGEM_PROJETO_1.PNG", tamanho: "1.5 MB" },
    { nome: "DIAGRAMA_SISTEMA.JPG", tamanho: "2.2 MB" },
];

export default function Group() {
    const [emblaRef] = useEmblaCarousel(
        { loop: true, align: "start" },
        [AutoScroll({ speed: 1, stopOnInteraction: false })],
    );

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 font-['Inter',sans-serif] text-black max-w-[1280px] mx-auto overflow-x-hidden">
            {/* HEADER CORRESPONDENTE AO "ESCREVA SEU PROJETO" */}
            <header className="mb-16 border-b border-[#f0f0f0] pb-8">
                <h1 className="text-[28px] font-black uppercase tracking-[0.2em] text-black mb-2">
                    ESCREVA SEU{" "}
                    <span className="text-[#3800df]">PROJETO</span>
                </h1>
                <p className="text-[11px] text-[#858585] font-black uppercase tracking-[0.4em]">
                    Painel de Criação e Edição de Conteúdo
                </p>
            </header>

            <div className="flex flex-col gap-10">
                {/* GRID PRINCIPAL (40/60) */}
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* COLUNA ESQUERDA - AUTOR, DATA, TÍTULO, TEMA, EMPRESA, PROFISSÃO */}
                    <div className="flex-[0.4] flex flex-col">
                        <CustomInput
                            label="AUTOR"
                            placeholder="Nome do autor do projeto"
                        />
                        <CustomInput
                            label="DATA"
                            placeholder="DD/MM/AAAA"
                        />
                        <CustomInput
                            label="TÍTULO"
                            placeholder="Título principal do projeto"
                        />
                        <CustomInput
                            label="TEMA"
                            placeholder="Tema ou categoria"
                        />
                        <CustomInput
                            label="EMPRESA"
                            placeholder="Nome da empresa"
                        />
                        <CustomInput
                            label="PROFISSÃO"
                            placeholder="Sua profissão / Cargo"
                        />
                    </div>

                    {/* COLUNA DIREITA - DESCRIÇÃO */}
                    <div className="flex-[0.6]">
                        <CustomInput
                            label="DESCRIÇÃO"
                            placeholder="Breve descrição do projeto..."
                            multiline
                            height="450px"
                        />
                    </div>
                </div>

                {/* ÁREA DE UPLOAD - ANEXAR IMAGENS */}
                <div className="w-full">
                    <div className="border-[1.5px] border-[#d1d1d1] border-dashed p-8 flex flex-col items-center justify-center bg-gray-50/20 hover:border-[#3800df] transition-colors cursor-pointer group w-full">
                        <ImageIcon
                            sx={{
                                color: "#d1d1d1",
                                mb: 1,
                                fontSize: 32,
                                ".group:hover &": { color: "#3800df" },
                            }}
                        />
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#858585]">
              Anexar Imagens
            </span>
                    </div>
                </div>

                {/* CARROSSEL DE ARQUIVOS INFINITO (LISTANDO IMAGENS ANEXADAS) */}
                <div className="overflow-hidden mb-6" ref={emblaRef}>
                    <div className="flex -ml-4">
                        {IMAGENS_ANEXADAS.concat(IMAGENS_ANEXADAS).map(
                            (file, index) => (
                                <div
                                    key={index}
                                    className="flex-[0_0_300px] pl-4"
                                >
                                    <div className="bg-white border border-[#d1d1d1] p-5 flex items-center justify-between hover:border-[#3800df] transition-all group">
                                        <div className="flex items-center gap-4">
                                            <PdfIcon
                                                sx={{ color: "#3800df", fontSize: 26 }}
                                            />
                                            <div className="flex flex-col overflow-hidden">
                        <span className="text-[11px] font-black uppercase truncate w-[160px]">
                          {file.nome}
                        </span>
                                                <span className="text-[9px] text-gray-400 font-bold">
                          {file.tamanho}
                        </span>
                                            </div>
                                        </div>
                                        <IconButton size="small">
                                            <DeleteIcon
                                                sx={{ fontSize: 18, color: "#ff4d4f" }}
                                            />
                                        </IconButton>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>

                {/* CONTEÚDO FINAL - TEXTO */}
                <CustomInput
                    label="TEXTO"
                    placeholder="Escreva o texto completo do seu projeto aqui..."
                    multiline
                    height="550px"
                />

                {/* BOTÃO ENVIAR CENTRALIZADO */}
                <div className="flex flex-col items-center mt-12 py-16 border-t border-[#f0f0f0] w-full">
                    <button className="w-full max-w-[480px] h-[70px] bg-[#3800df] text-white font-black text-[14px] uppercase tracking-[0.4em] flex items-center justify-center hover:bg-black transition-all duration-500 shadow-[0_20px_50px_rgba(56,0,223,0.2)] active:scale-95 outline-none">
                        PUBLICAR PROJETO
                    </button>
                    <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-[0.2em] font-bold">
                        Resolução recomendada: 1280 x 1600 px
                    </p>
                </div>
            </div>
        </div>
    );
}