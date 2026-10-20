import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Importação das páginas principais
import Login from './pages/Login';
const CadastroUsuario = lazy(() => import('./pages/Cadastro/CadastroUsuario'));
const Home = lazy(() => import('./pages/Home'));
const Vaga = lazy(() => import('./pages/Vaga'));
const Projeto = lazy(() => import('./pages/Projeto'));
const Noticia = lazy(() => import('./pages/Noticia'));
const Chamados = lazy(() => import('./pages/Chamados'));

// Importação das páginas de cadastro
const CadastroCurriculo = lazy(() => import('./pages/Cadastro/CadastroCurriculo'));
const CadastroNoticia = lazy(() => import('./pages/Cadastro/CadastroNoticia'));
const CadastroProjeto = lazy(() => import('./pages/Cadastro/CadastroProjeto'));
const CadastroVaga = lazy(() => import('./pages/Cadastro/CadastroVaga'));

// Importação das páginas de visualização detalhada
const VisualizacaoVaga = lazy(() => import('./pages/Visualizacao/VisualizacaoVaga'));
const VisualizacaoProjeto = lazy(() => import('./pages/Visualizacao/VisualizacaoProjeto'));
const VisualizacaoNoticia = lazy(() => import('./pages/Visualizacao/VisualizacaoNoticia'));


const CarregandoPagina = () => (
    <div className="min-h-screen flex items-center justify-center text-[11px] font-bold uppercase tracking-widest text-[#858585]">
        Carregando...
    </div>
);

// Componente porteiro para restringir acesso a rotas privadas
const RotaProtegida = () => {
    const { autenticado } = useAuth();
    return autenticado ? <Outlet /> : <Navigate to="/" replace />;
};

// Componente para barrar o acesso à tela de login se já estiver autenticado
const RotaPublica = () => {
    const { autenticado } = useAuth();
    return autenticado ? <Navigate to="/home" replace /> : <Outlet />;
};

function App() {
    return (
        <Router>
            <Suspense fallback={<CarregandoPagina />}>
                <Routes>

                    {/* Agrupamento de rotas públicas */}
                    <Route element={<RotaPublica />}>
                        <Route path="/" element={<Login />} />
                        <Route path="/cadastro/usuario" element={<CadastroUsuario />} />
                    </Route>

                    {/* Agrupamento de rotas protegidas pelo Sanctum */}
                    <Route element={<RotaProtegida />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/chamados" element={<Chamados />} />
                        <Route path="/projetos" element={<Projeto />} />
                        <Route path="/noticias" element={<Noticia />} />
                        <Route path="/vaga" element={<Vaga />} />

                        <Route path="/visualizacao/vagas" element={<VisualizacaoVaga />} />
                        <Route path="/visualizacao/projetos" element={<VisualizacaoProjeto />} />
                        <Route path="/visualizacao/noticias" element={<VisualizacaoNoticia />} />

                        <Route path="/cadastro/curriculo" element={<CadastroCurriculo />} />
                        <Route path="/cadastro/projeto" element={<CadastroProjeto />} />
                        <Route path="/cadastro/noticia" element={<CadastroNoticia />} />
                        <Route path="/cadastro/vaga" element={<CadastroVaga />} />
                    </Route>

                    {/* Endereço antigo do login e qualquer rota inexistente */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;