import React, { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AreaEnvio, Aviso, Campo, Contador, Dialogo, errosPorCampo, useSaida } from "./ui";
import { ApiError } from "../services/api";

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

describe("Campo e erros de validação", () => {
    it("liga rótulo ao campo e anuncia o erro", () => {
        render(
            <Campo id="titulo" rotulo="Título" erro="O campo título é obrigatório.">
                <input id="titulo" />
            </Campo>,
        );
        expect(screen.getByLabelText("Título")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("O campo título é obrigatório.");
    });

    it("mostra a ajuda só quando não há erro", () => {
        const { rerender } = render(<Campo id="c" rotulo="CNPJ" ajuda="Só números"><input id="c" /></Campo>);
        expect(screen.getByText("Só números")).toBeInTheDocument();
        rerender(<Campo id="c" rotulo="CNPJ" ajuda="Só números" erro="CNPJ inválido."><input id="c" /></Campo>);
        expect(screen.queryByText("Só números")).not.toBeInTheDocument();
    });

    it("converte o 422 do Laravel na primeira mensagem de cada campo", () => {
        const erro = new ApiError("Dados inválidos", 422, { cnpj: ["CNPJ inválido.", "outra"], email: ["Já em uso."] });
        expect(errosPorCampo(erro)).toEqual({ cnpj: "CNPJ inválido.", email: "Já em uso." });
        expect(errosPorCampo(undefined)).toEqual({});
    });

    it("aviso de perigo é anunciado como alerta", () => {
        render(<Aviso tom="perigo">Falhou</Aviso>);
        expect(screen.getByRole("alert")).toHaveTextContent("Falhou");
    });
});

describe("Contador", () => {
    it("mostra o valor final direto com prefers-reduced-motion, formatado em pt-BR", () => {
        vi.stubGlobal("matchMedia", () => ({ matches: true }));
        render(<Contador valor={1234.5} casas={1} sufixo=" kg" />);
        expect(screen.getByText("1.234,5 kg")).toBeInTheDocument();
    });
});

describe("Dialogo", () => {
    function Exemplo() {
        const [aberto, setAberto] = useState(true);
        return (
            <>
                <button onClick={() => setAberto(true)}>abrir</button>
                <Dialogo aberto={aberto} aoFechar={() => setAberto(false)} titulo="Novo chamado">
                    <input aria-label="Título" />
                </Dialogo>
            </>
        );
    }

    it("abre como modal acessível, trava a rolagem e fecha com Esc após a animação", () => {
        vi.useFakeTimers();
        render(<Exemplo />);
        expect(screen.getByRole("dialog", { name: "Novo chamado" })).toHaveAttribute("aria-modal", "true");
        expect(document.body.style.overflow).toBe("hidden");

        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.getByRole("dialog").parentElement).toHaveClass("saindo");
        act(() => vi.advanceTimersByTime(300));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe("");
    });
});

describe("AreaEnvio (dropzone)", () => {
    it("muda o texto ao arrastar e entrega o arquivo solto", () => {
        const aoEscolher = vi.fn();
        render(<AreaEnvio titulo="Arraste o STL ou 3MF" accept=".stl,.3mf" aoEscolher={aoEscolher} />);
        const area = screen.getByText("Arraste o STL ou 3MF").closest("label");
        const arquivo = new File(["solid cubo"], "cubo.stl", { type: "model/stl" });

        fireEvent.dragEnter(area, { dataTransfer: { files: [] } });
        expect(screen.getByText("Solte para enviar")).toBeInTheDocument();
        expect(area).toHaveClass("area-envio--arrastando");

        fireEvent.drop(area, { dataTransfer: { files: [arquivo] } });
        expect(aoEscolher).toHaveBeenCalledWith(arquivo);
        expect(area).not.toHaveClass("area-envio--arrastando");
    });

    it("entrega a lista inteira quando aceita vários arquivos e mostra progresso ao enviar", () => {
        const aoEscolher = vi.fn();
        render(<AreaEnvio titulo="Fotos" multiple enviando aoEscolher={aoEscolher} />);
        const fotos = [new File(["a"], "a.jpg"), new File(["b"], "b.jpg")];
        fireEvent.drop(screen.getByText("Fotos").closest("label"), { dataTransfer: { files: fotos } });

        expect(aoEscolher).toHaveBeenCalledWith(fotos);
        expect(screen.getByRole("progressbar", { name: "Enviando" })).toBeInTheDocument();
    });
});

describe("useSaida", () => {
    it("marca o item como saindo e só remove depois da animação", () => {
        vi.useFakeTimers();
        const removido = vi.fn();
        function Lista() {
            const [saindo, remover] = useSaida(380);
            return <button className={saindo.has(7) ? "item-saindo" : ""} onClick={() => remover(7, removido)}>item</button>;
        }
        render(<Lista />);
        fireEvent.click(screen.getByText("item"));
        expect(screen.getByText("item")).toHaveClass("item-saindo");
        expect(removido).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(400));
        expect(removido).toHaveBeenCalled();
    });
});
