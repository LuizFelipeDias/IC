import React, { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/*
 * Carrossel horizontal com rolagem nativa (scroll-snap), setas, pontos,
 * arrastar com o mouse, teclado e troca automática opcional.
 *
 * Props:
 *   rotulo      nome acessível ("Projetos em destaque")
 *   automatico  intervalo em ms para avançar sozinho (pausa no hover/foco)
 *   classe      classe extra no contêiner (para ajustar --carrossel-largura etc.)
 *   controles   "abaixo" (padrão) | "nenhum"
 */
export default function Carrossel({ rotulo, automatico = 0, classe = "", controles = "abaixo", children }) {
    const trilho = useRef(null);
    const pausado = useRef(false);
    const arrasto = useRef(null);
    const [pagina, setPagina] = useState(0);
    const [paginas, setPaginas] = useState(1);
    const itens = Children.toArray(children);

    const medir = useCallback(() => {
        const el = trilho.current;
        if (!el) return;
        const total = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
        setPaginas(total);
        setPagina(Math.min(total - 1, Math.round(el.scrollLeft / el.clientWidth)));
    }, []);

    useEffect(() => {
        medir();
        const el = trilho.current;
        if (!el) return undefined;
        // Sem ResizeObserver (navegadores antigos), mede de novo ao redimensionar a janela.
        const redimensionar = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null;
        if (redimensionar) redimensionar.observe(el);
        else window.addEventListener("resize", medir);
        el.addEventListener("scroll", medir, { passive: true });
        return () => {
            if (redimensionar) redimensionar.disconnect();
            else window.removeEventListener("resize", medir);
            el.removeEventListener("scroll", medir);
        };
    }, [medir, itens.length]);

    const irPara = useCallback((indice) => {
        const el = trilho.current;
        if (!el) return;
        const total = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
        const destino = (indice + total) % total;
        el.scrollTo({ left: destino * el.clientWidth, behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (!automatico || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
        const id = setInterval(() => {
            if (!pausado.current) irPara(pagina + 1);
        }, automatico);
        return () => clearInterval(id);
    }, [automatico, pagina, irPara]);

    const iniciarArrasto = (evento) => {
        if (evento.pointerType !== "mouse") return;
        arrasto.current = { x: evento.clientX, inicio: trilho.current.scrollLeft, moveu: false };
    };

    const arrastar = (evento) => {
        if (!arrasto.current) return;
        const dx = evento.clientX - arrasto.current.x;
        if (Math.abs(dx) > 4) {
            arrasto.current.moveu = true;
            trilho.current.classList.add("arrastando");
        }
        trilho.current.scrollLeft = arrasto.current.inicio - dx;
    };

    const soltar = () => {
        if (!arrasto.current) return;
        const moveu = arrasto.current.moveu;
        arrasto.current = null;
        trilho.current.classList.remove("arrastando");
        if (moveu) irPara(Math.round(trilho.current.scrollLeft / trilho.current.clientWidth));
    };

    // Um arrasto não deve virar clique no link do cartão.
    const bloquearCliqueAposArrasto = (evento) => {
        if (trilho.current.dataset.acabouDeArrastar) {
            evento.preventDefault();
            evento.stopPropagation();
        }
    };

    const teclado = (evento) => {
        if (evento.key === "ArrowRight") {
            evento.preventDefault();
            irPara(pagina + 1);
        }
        if (evento.key === "ArrowLeft") {
            evento.preventDefault();
            irPara(pagina - 1);
        }
    };

    return (
        <div
            className={`carrossel ${classe}`}
            role="region"
            aria-roledescription="carrossel"
            aria-label={rotulo}
            onMouseEnter={() => (pausado.current = true)}
            onMouseLeave={() => (pausado.current = false)}
            onFocus={() => (pausado.current = true)}
            onBlur={() => (pausado.current = false)}
        >
            <div
                ref={trilho}
                className="carrossel__trilho"
                tabIndex={0}
                onKeyDown={teclado}
                onPointerDown={iniciarArrasto}
                onPointerMove={arrastar}
                onPointerUp={(e) => {
                    if (arrasto.current?.moveu) {
                        trilho.current.dataset.acabouDeArrastar = "1";
                        setTimeout(() => delete trilho.current?.dataset.acabouDeArrastar, 0);
                    }
                    soltar(e);
                }}
                onPointerLeave={soltar}
                onClickCapture={bloquearCliqueAposArrasto}
            >
                {itens.map((item, i) => (
                    <div key={item.key ?? i} role="group" aria-roledescription="slide" aria-label={`${i + 1} de ${itens.length}`}>
                        {item}
                    </div>
                ))}
            </div>

            {controles !== "nenhum" && paginas > 1 && (
                <div className="carrossel__controles">
                    <div className="carrossel__pontos">
                        {Array.from({ length: paginas }, (_, i) => (
                            <button key={i} type="button" className="carrossel__ponto" aria-label={`Ir para a página ${i + 1}`} aria-current={i === pagina} onClick={() => irPara(i)} />
                        ))}
                    </div>
                    <div className="carrossel__setas">
                        <button type="button" className="carrossel__seta" aria-label="Anterior" onClick={() => irPara(pagina - 1)}>
                            <ChevronLeft size={18} aria-hidden="true" />
                        </button>
                        <button type="button" className="carrossel__seta" aria-label="Próximo" onClick={() => irPara(pagina + 1)}>
                            <ChevronRight size={18} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
