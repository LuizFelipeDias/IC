import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import RequirePerfil from "./components/RequirePerfil";
import { Carregando } from "./components/ui";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";

// Páginas carregadas sob demanda (o login fica no pacote inicial).
const CadastroUsuario = lazy(() => import("./pages/Cadastro/CadastroUsuario"));
const Home = lazy(() => import("./pages/Home"));
const Chamados = lazy(() => import("./pages/Chamados"));
const NovoChamado = lazy(() => import("./pages/Chamados/NovoChamado"));
const Instituicoes = lazy(() => import("./pages/Instituicoes"));
const Vagas = lazy(() => import("./pages/Vagas/Vagas"));
const VagaEditor = lazy(() => import("./pages/Vagas/VagaEditor"));
const Curriculo = lazy(() => import("./pages/Vagas/Curriculo"));
const Noticias = lazy(() => import("./pages/Noticias/Noticias"));
const NoticiaDetalhe = lazy(() => import("./pages/Noticias/NoticiaDetalhe"));
const NoticiaEditor = lazy(() => import("./pages/Noticias/NoticiaEditor"));
const Projetos = lazy(() => import("./pages/Projetos/Projetos"));
const ProjetoDetalhe = lazy(() => import("./pages/Projetos/ProjetoDetalhe"));
const ProjetoEditor = lazy(() => import("./pages/Projetos/ProjetoEditor"));
const MinhasPublicacoes = lazy(() => import("./pages/MinhasPublicacoes"));
const Doacoes = lazy(() => import("./pages/Economia/Doacoes"));
const NovaDoacao = lazy(() => import("./pages/Economia/NovaDoacao"));
const Lotes = lazy(() => import("./pages/Economia/Lotes"));
const LoteDetalhe = lazy(() => import("./pages/Economia/LoteDetalhe"));
const Rastreio = lazy(() => import("./pages/Economia/Rastreio"));
const Moderacao = lazy(() => import("./pages/Moderacao"));
const Ranking = lazy(() => import("./pages/Ranking"));

// Rotas que exigem login.
const RotaProtegida = () => {
    const { autenticado } = useAuth();
    return autenticado ? <Outlet /> : <Navigate to="/" replace />;
};

// Login e cadastro: quem já entrou vai direto para a home.
const RotaPublica = () => {
    const { autenticado } = useAuth();
    return autenticado ? <Navigate to="/home" replace /> : <Outlet />;
};

const comPerfil = (perfis, elemento) => <RequirePerfil perfis={perfis}>{elemento}</RequirePerfil>;

function App() {
    return (
        <Router>
            <Suspense fallback={<Carregando />}>
                <Routes>
                    <Route element={<RotaPublica />}>
                        <Route path="/" element={<Login />} />
                        <Route path="/cadastro/usuario" element={<CadastroUsuario />} />
                    </Route>

                    <Route element={<AppLayout />}>
                        {/* Página do QR Code: aberta também para visitantes. */}
                        <Route path="/rastreio" element={<Rastreio />} />
                        <Route path="/rastreio/:codigo" element={<Rastreio />} />

                        <Route element={<RotaProtegida />}>
                            <Route path="/home" element={<Home />} />
                            <Route path="/ranking" element={<Ranking />} />

                            <Route path="/chamados" element={comPerfil(["solicitante", "prestador", "moderador"], <Chamados />)} />
                            <Route path="/chamados/novo" element={comPerfil(["solicitante"], <NovoChamado />)} />

                            <Route path="/instituicoes" element={<Instituicoes />} />

                            <Route path="/vagas" element={<Vagas />} />
                            <Route path="/vagas/nova" element={comPerfil(["contratante"], <VagaEditor />)} />
                            <Route path="/curriculo" element={comPerfil(["candidato"], <Curriculo />)} />

                            <Route path="/noticias" element={<Noticias />} />
                            <Route path="/noticias/nova" element={comPerfil(["publicador"], <NoticiaEditor />)} />
                            <Route path="/noticias/:id" element={<NoticiaDetalhe />} />
                            <Route path="/noticias/:id/editar" element={<NoticiaEditor />} />

                            <Route path="/projetos" element={<Projetos />} />
                            <Route path="/projetos/novo" element={<ProjetoEditor />} />
                            <Route path="/projetos/:id" element={<ProjetoDetalhe />} />
                            <Route path="/projetos/:id/editar" element={<ProjetoEditor />} />
                            <Route path="/publicacoes" element={<MinhasPublicacoes />} />

                            <Route path="/doacoes" element={<Doacoes />} />
                            <Route path="/doacoes/nova" element={<NovaDoacao />} />
                            <Route path="/lotes" element={comPerfil(["receptor"], <Lotes />)} />
                            <Route path="/lotes/:id" element={comPerfil(["receptor"], <LoteDetalhe />)} />

                            <Route path="/moderacao" element={comPerfil(["moderador"], <Moderacao />)} />
                        </Route>
                    </Route>

                    {/* Endereços antigos e rotas inexistentes */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/vaga" element={<Navigate to="/vagas" replace />} />
                    <Route path="/projeto" element={<Navigate to="/projetos" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
