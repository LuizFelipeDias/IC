import React from "react";
import Marca from "./Marca";

const CICLO = ["Doação", "Coleta", "Reciclagem", "Filamento", "Nova peça"];

/** Painel escuro das telas de login e cadastro. */
export default function PainelMarca({ titulo, descricao }) {
    return (
        <aside className="auth__painel">
            <Marca />
            <div>
                <h2 className="auth__manchete">{titulo}</h2>
                <p className="auth__descricao">{descricao}</p>
            </div>
            <ol className="auth__ciclo" aria-label="Ciclo do material">
                {CICLO.map((etapa, i) => (
                    <li key={etapa}>
                        <b>0{i + 1}</b>
                        {etapa}
                    </li>
                ))}
            </ol>
        </aside>
    );
}
