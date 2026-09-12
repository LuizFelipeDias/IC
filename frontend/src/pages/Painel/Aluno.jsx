import React, { useState } from "react";
import {
    Search as SearchIcon,
    ChevronLeft,
    ChevronRight
} from '@mui/icons-material';
import {
    Table, TableBody, TableCell, TableContainer, TableRow,
    IconButton, TextField, InputAdornment
} from '@mui/material';

// --- COMPONENTE DE BUSCA (IDENTIDADE CLEAN) ---
const TableSearch = ({ placeholder }) => (
    <TextField
        variant="outlined"
        placeholder={placeholder}
        size="small"
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#d1d1d1', fontSize: 18 }} />
                </InputAdornment>
            ),
        }}
        sx={{
            width: '100%', maxWidth: '180px',
            '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                fontFamily: 'Inter',
                fontSize: '11px',
                height: '35px',
                backgroundColor: '#fff',
                '& fieldset': { borderColor: '#eeeeee' },
                '&:hover fieldset': { borderColor: '#3800df' },
                '&.Mui-focused fieldset': { borderColor: '#3800df', borderWidth: '1px' },
            }
        }}
    />
);

export default function DashboardLuluMaster() {
    const [page1, setPage1] = useState(1);
    const [page2, setPage2] = useState(1);

    const cargos = [
        'ANALISTA DE DADOS SÊNIOR', 'DESIGNER UI/UX LEAD', 'DEV FRONTEND REACT',
        'ENGENHEIRO 3D BLENDER', 'PRODUCT OWNER MOBILE', 'DATA SCIENTIST SÊNIOR',
        'BACKEND NODE.JS', 'DEVOPS ENGINEER AWS', 'GESTOR DE TRÁFEGO PAGO',
        'TECH RECRUITER', 'COPYWRITER CREATIVE', 'AGILE COACH PLENO',
        'ESPECIALISTA EM SEO', 'UX RESEARCHER', 'QA ENGINEER AUTOMATION'
    ];

    const gerarVagas = (prefixo, localInvertido = false) => cargos.map((cargo, i) => ({
        id: i,
        cargo: `${prefixo} - ${cargo}`,
        local: localInvertido ? (i % 2 !== 0 ? 'EUA' : 'REMOTO') : (i % 2 === 0 ? 'EUA' : 'REMOTO')
    }));

    const criadas = gerarVagas('Vaga Criada');
    const arquivadas = gerarVagas('Vaga Arq.', true);

    return (
        <div className="min-h-screen bg-white p-4 sm:p-6 md:p-10 font-['Inter',sans-serif] text-black">
            <div className="max-w-[1600px] mx-auto">

                {/* 1. SEÇÃO CADASTRAR */}
                <div className="w-full flex flex-col items-center mb-10 md:mb-16">
                    <h2 className="text-[22px] md:text-[30px] font-extralight mb-4 md:mb-6 tracking-tighter text-gray-400 uppercase italic text-center">
                        Cadastrar
                    </h2>
                    <button className="group relative px-12 md:px-20 h-[45px] md:h-[55px] border-2 border-black text-black font-black text-[11px] md:text-[13px] uppercase tracking-[0.3em] md:tracking-[0.4em] overflow-hidden transition-all duration-500 hover:text-white hover:border-[#3800df]">
                        <span className="relative z-10">Clique Aqui</span>
                        <div className="absolute inset-0 bg-[#3800df] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                    </button>
                </div>

                {/* 2. TÍTULO VAGAS */}
                <div className="w-full text-center mb-8 md:mb-12 relative">
                    <h2 className="text-[20px] md:text-[26px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-black relative z-10 bg-white px-4 md:px-8 inline-block">
                        Vagas
                    </h2>
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#f0f0f0] -z-0" />
                </div>

                {/* 3. GRID DE TABELAS */}
                {/* Gap responsivo: menor no mobile (gap-y-10), maior no desktop (gap-y-16) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 lg:gap-y-16 flex-1 items-start">

                    {/* TABELA: VAGAS CRIADAS */}
                    <section className="flex flex-col h-full w-full overflow-hidden">
                        {/* CABEÇALHO: Empilha no celular se precisar (flex-col sm:flex-row) */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1 min-h-[40px] gap-3 sm:gap-0">
                            <h3 className="text-[13px] md:text-[14px] font-black uppercase tracking-[0.2em] text-[#3800df] leading-none">
                                Vagas Criadas
                            </h3>
                            <TableSearch placeholder="Filtrar..." />
                        </div>

                        <TableContainer className="border border-[#f0f0f0] bg-white flex-1 overflow-x-auto">
                            <Table size="small" stickyHeader sx={{ minWidth: 400 }}>
                                <TableBody>
                                    {criadas.map((row) => (
                                        <TableRow key={row.id} className="group cursor-pointer">
                                            <TableCell sx={{
                                                py: 2, px: 3, fontWeight: '500', fontSize: '12.5px', borderBottom: '1px solid #fcfcfc',
                                                fontFamily: "'Inter', sans-serif", color: '#444',
                                                transition: 'all 0.3s',
                                                '.group:hover &': { color: '#3800df', transform: 'translateX(8px)' }
                                            }}>
                                                {row.cargo}
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 2, px: 3, borderBottom: '1px solid #fcfcfc' }}>
                                                <span className="text-[9px] font-black bg-black text-white px-3 py-1 uppercase group-hover:bg-[#3800df] transition-colors whitespace-nowrap">
                                                    {row.local}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* PAGINAÇÃO: wrap para não quebrar layout em telas super pequenas */}
                            <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-[#f0f0f0] mt-auto bg-[#fafafa] gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-[#b0b0b0] uppercase tracking-widest">Ir para Página:</span>
                                    <input
                                        type="number" value={page1} onChange={(e) => setPage1(e.target.value)}
                                        className="w-[45px] h-[28px] border border-[#f0f0f0] text-center font-bold text-xs outline-none focus:border-[#3800df] bg-white"
                                    />
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #eeeeee' }}><ChevronLeft fontSize="small" /></IconButton>
                                    <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #eeeeee', bgcolor: 'white' }}><ChevronRight fontSize="small" /></IconButton>
                                </div>
                            </div>
                        </TableContainer>
                    </section>

                    {/* TABELA: VAGAS ARQUIVADAS */}
                    <section className="flex flex-col h-full w-full overflow-hidden">
                        {/* CABEÇALHO */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1 min-h-[40px] gap-3 sm:gap-0">
                            <h3 className="text-[13px] md:text-[14px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">
                                Vagas Arquivadas
                            </h3>
                            <TableSearch placeholder="Filtrar..." />
                        </div>

                        <TableContainer className="border border-[#f0f0f0] bg-white flex-1 overflow-x-auto">
                            <Table size="small" stickyHeader sx={{ minWidth: 400 }}>
                                <TableBody>
                                    {arquivadas.map((row) => (
                                        <TableRow key={row.id} className="group cursor-pointer">
                                            <TableCell sx={{
                                                py: 2, px: 3, fontWeight: '400', fontSize: '12.5px', borderBottom: '1px solid #fcfcfc', color: '#ccc',
                                                fontFamily: "'Inter', sans-serif",
                                                transition: 'all 0.3s',
                                                '.group:hover &': { color: '#000', transform: 'translateX(8px)' }
                                            }}>
                                                {row.cargo}
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 2, px: 3, borderBottom: '1px solid #fcfcfc' }}>
                                                <span className="text-[8px] font-medium border border-[#eee] px-2 py-0.5 uppercase text-[#ccc] whitespace-nowrap">
                                                    Arquivada
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* PAGINAÇÃO */}
                            <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-[#f0f0f0] mt-auto bg-[#fafafa] gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-[#b0b0b0] uppercase tracking-widest">Página:</span>
                                    <input
                                        type="number" value={page2} onChange={(e) => setPage2(e.target.value)}
                                        className="w-[45px] h-[28px] border border-[#f0f0f0] text-center font-bold text-xs outline-none focus:border-black bg-white"
                                    />
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #eeeeee' }}><ChevronLeft fontSize="small" /></IconButton>
                                    <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #eeeeee', bgcolor: 'white' }}><ChevronRight fontSize="small" /></IconButton>
                                </div>
                            </div>
                        </TableContainer>
                    </section>

                </div>
            </div>
        </div>
    );
}