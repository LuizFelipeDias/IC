import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Carrossel from "./Carrossel";

// jsdom não calcula layout: simulamos 3 páginas de 300 px.
function prepararLayout() {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 300 });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => 900 });
    HTMLElement.prototype.scrollTo = vi.fn(function ({ left }) {
        this.scrollLeft = left;
        this.dispatchEvent(new Event("scroll"));
    });
}

const slides = ["Lote PLA natural", "Lote PETG azul", "Lote ABS preto", "Lote TPU", "Lote PET", "Lote PP"].map((t) => <article key={t}>{t}</article>);

describe("Carrossel", () => {
    beforeEach(() => {
        prepararLayout();
        vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
        vi.stubGlobal("matchMedia", () => ({ matches: false }));
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("expõe região acessível com slides numerados", () => {
        render(<Carrossel rotulo="Lotes recentes">{slides}</Carrossel>);
        expect(screen.getByRole("region", { name: "Lotes recentes" })).toHaveAttribute("aria-roledescription", "carrossel");
        expect(screen.getByRole("group", { name: "1 de 6" })).toHaveTextContent("Lote PLA natural");
    });

    it("mostra um ponto por página e avança pelas setas", () => {
        render(<Carrossel rotulo="Lotes">{slides}</Carrossel>);
        const pontos = screen.getAllByRole("button", { name: /ir para a página/i });
        expect(pontos).toHaveLength(3);
        expect(pontos[0]).toHaveAttribute("aria-current", "true");

        fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
        expect(screen.getAllByRole("button", { name: /ir para a página/i })[1]).toHaveAttribute("aria-current", "true");

        fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
        expect(screen.getAllByRole("button", { name: /ir para a página/i })[0]).toHaveAttribute("aria-current", "true");
    });

    it("volta ao início depois da última página e aceita as setas do teclado", () => {
        render(<Carrossel rotulo="Lotes">{slides}</Carrossel>);
        fireEvent.click(screen.getByRole("button", { name: /ir para a página 3/i }));
        fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
        expect(screen.getAllByRole("button", { name: /ir para a página/i })[0]).toHaveAttribute("aria-current", "true");

        fireEvent.keyDown(screen.getByRole("region").querySelector(".carrossel__trilho"), { key: "ArrowRight" });
        expect(screen.getAllByRole("button", { name: /ir para a página/i })[1]).toHaveAttribute("aria-current", "true");
    });

    it("avança sozinho e pausa com o mouse em cima", () => {
        vi.useFakeTimers();
        render(<Carrossel rotulo="Lotes" automatico={1000}>{slides}</Carrossel>);
        act(() => vi.advanceTimersByTime(1000));
        expect(screen.getAllByRole("button", { name: /ir para a página/i })[1]).toHaveAttribute("aria-current", "true");

        fireEvent.mouseEnter(screen.getByRole("region"));
        act(() => vi.advanceTimersByTime(3000));
        expect(screen.getAllByRole("button", { name: /ir para a página/i })[1]).toHaveAttribute("aria-current", "true");
    });

    it("não avança sozinho com prefers-reduced-motion", () => {
        vi.stubGlobal("matchMedia", () => ({ matches: true }));
        vi.useFakeTimers();
        render(<Carrossel rotulo="Lotes" automatico={1000}>{slides}</Carrossel>);
        act(() => vi.advanceTimersByTime(5000));
        expect(screen.getAllByRole("button", { name: /ir para a página/i })[0]).toHaveAttribute("aria-current", "true");
    });

    it("funciona sem ResizeObserver (navegadores antigos)", () => {
        vi.stubGlobal("ResizeObserver", undefined);
        render(<Carrossel rotulo="Lotes">{slides}</Carrossel>);
        expect(screen.getAllByRole("button", { name: /ir para a página/i })).toHaveLength(3);
    });

    it("esconde os controles quando tudo cabe numa página", () => {
        Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => 300 });
        render(<Carrossel rotulo="Lotes">{slides.slice(0, 2)}</Carrossel>);
        expect(screen.queryByRole("button", { name: "Próximo" })).not.toBeInTheDocument();
    });
});
