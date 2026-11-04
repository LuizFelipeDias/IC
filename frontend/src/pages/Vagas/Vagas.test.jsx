import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Curriculo from "./Curriculo";
import VagaEditor from "./VagaEditor";
import Vagas from "./Vagas";

const json = (dados, status = 200) => Promise.resolve(new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } }));

const PERFIS_VAZIOS = { solicitante: false, prestador: false, contratante: false, candidato: false, publicador: false, receptor: false, moderador: false };
const USUARIOS = {
    estudante: { id: 1, nome: "Ana Beatriz", tipo_usuario: "pessoa_fisica", perfis: { ...PERFIS_VAZIOS, candidato: true } },
    empresa: { id: 3, nome: "Campos Gerais Manufatura", tipo_usuario: "empresa", verificacao_status: "verificado", perfis: { ...PERFIS_VAZIOS, solicitante: true, contratante: true, publicador: true } },
};

const VAGA = {
    id: 7,
    id_usuario: 3,
    titulo: "Estágio em modelagem 3D remota",
    tema: "Modelagem 3D",
    cidade: "Curitiba",
    uf: "PR",
    texto: "Preparação de modelos para impressão.",
    modalidade: "remoto",
    modalidade_rotulo: "Remoto",
    tipo_contrato: "estagio",
    tipo_contrato_rotulo: "Estágio",
    nivel: "estagio",
    nivel_rotulo: "Estágio",
    salario_min: 1200,
    salario_max: 1200,
    habilidades: ["Blender", "Fusion 360"],
    status: "aberta",
    status_rotulo: "Aberta",
    aceita_candidaturas: true,
    data_publicacao: "2026-10-20T12:00:00Z",
    usuario: { id: 3, nome: "Campos Gerais Manufatura" },
};

/** fetch falso: responde por rota e guarda as chamadas. */
function servidor(usuario, rotas = {}) {
    const chamadas = [];
    vi.stubGlobal("fetch", vi.fn((url, opcoes = {}) => {
        const u = String(url);
        chamadas.push({ url: u, metodo: opcoes.method ?? "GET", corpo: opcoes.body ? JSON.parse(opcoes.body) : undefined });
        for (const [trecho, resposta] of Object.entries(rotas)) {
            if (u.includes(trecho)) return typeof resposta === "function" ? resposta(u, opcoes) : json(resposta);
        }
        if (u.endsWith("/usuario/me")) return json(usuario);
        return json({ data: [], meta: { total: 0 } });
    }));
    return chamadas;
}

function renderizar(elemento, caminho = "/") {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[caminho]}>
                <Routes>
                    <Route path={caminho} element={elemento} />
                    <Route path="/vagas" element={<p>Mural de vagas</p>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>,
    );
}

beforeEach(() => {
    localStorage.setItem("@hub:token", "t");
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
});

afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
});

