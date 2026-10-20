import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Box, Plus, Search } from "lucide-react";
import { Carregando, Vazio } from "../../components/ui";
import { api, lista, query } from "../../services/api";
import { AREAS_PROJETO, LICENCAS, tempoRelativo } from "../../utils/formatar";
import "../../styles/pages/projetos.css";

/* Cada projeto vira uma "obra" do portfólio: número, título grande, ficha e capa larga. */
function ObraProjeto({ projeto, indice }) {
    const modelos = projeto.anexos?.filter((a) => a.tipo === "modelo") ?? [];
    const modelo = modelos[0]?.metadados;

    return (
        <article className={`obra ${indice % 2 ? "obra--invertida" : ""}`}>
            <Link to={`/projetos/${projeto.id}`} className="obra__capa cartao-projeto" aria-label={projeto.titulo}>
                {projeto.capa ? <img src={projeto.capa} alt="" loading="lazy" /> : <Box size={72} strokeWidth={1} aria-hidden="true" />}
            </Link>
            <div className="obra__texto">
                <span className="obra__numero">{String(indice + 1).padStart(2, "0")}</span>
                <span className="obra__area">{AREAS_PROJETO[projeto.area] ?? "Projeto"}</span>
                <h2 className="obra__titulo">
                    <Link to={`/projetos/${projeto.id}`}>{projeto.titulo}</Link>
                </h2>
                <p>{projeto.texto.length > 180 ? `${projeto.texto.slice(0, 180)}…` : projeto.texto}</p>
                <dl className="obra__ficha">
                    <div>
                        <dt>Autor</dt>
                        <dd>{projeto.usuario?.nome ?? "Autor removido"}</dd>
                    </div>
                    <div>
                        <dt>Licença</dt>
                        <dd>{LICENCAS[projeto.licenca]?.nome ?? "Sem licença"}</dd>
                    </div>
                    <div>
                        <dt>Arquivo</dt>
                        <dd>{modelo ? `${modelo.formato?.toUpperCase()}${modelo.volume_cm3 ? ` · ${modelo.volume_cm3} cm³` : ""}` : "Só imagens"}</dd>
                    </div>
                </dl>
                <Link to={`/projetos/${projeto.id}`} className="obra__link">
                    Ver projeto <ArrowRight size={18} aria-hidden="true" />
                </Link>
            </div>
        </article>
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

    const autores = new Set(projetos?.map((p) => p.usuario?.id)).size;

    return (
        <>
            <section className="container portfolio">
                <div className="portfolio__intro">
                    <span className="portfolio__status">
                        <span aria-hidden="true" /> Aberto para remix
                    </span>
                    <h1>
                        Projetos que saem da impressora e <em>resolvem problemas reais</em>.
                    </h1>
                </div>
                <div className="portfolio__lado">
                    <p>Modelos para saúde, educação, agro e acessibilidade, com arquivo validado, licença clara e revisão da curadoria.</p>
                    <dl className="portfolio__numeros">
                        <div>
                            <dt>Projetos</dt>
                            <dd>{projetos?.length ?? "—"}</dd>
                        </div>
                        <div>
                            <dt>Autores</dt>
                            <dd>{projetos ? autores : "—"}</dd>
                        </div>
                        <div>
                            <dt>Áreas</dt>
                            <dd>{Object.keys(AREAS_PROJETO).length}</dd>
                        </div>
                    </dl>
                    <div className="linha">
                        <Link to="/projetos/novo" className="botao botao--grande">
                            <Plus size={18} aria-hidden="true" /> Enviar projeto
                        </Link>
                        <Link to="/publicacoes" className="botao botao--secundario botao--grande">Minhas publicações</Link>
                    </div>
                </div>
            </section>

            <div className="container">
                <div className="portfolio__barra">
                    <h2>Trabalhos selecionados</h2>
                    <label className="portfolio__busca">
                        <Search size={18} aria-hidden="true" />
                        <span className="sr-only">Buscar projetos</span>
                        <input type="search" placeholder="Buscar por órtese, engrenagem, maquete..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                    </label>
                </div>

                <div className="portfolio__filtros">
                    <div className="portfolio__abas" role="group" aria-label="Filtrar por área">
                        <button type="button" aria-pressed={area === ""} onClick={() => setArea("")}>
                            Tudo
                        </button>
                        {Object.entries(AREAS_PROJETO).map(([valor, rotulo]) => (
                            <button key={valor} type="button" aria-pressed={area === valor} onClick={() => setArea(valor)}>
                                {rotulo}
                            </button>
                        ))}
                    </div>
                    <label htmlFor="filtro-licenca" className="sr-only">Licença</label>
                    <select id="filtro-licenca" className="entrada portfolio__licenca" value={licenca} onChange={(e) => setLicenca(e.target.value)}>
                        <option value="">Qualquer licença</option>
                        {Object.entries(LICENCAS).map(([valor, l]) => (
                            <option key={valor} value={valor}>{l.nome}</option>
                        ))}
                    </select>
                </div>

                {projetos === null && <Carregando texto="Buscando projetos..." />}
                {projetos?.length === 0 && <Vazio icone={Box} titulo="Nenhum projeto encontrado">Tente outra área ou outro termo de busca.</Vazio>}
                {projetos?.length > 0 && (
                    <>
                        <p className="portfolio__contagem">
                            {projetos.length} projeto(s){termo && ` para “${termo}”`} · atualizado {tempoRelativo(projetos[0]?.data_publicacao)}
                        </p>
                        <div className="obras">
                            {projetos.map((projeto, i) => (
                                <ObraProjeto key={projeto.id} projeto={projeto} indice={i} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
