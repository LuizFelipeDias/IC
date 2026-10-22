import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import RevelarAoRolar from "./RevelarAoRolar";

/** Estrutura comum das páginas internas: navegação, conteúdo e rodapé. */
export default function AppLayout() {
    const { pathname } = useLocation();

    return (
        <div className="app">
            <Nav />
            <main className="app__conteudo" id="conteudo">
                {/* A chave reinicia a animação de entrada a cada troca de página. */}
                <div key={pathname} className="pagina-entra">
                    <Outlet />
                </div>
            </main>
            <Footer />
            <RevelarAoRolar />
        </div>
    );
}