describe("Publicar vaga (VagaEditor)", () => {
    it("envia modalidade, contrato, nível, local, faixa salarial, habilidades e encerramento", async () => {
        const chamadas = servidor(USUARIOS.empresa, { "/vaga": (u, o) => (o.method === "POST" ? json({ ...VAGA, id: 42, titulo: "Técnico(a) FDM" }, 201) : json({ data: [] })) });
        renderizar(<VagaEditor />, "/vagas/nova");

        fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Técnico(a) FDM" } });
        fireEvent.click(screen.getByRole("radio", { name: /híbrido/i }));
        fireEvent.click(screen.getByRole("radio", { name: "CLT" }));
        fireEvent.click(screen.getByRole("radio", { name: "Júnior" }));
        fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Ponta Grossa" } });
        fireEvent.change(screen.getByLabelText("UF"), { target: { value: "PR" } });
        fireEvent.change(screen.getByLabelText("Salário mínimo (R$)"), { target: { value: "2800" } });
        fireEvent.change(screen.getByLabelText("Salário máximo (R$)"), { target: { value: "3400" } });
        fireEvent.change(screen.getByLabelText("Encerra em"), { target: { value: "2099-12-31" } });

        const habilidades = screen.getByLabelText("Habilidades");
        fireEvent.change(habilidades, { target: { value: "Klipper" } });
        fireEvent.keyDown(habilidades, { key: "Enter" });
        fireEvent.click(screen.getByRole("button", { name: "Fusion 360" }));
        expect(screen.getByRole("button", { name: "Remover Klipper" })).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "Operação de impressoras." } });
        fireEvent.click(screen.getByRole("button", { name: /publicar vaga/i }));

        expect(await screen.findByText("Vaga publicada.")).toBeInTheDocument();
        const post = chamadas.find((c) => c.metodo === "POST");
        expect(post.url).toMatch(/\/vaga$/);
        expect(post.corpo).toMatchObject({
            titulo: "Técnico(a) FDM",
            modalidade: "hibrido",
            tipo_contrato: "clt",
            nivel: "junior",
            cidade: "Ponta Grossa",
            uf: "PR",
            salario_min: "2800",
            salario_max: "3400",
            encerra_em: "2099-12-31",
            habilidades: ["Klipper", "Fusion 360"],
            cep: null,
        });
        await waitFor(() => expect(screen.getByText("Mural de vagas")).toBeInTheDocument(), { timeout: 2500 });
    });

    it("mostra os erros 422 em cada campo, inclusive salário e habilidades", async () => {
        servidor(USUARIOS.empresa, {
            "/vaga": () =>
                json({
                    message: "Dados inválidos.",
                    errors: {
                        modalidade: ["O campo modalidade é obrigatório."],
                        salario_max: ["O salário máximo deve ser maior ou igual ao salário mínimo."],
                        "habilidades.0": ["O campo habilidade não pode ser superior a 60 caracteres."],
                    },
                }, 422),
        });
        renderizar(<VagaEditor />, "/vagas/nova");

        fireEvent.click(screen.getByRole("button", { name: /publicar vaga/i }));

        expect(await screen.findByText("O campo modalidade é obrigatório.")).toBeInTheDocument();
        expect(screen.getByText("O salário máximo deve ser maior ou igual ao salário mínimo.")).toBeInTheDocument();
        expect(screen.getByLabelText("Salário máximo (R$)")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Habilidades")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByText("O campo habilidade não pode ser superior a 60 caracteres.")).toBeInTheDocument();
    });
});

describe("Mural de vagas", () => {
    it("candidato vê Candidatar-se, envia a candidatura e não vê Publicar vaga", async () => {
        const chamadas = servidor(USUARIOS.estudante, {
            "/candidatura": (u, o) => (o.method === "POST" ? json({ id: 9, id_vaga: VAGA.id, status: "Em análise" }, 201) : json({ data: [] })),
            "/vaga": { data: [VAGA] },
        });
        renderizar(<Vagas />, "/vagas-teste");

        const botao = await screen.findByRole("button", { name: /candidatar-se/i });
        expect(screen.queryByRole("link", { name: /publicar vaga/i })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: /manter meu currículo/i })).toHaveAttribute("href", "/curriculo");

        fireEvent.click(botao);
        expect(await screen.findByText("VOCÊ JÁ SE CANDIDATOU")).toBeInTheDocument();
        expect(chamadas.find((c) => c.metodo === "POST" && c.url.endsWith("/candidatura")).corpo).toEqual({ id_vaga: VAGA.id });
        expect(screen.queryByRole("button", { name: /candidatar-se/i })).not.toBeInTheDocument();
    });

    it("filtro de modalidade vai para a API", async () => {
        const chamadas = servidor(USUARIOS.estudante, { "/vaga": { data: [VAGA] } });
        renderizar(<Vagas />, "/vagas-teste");
        await screen.findByRole("button", { name: /candidatar-se/i });

        const grupo = screen.getByRole("group", { name: "Modalidade" });
        fireEvent.click(within(grupo).getByRole("checkbox", { name: "Remoto" }));

        await waitFor(() => expect(chamadas.some((c) => c.url.includes("/vaga?") && c.url.includes("modalidade=remoto"))).toBe(true));
    });

    it("contratante vê Publicar vaga e Ver candidatos na própria vaga, sem Candidatar-se", async () => {
        servidor(USUARIOS.empresa, { "/vaga": { data: [VAGA] } });
        renderizar(<Vagas />, "/vagas-teste");

        expect(await screen.findByRole("button", { name: /ver candidatos/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /publicar vaga/i })).toHaveAttribute("href", "/vagas/nova");
        expect(screen.queryByRole("button", { name: /candidatar-se/i })).not.toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "Banco de currículos" })).toBeInTheDocument();
    });

    it("contratante busca o banco de currículos por especialidade", async () => {
        const chamadas = servidor(USUARIOS.empresa, {
            "/curriculo": { data: [{ id: 1, cargo: "Técnica em polímeros", especialidades: ["Reciclagem de polímeros"], cidade: "Curitiba", uf: "PR", disponibilidade_rotulo: "Imediata", portfolio_url: "https://carla.exemplo.com.br", usuario: { nome: "Carla Nogueira" }, contato: { email: "carla@ecohub3d.test" } }] },
        });
        renderizar(<Vagas />, "/vagas-teste");

        fireEvent.click(await screen.findByRole("tab", { name: "Banco de currículos" }));
        expect(await screen.findByText("Carla Nogueira")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /portfólio/i })).toHaveAttribute("href", "https://carla.exemplo.com.br");

        fireEvent.click(within(screen.getByRole("radiogroup", { name: "Especialidade" })).getByRole("radio", { name: "Reciclagem de polímeros" }));
        await waitFor(() => expect(chamadas.some((c) => c.url.includes("/curriculo?") && c.url.includes("especialidade=Reciclagem"))).toBe(true));
    });
});

