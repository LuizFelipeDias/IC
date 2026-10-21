import React, { StrictMode } from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RevelarAoRolar from "./RevelarAoRolar";

let instancias = [];

class ObservadorFalso {
    constructor(callback) {
        this.callback = callback;
        this.alvos = new Set();
        this.desconectado = false;
        instancias.push(this);
    }
    observe(el) {
        this.alvos.add(el);
    }
    unobserve(el) {
        this.alvos.delete(el);
    }
    disconnect() {
        this.desconectado = true;
        this.alvos.clear();
    }
    entrar(el) {
        this.callback([{ isIntersecting: true, target: el }]);
    }
}

describe("RevelarAoRolar", () => {
    beforeEach(() => {
        instancias = [];
        vi.stubGlobal("IntersectionObserver", ObservadorFalso);
        vi.stubGlobal("matchMedia", () => ({ matches: false }));
    });
    afterEach(() => vi.unstubAllGlobals());

    it("revela elementos ao entrarem na tela, mesmo no StrictMode", () => {
        render(
            <StrictMode>
                <section data-revelar data-testid="secao">conteúdo</section>
                <RevelarAoRolar />
            </StrictMode>,
        );
        const ativo = instancias.find((o) => !o.desconectado);
        const secao = screen.getByTestId("secao");

        expect(ativo.alvos.has(secao)).toBe(true);
        act(() => ativo.entrar(secao));
        expect(secao.classList.contains("visivel")).toBe(true);
    });

    it("mostra tudo de uma vez quando o sistema pede menos movimento", () => {
        vi.stubGlobal("matchMedia", () => ({ matches: true }));
        render(
            <>
                <p data-revelar data-testid="texto">oi</p>
                <RevelarAoRolar />
            </>,
        );
        expect(screen.getByTestId("texto").classList.contains("visivel")).toBe(true);
    });
});
