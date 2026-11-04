import React, { useState } from "react";
import { Plus, X } from "lucide-react";

/* ==================================================================
 * Entrada de etiquetas (habilidades da vaga, especialidades do currículo)
 * no visual dos formulários de registro: chips pretos removíveis,
 * campo para digitar (Enter ou vírgula adiciona) e sugestões
 * clicáveis que marcam/desmarcam.
 * ================================================================== */

const chave = (texto) => texto.trim().toLocaleLowerCase("pt-BR");

/** Junta espaços, descarta vazios e repetidos (sem diferenciar maiúsculas). */
export function normalizarEtiquetas(lista) {
    const vistas = new Set();
    return lista
        .map((item) => String(item ?? "").replace(/\s+/g, " ").trim())
        .filter((item) => {
            if (!item || vistas.has(chave(item))) return false;
            vistas.add(chave(item));
            return true;
        });
}

export default function CampoEtiquetas({ id, valor = [], aoMudar, sugestoes = [], maximo = 20, tamanho = 60, placeholder = "Digite e tecle Enter", rotuloSugestoes = "Sugestões", "aria-invalid": invalido, "aria-describedby": descrito }) {
    const [texto, setTexto] = useState("");
    const marcadas = new Set(valor.map(chave));
    const cheio = valor.length >= maximo;

    const adicionar = (novos) => {
        const lista = normalizarEtiquetas([...valor, ...novos]).slice(0, maximo);
        if (lista.length !== valor.length) aoMudar(lista);
    };
    const remover = (item) => aoMudar(valor.filter((v) => chave(v) !== chave(item)));
    const alternar = (item) => (marcadas.has(chave(item)) ? remover(item) : adicionar([item]));

    const confirmar = () => {
        if (!texto.trim()) return;
        adicionar(texto.split(","));
        setTexto("");
    };

    const teclar = (evento) => {
        if (evento.key === "Enter" || evento.key === ",") {
            evento.preventDefault();
            confirmar();
        } else if (evento.key === "Backspace" && !texto && valor.length) {
            remover(valor[valor.length - 1]);
        }
    };

    return (
        <div className="vg-etiquetas">
            <div className={`vg-etiquetas__caixa ${invalido ? "vg-etiquetas__caixa--erro" : ""}`}>
                {valor.length > 0 && (
                    <ul className="vg-etiquetas__lista" aria-label="Selecionadas">
                        {valor.map((item, i) => (
                            <li key={chave(item)} className="vg-etiqueta" style={{ "--i": i }}>
                                <span>{item}</span>
                                <button type="button" aria-label={`Remover ${item}`} onClick={() => remover(item)}>
                                    <X size={12} aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <span className="vg-etiquetas__entrada">
                    <input
                        id={id}
                        className="rg-entrada"
                        value={texto}
                        maxLength={tamanho}
                        disabled={cheio}
                        placeholder={cheio ? `Limite de ${maximo} itens` : placeholder}
                        aria-invalid={invalido}
                        aria-describedby={descrito}
                        onChange={(e) => setTexto(e.target.value)}
                        onKeyDown={teclar}
                        onBlur={confirmar}
                    />
                    <button type="button" className="vg-etiquetas__adicionar" aria-label="Adicionar" disabled={!texto.trim() || cheio} onClick={confirmar}>
                        <Plus size={16} aria-hidden="true" />
                    </button>
                </span>
            </div>
            {sugestoes.length > 0 && (
                <div className="vg-etiquetas__sugestoes" role="group" aria-label={rotuloSugestoes}>
                    {sugestoes.map((item) => (
                        <button key={item} type="button" className="vg-sugestao" aria-pressed={marcadas.has(chave(item))} disabled={cheio && !marcadas.has(chave(item))} onClick={() => alternar(item)}>
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