describe("Meu currículo", () => {
    it("salva especialidades sugeridas e personalizadas, portfólio e visibilidade", async () => {
        const chamadas = servidor(USUARIOS.estudante, {
            "/curriculo/meus": { data: [] },
            "/curriculo": (u, o) => json({ id: 5, ...JSON.parse(o.body) }, 201),
        });
        renderizar(<Curriculo />, "/curriculo");

        fireEvent.click(await screen.findByRole("button", { name: "Impressão FDM" }));
        const campo = screen.getByLabelText("Especialidades");
        fireEvent.change(campo, { target: { value: "Scanner de luz estruturada" } });
        fireEvent.keyDown(campo, { key: "Enter" });
        fireEvent.change(screen.getByLabelText("Portfólio de peças (link)"), { target: { value: "https://ana.exemplo.com.br" } });
        fireEvent.click(screen.getByRole("radio", { name: "Imediata" }));
        fireEvent.click(screen.getByRole("switch"));
        fireEvent.change(screen.getByLabelText("Resumo"), { target: { value: "Estudante de materiais." } });
        fireEvent.click(screen.getByRole("button", { name: /salvar currículo/i }));

        expect(await screen.findByText("Currículo salvo.")).toBeInTheDocument();
        const post = chamadas.find((c) => c.metodo === "POST");
        expect(post.url).toMatch(/\/curriculo$/);
        expect(post.corpo).toMatchObject({
            especialidades: ["Impressão FDM", "Scanner de luz estruturada"],
            portfolio_url: "https://ana.exemplo.com.br",
            disponibilidade: "imediata",
            visivel_no_banco: false,
            texto: "Estudante de materiais.",
        });
    });

    it("lista as candidaturas com o status", async () => {
        servidor(USUARIOS.estudante, {
            "/curriculo/meus": { data: [] },
            "/candidatura": { data: [{ id: 3, id_vaga: 7, status: "Aprovada", data_candidatura: "2026-10-20T12:00:00Z", vaga: VAGA }] },
        });
        renderizar(<Curriculo />, "/curriculo");

        const lista = await screen.findByRole("list", { name: "Candidaturas" });
        expect(within(lista).getByText(VAGA.titulo)).toBeInTheDocument();
        expect(within(lista).getByText("Aprovada")).toBeInTheDocument();
        expect(within(lista).getByRole("button", { name: /desistir/i })).toBeInTheDocument();
    });
});
