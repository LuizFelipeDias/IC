import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";

/** Estrutura comum das páginas internas: navegação, conteúdo e rodapé. */
export default function AppLayout() {
    return (
        <div className="app">
            <Nav />
            <main className="app__conteudo" id="conteudo">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
