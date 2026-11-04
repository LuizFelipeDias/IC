import { useEffect } from "react";

/*
 * Observa todos os elementos com o atributo data-revelar (inclusive os que
 * aparecem depois, quando os dados da API chegam) e adiciona a classe
 * "visivel" quando entram na tela. Montado uma vez em cada layout.
 */
export default function RevelarAoRolar() {
    useEffect(() => {
        const semMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (semMovimento || typeof IntersectionObserver === "undefined") {
            const mostrarTodos = () => document.querySelectorAll("[data-revelar]").forEach((el) => el.classList.add("visivel"));
            mostrarTodos();
            const mutacoes = new MutationObserver(mostrarTodos);
            mutacoes.observe(document.body, { childList: true, subtree: true });
            return () => mutacoes.disconnect();
        }

        const observador = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add("visivel");
                        observador.unobserve(entrada.target);
                    }
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
        );

        // Conjunto próprio de cada observador: no StrictMode o efeito roda duas vezes,
        // e uma marca no DOM faria o segundo observador ignorar todos os elementos.
        const observados = new WeakSet();
        const observarNovos = () =>
            document.querySelectorAll("[data-revelar]:not(.visivel)").forEach((el) => {
                if (observados.has(el)) return;
                observados.add(el);
                observador.observe(el);
            });

        observarNovos();
        const mutacoes = new MutationObserver(observarNovos);
        mutacoes.observe(document.body, { childList: true, subtree: true });

        return () => {
            mutacoes.disconnect();
            observador.disconnect();
        };
    }, []);

    return null;
}
