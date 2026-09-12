import React, { useState } from "react";

import { IconButton, Table, TableBody, TableCell,
        TableContainer, TableHead, TableRow, Paper,
        Select, MenuItem, Collapse, FormControlLabel,
        Checkbox } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";


const BubbleButton = ({ children, onClick }) => {
    return (
        <button
            className="bubbles group relative overflow-hidden cursor-pointer bg-transparent border-[3px] border-[#3800df] px-12 py-4 transition-all duration-300 active:scale-95 active:brightness-90 w-full max-w-[500px] flex items-center justify-center"
            onClick={onClick}
        >
            <span className="relative z-10 font-black text-[#3800df] uppercase tracking-[0.5em] text-[15px] group-hover:text-white transition-colors duration-700 font-['Inter',sans-serif] text-center">
                {children}
            </span>
            {/* Efeito de Bolhas */}
            <div className="absolute top-0 left-0 w-[150%] aspect-square bg-[#3800df] rounded-full -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]" />
            <div className="absolute top-full left-full w-[150%] aspect-square bg-[#3800df] rounded-full -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]" />
        </button>
    );
};


const CustomInput = ({ label, placeholder, type = "text", value, onChange, onAddClick }) => (
    <div className="flex items-center gap-2 font-['Inter',sans-serif] w-full">
        <div className="input-group relative flex-1">
            <label className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] text-[#858585] z-10 font-black uppercase tracking-[0.2em] border-x border-gray-50">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full h-[50px] border-[1.5px] border-[#d1d1d1] px-5 outline-none focus:border-[#3800df] transition-all font-medium text-[13px] uppercase tracking-[-0.02em]"
            />
        </div>
        {onAddClick && (
            <button onClick={onAddClick} className="group flex items-center justify-center p-2 bg-transparent cursor-pointer outline-none border-none shrink-0">
                <AddIcon className="transition-all duration-500 ease-out group-hover:rotate-90 group-hover:scale-125 group-hover:text-[#3800df]" sx={{ fontSize: 32, color: "#000" }} />
            </button>
        )}
    </div>
);


const CustomTextArea = ({ label, value, onChange }) => (
    <div className="input-group relative w-full font-['Inter',sans-serif]">
        <label className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] text-[#858585] z-10 font-black uppercase tracking-[0.2em] border-x border-gray-50">
            {label}
        </label>
        <textarea
            value={value}
            onChange={onChange}
            className="w-full min-h-[300px] md:min-h-[400px] border-[1.5px] border-[#d1d1d1] p-6 outline-none focus:border-[#3800df] transition-all font-medium text-[14px] uppercase resize-none leading-relaxed"
        />
    </div>
);

