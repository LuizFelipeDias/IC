import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Plus, Search } from "lucide-react";
import { Carregando, Chip, Vazio } from "../../components/ui";
import { api, lista, query } from "../../services/api";
import { AREAS_PROJETO, LICENCAS, tempoRelativo } from "../../utils/formatar";
import "../../styles/pages/projetos.css";

function CartaoProjeto({ projeto }) {
    const modelos = projeto.anexos?.filter((a) => a.tipo === "modelo") ?? [];
    const volume = modelos[0]?.metadados?.volume_cm3;

    return (
        <Link to={`/projetos/${projeto.id}`} className="cartao cartao--interativo cartao-projeto">
            <div className="cartao-projeto__capa">
                {projeto.capa ? <img src={projeto.capa} alt="" loading="lazy" /> : <Box size={56} strokeWidth={1.2} aria-hidden="true" />}
                <Chip tom="primaria">{AREAS_PROJETO[projeto.area] ?? "Projeto"}</Chip>
            </div>
            <div className="cartao-projeto__corpo">
                <h3>{projeto.titulo}</h3>
                <p>{projeto.texto.length > 110 ? `${projeto.texto.slice(0, 110)}…` : projeto.texto}</p>
                <div className="cartao-projeto__rodape">
                    <span>{projeto.usuario?.nome ?? "Autor removido"}</span>
                    <span className="linha" style={{ gap: "var(--esp-2)" }}>
                        {modelos.length > 0 && <Chip>{modelos[0].metadados?.formato?.toUpperCase()}{volume ? ` · ${volume} cm³` : ""}</Chip>}
                        <Chip>{LICENCAS[projeto.licenca]?.nome ?? "Sem licença"}</Chip>
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function Projetos() {
    const [projetos, setProjetos] = useState(null);
    const [busca, setBusca] = useState("");
    const [termo, setTermo] = useState("");
    const [area, setArea] = useState("");
    const [licenca, setLicenca] = useState("");

    useEffect(() => {
        const espera = setTimeout(() => setTermo(busca.trim()), 300);
        return () => clearTimeout(espera);
    }, [busca]);

    useEffect(() => {
        setProjetos(null);
        api(`/projeto${query({ q: termo, area, licenca, per_page: 60 })}`).then((r) => setProjetos(lista(r))).catch(() => setProjetos([]));
    }, [termo, area, licenca]);

    return (
        <>
            <section className="vitrine">
                <div className="container">
                    <span className="sobrelinha">Repositório de projetos</span>
                    <h1>Modelos 3D abertos, testados e com licença clara.</h1>
                    <p>Peças para saúde, educação, agro e acessibilidade, revisadas pela curadoria antes de chegarem até você.</p>
                    <label className="busca-grande">
                        <Search size={18} aria-hidden="true" />
                        <span className="sr-only">Buscar projetos</span>
                        <input type="search" placeholder="Buscar por órtese, engrenagem, maquete..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                        <Link to="/projetos/novo" className="botao">
                            <Plus size={16} aria-hidden="true" /> Enviar projeto
                        </Link>
                    </label>
                </div>
            </section>

            <div className="container">
                <div className="filtros-barra">
                    <div className="linha" role="group" aria-label="Filtrar por área">
                        <button type="button" className="chip-filtro" aria-pressed={area === ""} onClick={() => setArea("")}>
                            Todas as áreas
                        </button>
                        {Object.entries(AREAS_PROJETO).map(([valor, rotulo]) => (
                            <button key={valor} type="button" className="chip-filtro" aria-pressed={area === valor} onClick={() => setArea(valor)}>
                                {rotulo}
                            </button>
                        ))}
                    </div>
                    <div className="linha">
                        <label htmlFor="filtro-licenca" className="sr-only">Licença</label>
                        <select id="filtro-licenca" className="entrada" style={{ width: 220 }} value={licenca} onChange={(e) => setLicenca(e.target.value)}>
                            <option value="">Qualquer licença</option>
                            {Object.entries(LICENCAS).map(([valor, l]) => (
                                <option key={valor} value={valor}>{l.nome}</option>
                            ))}
                        </select>
                        <Link to="/publicacoes" className="botao botao--secundario">Minhas publicações</Link>
                    </div>
                </div>

                {projetos === null && <Carregando texto="Buscando projetos..." />}
                {projetos?.length === 0 && <Vazio icone={Box} titulo="Nenhum projeto encontrado">Tente outra área ou outro termo de busca.</Vazio>}
                {projetos?.length > 0 && (
                    <>
                        <p className="texto-suave" style={{ marginBottom: "var(--esp-4)", fontSize: "var(--texto-sm)" }}>
                            {projetos.length} projeto(s){termo && ` para “${termo}”`} · atualizado {tempoRelativo(projetos[0]?.data_publicacao)}
                        </p>
                        <div className="grade-projetos">
                            {projetos.map((projeto) => (
                                <CartaoProjeto key={projeto.id} projeto={projeto} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
