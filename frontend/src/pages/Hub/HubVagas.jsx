// import React, { useState } from "react";
// import useEmblaCarousel from "embla-carousel-react";
// import AutoScroll from "embla-carousel-auto-scroll";
// import {
//     PictureAsPdf as PdfIcon,
//     Delete as DeleteIcon,
//     CloudUpload as CloudUploadIcon,
//     Search as SearchIcon,
//     ChevronLeft,
//     ChevronRight
// } from '@mui/icons-material';
// import {
//     Box, Table, TableBody, TableCell, TableContainer, TableRow,
//     IconButton, Button, TextField, InputAdornment
// } from '@mui/material';
//
// // --- COMPONENTE DE INPUT ---
// const CustomInput = ({ label, placeholder }) => (
//     <div className="input-group relative w-full mb-6">
//         <label className="absolute -top-2.5 left-2 bg-white px-1.5 text-[11px] text-[#858585] z-10 font-bold uppercase tracking-widest leading-none">
//             {label}
//         </label>
//         <input
//             type="text"
//             placeholder={placeholder}
//             className="w-full h-[55px] border-[1.5px] border-[#d1d1d1] px-4 outline-none focus:border-[#3800df] transition-colors font-['Inter'] text-sm"
//         />
//     </div>
// );
//
// // --- COMPONENTE DE BUSCA PARA TABELAS ---
// const TableSearch = ({ placeholder }) => (
//     <TextField
//         variant="outlined"
//         placeholder={placeholder}
//         size="small"
//         InputProps={{
//             startAdornment: (
//                 <InputAdornment position="start">
//                     <SearchIcon sx={{ color: '#d1d1d1', fontSize: 20 }} />
//                 </InputAdornment>
//             ),
//         }}
//         sx={{
//             width: '100%', maxWidth: '250px',
//             '& .MuiOutlinedInput-root': {
//                 borderRadius: 0,
//                 fontFamily: 'Inter',
//                 fontSize: '12px',
//                 '& fieldset': { borderColor: '#d1d1d1' },
//                 '&:hover fieldset': { borderColor: '#3800df' },
//                 '&.Mui-focused fieldset': { borderColor: '#3800df', borderWidth: '1.5px' },
//             }
//         }}
//     />
// );
//
// const PDFS_ANEXADOS = [
//     { nome: "CERTIFICADO_REACT.PDF", tamanho: "1.2 MB" },
//     { nome: "DIPLOMA_GRADUACAO.PDF", tamanho: "2.5 MB" },
//     { nome: "CURSO_UX_DESIGN.PDF", tamanho: "800 KB" },
//     { nome: "INGLES_AVANCADO.PDF", tamanho: "1.1 MB" },
// ];
//
// export default function DashboardLuluMaster() {
//     const [emblaRef] = useEmblaCarousel({
//         loop: true,
//         align: "start",
//         containScroll: "trimSnaps"
//     }, [AutoScroll({ speed: 1, stopOnInteraction: false, playOnInit: true })]);
//
//     const rows = [
//         { cargo: 'ANALISTA DE DADOS', local: 'EUA' },
//         { cargo: 'DESIGNER UI/UX', local: 'REMOTO' },
//         { cargo: 'DEV FRONTEND REACT', local: 'HÍBRIDO' },
//         { cargo: 'ENGENHEIRO 3D', local: 'SÃO PAULO' },
//         { cargo: 'PRODUCT OWNER', local: 'REMOTO' },
//     ];
//
//     return (
//         <div className="min-h-screen bg-white p-6 md:p-12 font-['Inter',sans-serif] text-black max-w-[1400px] mx-auto">
//
//             {/* 1. CHAMADA DE CADASTRO NO TOPO */}
//             <div className="w-full border-b border-[#f0f0f0] pb-10 mb-12 flex flex-col items-center text-center">
//                 <p className="text-[#858585] font-medium text-lg mb-4 italic">Deseja cadastrar seu currículo?</p>
//                 <button className="px-16 h-[55px] bg-[#3800df] text-white font-black text-[13px] uppercase tracking-[0.3em] hover:bg-black hover:tracking-[0.4em] transition-all duration-500 shadow-xl">
//                     Clique Aqui
//                 </button>
//             </div>
//
//             {/* 2. FORMULÁRIO E CURRÍCULO PAREADOS */}
//             <div className="flex flex-col lg:flex-row gap-16 mb-16 items-stretch">
//                 <div className="flex-[0.8] flex flex-col">
//                     <div className="flex flex-col gap-2">
//                         <CustomInput label="NOME COMPLETO" placeholder="Luluzinha da Silva" />
//                         <CustomInput label="PROFISSÃO" placeholder="Designer de Interfaces" />
//                         <CustomInput label="NÚMERO" placeholder="(00) 99999-9999" />
//                     </div>
//                     <button className="w-full h-[55px] bg-[#3800df] text-white font-black text-sm flex items-center justify-center hover:bg-black transition-all uppercase tracking-[0.2em] shadow-lg mt-2">
//                         ENVIAR DADOS
//                     </button>
//                 </div>
//
//                 <div className="flex-1 flex flex-col">
//                     <label className="text-[11px] font-bold text-[#858585] uppercase tracking-widest mb-3 block leading-none">
//                         SEU CURRÍCULO MODELADO
//                     </label>
//                     <div className="flex-1 border-[1.5px] border-[#d1d1d1] bg-gray-50/20 p-8 flex flex-col gap-6 relative overflow-hidden">
//                         <div className="absolute top-0 right-0 w-16 h-16 bg-[#3800df]/5 -rotate-45 translate-x-8 -translate-y-8" />
//                         <div className="h-6 bg-gray-200 w-1/3 mb-4" />
//                         <div className="space-y-3">
//                             {[1, 2, 3].map(i => <div key={i} className="h-2 bg-gray-100 w-full" />)}
//                         </div>
//                         <div className="mt-auto flex justify-between items-end">
//                             <div className="h-4 bg-gray-200 w-24" />
//                             <div className="text-[10px] font-bold text-[#3800df] tracking-widest uppercase">Página 1/1</div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             {/* 3. ANEXOS COM CARROSSEL CORRIGIDO */}
//             <section className="mb-20">
//                 <h2 className="text-[15px] font-black uppercase tracking-[0.3em] mb-4 text-black leading-none">ANEXOS E CERTIFICADOS</h2>
//                 <div className="border-[1.5px] border-[#d1d1d1] border-dashed p-10 flex flex-col items-center justify-center bg-white mb-6 hover:bg-gray-50 transition-colors cursor-pointer group">
//                     <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}
//                             sx={{ borderColor: '#3800df', color: '#3800df', fontWeight: '900', borderRadius: 0, px: 6, py: 2, '&:hover': { bgcolor: '#3800df', color: 'white', borderColor: '#3800df'} }}>
//                         ANEXAR ARQUIVOS
//                         <input type="file" hidden multiple />
//                     </Button>
//                 </div>
//
//                 {/* CARROSSEL SEM JUNCÃO */}
//                 <div className="overflow-hidden px-1" ref={emblaRef}>
//                     <div className="flex -ml-4"> {/* Margem negativa para compensar o gap interno */}
//                         {PDFS_ANEXADOS.concat(PDFS_ANEXADOS).map((file, index) => (
//                             <div key={index} className="flex-[0_0_300px] min-w-0 pl-4 transition-all">
//                                 <div className="bg-white border border-[#d1d1d1] p-5 flex items-center justify-between group hover:border-[#3800df] hover:shadow-lg h-[80px]">
//                                     <div className="flex items-center gap-4 overflow-hidden">
//                                         <PdfIcon sx={{ color: '#3800df', fontSize: 28, flexShrink: 0 }} />
//                                         <div className="flex flex-col overflow-hidden">
//                                             <span className="text-[11px] font-black uppercase truncate w-full">{file.nome}</span>
//                                             <span className="text-[9px] text-[#858585] font-bold">{file.tamanho}</span>
//                                         </div>
//                                     </div>
//                                     <IconButton size="small" className="opacity-0 group-hover:opacity-100 transition-opacity">
//                                         <DeleteIcon fontSize="small" sx={{ color: '#ff4d4f' }} />
//                                     </IconButton>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>
//
//             {/* 4. SEÇÃO VAGAS - TÍTULOS MAIS PRÓXIMOS */}
//             <div className="w-full text-center mb-10 relative">
//                 <h2 className="text-[26px] font-black uppercase tracking-[0.6em] text-black relative z-10 bg-white px-8 inline-block">VAGAS</h2>
//                 <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-[#f0f0f0] -z-0" />
//             </div>
//
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
//                 {['GAS (CANDIDATADAS)', 'DISPONÍVEIS'].map((title) => (
//                     <section key={title} className="flex flex-col">
//                         <div className="flex flex-row justify-between items-center mb-3 gap-4">
//                             <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#3800df] whitespace-nowrap">{title}</h3>
//                             <TableSearch placeholder="Filtrar..." />
//                         </div>
//
//                         <TableContainer className="border-[1.5px] border-[#d1d1d1] bg-white shadow-sm">
//                             <Table size="medium">
//                                 <TableBody>
//                                     {rows.map((row, i) => (
//                                         <TableRow key={i} sx={{
//                                             transition: 'all 0.2s',
//                                             cursor: 'pointer',
//                                             borderLeft: '4px solid transparent',
//                                             '&:hover': { borderLeft: '4px solid #3800df', bgcolor: '#fbfbff', '& .cargo-text': { color: '#3800df' } }
//                                         }}>
//                                             <TableCell className="cargo-text" sx={{ py: 2.5, px: 4, fontWeight: '900', fontSize: '15px', borderBottom: '1px solid #f0f0f0', transition: 'color 0.2s' }}>
//                                                 {row.cargo}
//                                             </TableCell>
//                                             <TableCell align="right" sx={{ py: 2.5, px: 4, borderBottom: '1px solid #f0f0f0' }}>
//                         <span className={`${row.local === 'EUA' ? 'bg-[#3800df]' : 'bg-black'} text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-tighter`}>
//                           {row.local}
//                         </span>
//                                             </TableCell>
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                             <div className="flex justify-between items-center px-6 py-4 bg-gray-50/50 border-t border-[#f0f0f0]">
//                                 <span className="text-[10px] font-bold text-[#858585] uppercase tracking-widest leading-none">1-10 de 45 vagas</span>
//                                 <div className="flex gap-1">
//                                     <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #d1d1d1' }}><ChevronLeft fontSize="small" /></IconButton>
//                                     <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #d1d1d1', bgcolor: 'white' }}><ChevronRight fontSize="small" /></IconButton>
//                                 </div>
//                             </div>
//                         </TableContainer>
//                     </section>
//                 ))}
//             </div>
//         </div>
//     );
// }import React, { useState } from "react";
// import {
//     Search as SearchIcon,
//     ChevronLeft,
//     ChevronRight
// } from '@mui/icons-material';
// import {
//     Table, TableBody, TableCell, TableContainer, TableRow,
//     IconButton, TextField, InputAdornment
// } from '@mui/material';
//
// // --- COMPONENTE DE BUSCA (IDENTIDADE CLEAN) ---
// const TableSearch = ({ placeholder }) => (
//     <TextField
//         variant="outlined"
//         placeholder={placeholder}
//         size="small"
//         InputProps={{
//             startAdornment: (
//                 <InputAdornment position="start">
//                     <SearchIcon sx={{ color: '#d1d1d1', fontSize: 18 }} />
//                 </InputAdornment>
//             ),
//         }}
//         sx={{
//             width: '100%', maxWidth: '180px',
//             '& .MuiOutlinedInput-root': {
//                 borderRadius: 0,
//                 fontFamily: 'Inter',
//                 fontSize: '11px',
//                 height: '35px',
//                 backgroundColor: '#fff',
//                 '& fieldset': { borderColor: '#eeeeee' },
//                 '&:hover fieldset': { borderColor: '#3800df' },
//                 '&.Mui-focused fieldset': { borderColor: '#3800df', borderWidth: '1px' },
//             }
//         }}
//     />
// );
//
// export default function DashboardLuluMaster() {
//     const [page1, setPage1] = useState(1);
//     const [page2, setPage2] = useState(1);
//
//     const cargos = [
//         'ANALISTA DE DADOS SÊNIOR', 'DESIGNER UI/UX LEAD', 'DEV FRONTEND REACT',
//         'ENGENHEIRO 3D BLENDER', 'PRODUCT OWNER MOBILE', 'DATA SCIENTIST SÊNIOR',
//         'BACKEND NODE.JS', 'DEVOPS ENGINEER AWS', 'GESTOR DE TRÁFEGO PAGO',
//         'TECH RECRUITER', 'COPYWRITER CREATIVE', 'AGILE COACH PLENO',
//         'ESPECIALISTA EM SEO', 'UX RESEARCHER', 'QA ENGINEER AUTOMATION'
//     ];
//
//     const gerarVagas = (prefixo, localInvertido = false) => cargos.map((cargo, i) => ({
//         id: i,
//         cargo: `${prefixo} - ${cargo}`,
//         local: localInvertido ? (i % 2 !== 0 ? 'EUA' : 'REMOTO') : (i % 2 === 0 ? 'EUA' : 'REMOTO')
//     }));
//
//     const criadas = gerarVagas('Vaga Criada');
//     const arquivadas = gerarVagas('Vaga Arq.', true);
//
//     return (
//         <div className="min-h-screen bg-white p-4 sm:p-6 md:p-10 font-['Inter',sans-serif] text-black">
//             <div className="max-w-[1600px] mx-auto">
//
//                 {/* 1. SEÇÃO CADASTRAR */}
//                 <div className="w-full flex flex-col items-center mb-10 md:mb-16">
//                     <h2 className="text-[22px] md:text-[30px] font-extralight mb-4 md:mb-6 tracking-tighter text-gray-400 uppercase italic text-center">
//                         Cadastrar
//                     </h2>
//                     <button className="group relative px-12 md:px-20 h-[45px] md:h-[55px] border-2 border-black text-black font-black text-[11px] md:text-[13px] uppercase tracking-[0.3em] md:tracking-[0.4em] overflow-hidden transition-all duration-500 hover:text-white hover:border-[#3800df]">
//                         <span className="relative z-10">Clique Aqui</span>
//                         <div className="absolute inset-0 bg-[#3800df] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
//                     </button>
//                 </div>
//
//                 {/* 2. TÍTULO VAGAS */}
//                 <div className="w-full text-center mb-8 md:mb-12 relative">
//                     <h2 className="text-[20px] md:text-[26px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-black relative z-10 bg-white px-4 md:px-8 inline-block">
//                         Vagas
//                     </h2>
//                     <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#f0f0f0] -z-0" />
//                 </div>
//
//                 {/* 3. GRID DE TABELAS */}
//                 {/* Gap responsivo: menor no mobile (gap-y-10), maior no desktop (gap-y-16) */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 lg:gap-y-16 flex-1 items-start">
//
//                     {/* TABELA: VAGAS CRIADAS */}
//                     <section className="flex flex-col h-full w-full overflow-hidden">
//                         {/* CABEÇALHO: Empilha no celular se precisar (flex-col sm:flex-row) */}
//                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1 min-h-[40px] gap-3 sm:gap-0">
//                             <h3 className="text-[13px] md:text-[14px] font-black uppercase tracking-[0.2em] text-[#3800df] leading-none">
//                                 Vagas Criadas
//                             </h3>
//                             <TableSearch placeholder="Filtrar..." />
//                         </div>
//
//                         <TableContainer className="border border-[#f0f0f0] bg-white flex-1 overflow-x-auto">
//                             <Table size="small" stickyHeader sx={{ minWidth: 400 }}>
//                                 <TableBody>
//                                     {criadas.map((row) => (
//                                         <TableRow key={row.id} className="group cursor-pointer">
//                                             <TableCell sx={{
//                                                 py: 2, px: 3, fontWeight: '500', fontSize: '12.5px', borderBottom: '1px solid #fcfcfc',
//                                                 fontFamily: "'Inter', sans-serif", color: '#444',
//                                                 transition: 'all 0.3s',
//                                                 '.group:hover &': { color: '#3800df', transform: 'translateX(8px)' }
//                                             }}>
//                                                 {row.cargo}
//                                             </TableCell>
//                                             <TableCell align="right" sx={{ py: 2, px: 3, borderBottom: '1px solid #fcfcfc' }}>
//                                                 <span className="text-[9px] font-black bg-black text-white px-3 py-1 uppercase group-hover:bg-[#3800df] transition-colors whitespace-nowrap">
//                                                     {row.local}
//                                                 </span>
//                                             </TableCell>
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//
//                             {/* PAGINAÇÃO: wrap para não quebrar layout em telas super pequenas */}
//                             <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-[#f0f0f0] mt-auto bg-[#fafafa] gap-3">
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-[9px] font-bold text-[#b0b0b0] uppercase tracking-widest">Ir para Página:</span>
//                                     <input
//                                         type="number" value={page1} onChange={(e) => setPage1(e.target.value)}
//                                         className="w-[45px] h-[28px] border border-[#f0f0f0] text-center font-bold text-xs outline-none focus:border-[#3800df] bg-white"
//                                     />
//                                 </div>
//                                 <div className="flex gap-1 shrink-0">
//                                     <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #eeeeee' }}><ChevronLeft fontSize="small" /></IconButton>
//                                     <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #eeeeee', bgcolor: 'white' }}><ChevronRight fontSize="small" /></IconButton>
//                                 </div>
//                             </div>
//                         </TableContainer>
//                     </section>
//
//                     {/* TABELA: VAGAS ARQUIVADAS */}
//                     <section className="flex flex-col h-full w-full overflow-hidden">
//                         {/* CABEÇALHO */}
//                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1 min-h-[40px] gap-3 sm:gap-0">
//                             <h3 className="text-[13px] md:text-[14px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">
//                                 Vagas Arquivadas
//                             </h3>
//                             <TableSearch placeholder="Filtrar..." />
//                         </div>
//
//                         <TableContainer className="border border-[#f0f0f0] bg-white flex-1 overflow-x-auto">
//                             <Table size="small" stickyHeader sx={{ minWidth: 400 }}>
//                                 <TableBody>
//                                     {arquivadas.map((row) => (
//                                         <TableRow key={row.id} className="group cursor-pointer">
//                                             <TableCell sx={{
//                                                 py: 2, px: 3, fontWeight: '400', fontSize: '12.5px', borderBottom: '1px solid #fcfcfc', color: '#ccc',
//                                                 fontFamily: "'Inter', sans-serif",
//                                                 transition: 'all 0.3s',
//                                                 '.group:hover &': { color: '#000', transform: 'translateX(8px)' }
//                                             }}>
//                                                 {row.cargo}
//                                             </TableCell>
//                                             <TableCell align="right" sx={{ py: 2, px: 3, borderBottom: '1px solid #fcfcfc' }}>
//                                                 <span className="text-[8px] font-medium border border-[#eee] px-2 py-0.5 uppercase text-[#ccc] whitespace-nowrap">
//                                                     Arquivada
//                                                 </span>
//                                             </TableCell>
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//
//                             {/* PAGINAÇÃO */}
//                             <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-[#f0f0f0] mt-auto bg-[#fafafa] gap-3">
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-[9px] font-bold text-[#b0b0b0] uppercase tracking-widest">Página:</span>
//                                     <input
//                                         type="number" value={page2} onChange={(e) => setPage2(e.target.value)}
//                                         className="w-[45px] h-[28px] border border-[#f0f0f0] text-center font-bold text-xs outline-none focus:border-black bg-white"
//                                     />
//                                 </div>
//                                 <div className="flex gap-1 shrink-0">
//                                     <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #eeeeee' }}><ChevronLeft fontSize="small" /></IconButton>
//                                     <IconButton size="small" sx={{ borderRadius: 0, border: '1px solid #eeeeee', bgcolor: 'white' }}><ChevronRight fontSize="small" /></IconButton>
//                                 </div>
//                             </div>
//                         </TableContainer>
//                     </section>
//
//                 </div>
//             </div>
//         </div>
//     );
// }