export default function LayoutLuluMaster() {
    const [isEstudante, setIsEstudante] = useState(false);
    const [formData, setFormData] = useState({
        nome: "",
        profissao: "",
        numero: "(00) 00000-0000",
        cpf: "000.000.000-00",
        email: "usuario@exemplo.com",
        sexo: "",
        faculdade: "",
        periodo: "",
        dataInicio: "",
        dataConclusao: "",
        resumo: "DESENVOLVEDOR FOCADO EM SOLUÇÕES INDUSTRIAIS E PESQUISA AVANÇADA DE PONTA...",
    });

    const [historico, setHistorico] = useState([{ cargo: "DEV FRONTEND", empresa: "TECH SOLUTIONS", inicio: "2022", termino: "ATUAL" }]);
    const [habilidades, setHabilidades] = useState(["REACT", "NODE.JS", "VHDL"]);
    const [competencias, setCompetencias] = useState(["LIDERANÇA", "GESTÃO"]);
    const [novaHab, setNovaHab] = useState("");
    const [novaComp, setNovaComp] = useState("");

    const handleUpdate = (field, val) => setFormData({ ...formData, [field]: val });

    return (
        <div className="flex flex-col min-h-screen bg-white font-['Inter',sans-serif] text-black pb-10 md:pb-20">
            {/* Ajuste nos paddings laterais (px-4 para mobile, px-8 para desktop) e gaps */}
            <main className="w-full max-w-[1000px] mx-auto py-10 px-4 sm:px-6 md:py-16 md:px-8 flex flex-col gap-10 md:gap-12 overflow-hidden">

                {/* HEADER CENTRALIZADO */}
                <header className="flex flex-col items-center text-center">
                    <p className="text-[11px] text-[#858585] font-black uppercase tracking-[0.4em]">
                        Painel de Edição de Perfil
                    </p>
                    <div className="w-12 h-[3px] bg-[#3800df] mt-4" />
                </header>

                {/* DADOS BÁSICOS */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                    <CustomInput label="NOME COMPLETO" value={formData.nome} onChange={(e) => handleUpdate("nome", e.target.value)} />
                    <CustomInput label="PROFISSÃO" value={formData.profissao} onChange={(e) => handleUpdate("profissao", e.target.value)} />
                    <CustomInput label="NÚMERO" value={formData.numero} onChange={(e) => handleUpdate("numero", e.target.value)} />
                    <CustomInput label="CPF" value={formData.cpf} onChange={(e) => handleUpdate("cpf", e.target.value)} />

                    <div className="relative w-full">
                        <label className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] text-[#858585] z-10 font-black uppercase tracking-[0.2em] border-x border-gray-50">SEXO</label>
                        <Select
                            value={formData.sexo}
                            onChange={(e) => handleUpdate("sexo", e.target.value)}
                            displayEmpty
                            className="w-full h-[50px]"
                            sx={{ borderRadius: "0", "& .MuiOutlinedInput-notchedOutline": { border: "1.5px solid #d1d1d1" }, "&:hover .MuiOutlinedInput-notchedOutline": { border: "1.5px solid #3800df" }, "& .MuiSelect-select": { fontSize: "13px", fontWeight: 600, textTransform: "uppercase" }}}
                        >
                            <MenuItem value="Masculino">Masculino</MenuItem>
                            <MenuItem value="Feminino">Feminino</MenuItem>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between px-5 h-[50px] border border-dashed border-[#d1d1d1]">
                        <span className="font-black text-[#858585] text-[10px] tracking-widest uppercase">Estudante?</span>
                        <FormControlLabel
                            control={<Checkbox icon={<CancelIcon sx={{ color: "#ff4d4f", fontSize: 28 }} />} checkedIcon={<CheckCircleIcon sx={{ color: "#52c41a", fontSize: 28 }} />} checked={isEstudante} onChange={(e) => setIsEstudante(e.target.checked)} />}
                            label="" sx={{ margin: 0 }}
                        />
                    </div>
                </section>

                {/* ESTUDANTE COLLAPSE */}
                <Collapse in={isEstudante}>
                    <div className="flex flex-col gap-5 md:gap-8 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
                            <CustomInput label="FACULDADE" value={formData.faculdade} onChange={(e) => handleUpdate("faculdade", e.target.value)} />
                            <CustomInput label="ANO/PERÍODO" value={formData.periodo} onChange={(e) => handleUpdate("periodo", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
                            <CustomInput label="DATA INÍCIO" placeholder="MM/AAAA" value={formData.dataInicio} onChange={(e) => handleUpdate("dataInicio", e.target.value)} />
                            <CustomInput label="DATA CONCLUSÃO" placeholder="MM/AAAA" value={formData.dataConclusao} onChange={(e) => handleUpdate("dataConclusao", e.target.value)} />
                        </div>
                    </div>
                </Collapse>

                {/* HISTÓRICO PROFISSIONAL */}
                <section className="flex flex-col gap-5 w-full overflow-hidden">
                    <div className="flex items-center justify-between border-b-2 border-[#1b85db] pb-2 px-1">
                        <h3 className="text-[#1b85db] text-[13px] md:text-[15px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">Histórico Profissional</h3>
                        <IconButton onClick={() => setHistorico([...historico, { cargo: "", empresa: "", inicio: "", termino: "" }])}>
                            <AddIcon sx={{ color: "black", fontSize: 28 }} />
                        </IconButton>
                    </div>

                    {/* Tabela com scroll horizontal no mobile garantido pelo sx minWidth */}
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: "1px solid #d1d1d1", overflowX: "auto" }}>
                        <Table size="small" sx={{ minWidth: 600 }}>
                            <TableHead sx={{ bgcolor: "#f9f9f9" }}>
                                <TableRow>
                                    {["Cargo", "Empresa", "Início", "TÉRMINO", ""].map((head) => (
                                        <TableCell key={head} sx={{ fontWeight: 900, fontSize: "10px", textTransform: "uppercase", py: 1.5, fontFamily: 'Inter' }}>{head}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historico.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ p: 1 }}><input className="w-full p-2 outline-none bg-transparent uppercase text-[11px] font-bold font-['Inter']" value={row.cargo} onChange={(e) => { const newHist = [...historico]; newHist[index].cargo = e.target.value; setHistorico(newHist); }} /></TableCell>
                                        <TableCell sx={{ p: 1 }}><input className="w-full p-2 outline-none bg-transparent uppercase text-[11px] font-bold font-['Inter']" value={row.empresa} onChange={(e) => { const newHist = [...historico]; newHist[index].empresa = e.target.value; setHistorico(newHist); }} /></TableCell>
                                        <TableCell sx={{ p: 1 }}><input className="w-full p-2 outline-none bg-transparent uppercase text-[11px] font-bold font-['Inter']" value={row.inicio} onChange={(e) => { const newHist = [...historico]; newHist[index].inicio = e.target.value; setHistorico(newHist); }} /></TableCell>
                                        <TableCell sx={{ p: 1 }}><input className="w-full p-2 outline-none bg-transparent uppercase text-[11px] font-bold font-['Inter']" value={row.termino} onChange={(e) => { const newHist = [...historico]; newHist[index].termino = e.target.value; setHistorico(newHist); }} /></TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => setHistorico(historico.filter((_, i) => i !== index))}>
                                                <DeleteIcon sx={{ fontSize: 16, color: "#ff4d4f" }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </section>

                {/* HABILIDADES E COMPETÊNCIAS */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[#1b85db] text-[13px] md:text-[15px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] border-b-2 border-[#1b85db] pb-2 px-1">Habilidades</h3>
                        <CustomInput label="Nova" value={novaHab} onChange={(e) => setNovaHab(e.target.value)} onAddClick={() => { if (novaHab) { setHabilidades([...habilidades, novaHab.toUpperCase()]); setNovaHab(""); } }} />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {habilidades.map((hab, i) => (
                                <span key={i} className="bg-[#3800df] text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest flex items-center gap-2">
                                    {hab}
                                    <DeleteIcon sx={{ fontSize: 12, cursor: "pointer" }} onClick={() => setHabilidades(habilidades.filter((_, index) => index !== i))} />
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[#1b85db] text-[13px] md:text-[15px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] border-b-2 border-[#1b85db] pb-2 px-1">Competências</h3>
                        <CustomInput label="Nova" value={novaComp} onChange={(e) => setNovaComp(e.target.value)} onAddClick={() => { if (novaComp) { setCompetencias([...competencias, novaComp.toUpperCase()]); setNovaComp(""); } }} hoverColor="#000" />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {competencias.map((comp, i) => (
                                <span key={i} className="bg-black text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest flex items-center gap-2">
                                    {comp}
                                    <DeleteIcon sx={{ fontSize: 12, cursor: "pointer" }} onClick={() => setCompetencias(competencias.filter((_, index) => index !== i))} />
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* RESUMO PROFISSIONAL */}
                <section>
                    <CustomTextArea
                        label="RESUMO PROFISSIONAL"
                        value={formData.resumo}
                        onChange={(e) => handleUpdate("resumo", e.target.value)}
                    />
                </section>

                {/* BOTÃO ATUALIZAR */}
                <div className="flex justify-center pt-4 md:pt-8 w-full px-4 md:px-0">
                    <BubbleButton onClick={() => alert("Perfil Atualizado!")}>
                        Atualizar Perfil
                    </BubbleButton>
                </div>
            </main>
        </div>
    );
}