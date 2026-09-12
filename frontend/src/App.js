import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './styles/App.css';

// Importação das páginas principais
import Login from './pages/Login';
import CadastroUsuario from './pages/Cadastro/CadastroUsuario';
import Home from './pages/Home';
import Vaga from './pages/Vaga';
import Projeto from './pages/Projeto';
import Noticia from './pages/Noticia';
import Chamados from "./pages/Chamados";

// Importação das páginas de cadastro
import CadastroCurriculo from './pages/Cadastro/CadastroCurriculo';
import CadastroNoticia from './pages/Cadastro/CadastroNoticia';
import CadastroProjeto from './pages/Cadastro/CadastroProjeto';
import CadastroVaga from './pages/Cadastro/CadastroVaga';

// Importação das páginas de visualização detalhada
import VisualizacaoVaga from './pages/Visualizacao/VisualizacaoVaga';
import VisualizacaoProjeto from './pages/Visualizacao/VisualizacaoProjeto';
import VisualizacaoNoticia from './pages/Visualizacao/VisualizacaoNoticia';
import VisualizacaoChamado from './pages/Visualizacao/VisualizacaoChamados';
import VisualizacaoCurriculo from './pages/Visualizacao/VisualizacaoCurriculo';

// Componente porteiro para restringir acesso a rotas privadas
const RotaProtegida = () => {
    const token = localStorage.getItem('@hub:token');
    // Só deixa passar se o token existir e não for a palavra "null" ou "undefined"
    const tokenValido = token && token !== 'null' && token !== 'undefined' && token !== '';
    return tokenValido ? <Outlet /> : <Navigate to="/" replace />;
};

// Componente para barrar o acesso à tela de login se já estiver autenticado
const RotaPublica = () => {
    const token = localStorage.getItem('@hub:token');
    // Só manda pra Home se o token for de fato válido
    const tokenValido = token && token !== 'null' && token !== 'undefined' && token !== '';
    return tokenValido ? <Navigate to="/home" replace /> : <Outlet />;
};

function App() {
    return (
        <Router>
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

                    <Route path="/Visualizacao/VisualizacaoVagas" element={<VisualizacaoVaga />} />
                    <Route path="/Visualizacao/VisualizacaoProjetos" element={<VisualizacaoProjeto />} />
                    <Route path="/Visualizacao/VisualizacaoNoticias" element={<VisualizacaoNoticia />} />
                    <Route path="/Visualizacao/VisualizacaoChamados" element={<VisualizacaoChamado />} />
                    <Route path="/Visualizacao/VisualizacaoCurriculos" element={<VisualizacaoCurriculo />} />

                    <Route path="/cadastro/curriculo" element={<CadastroCurriculo />} />
                    <Route path="/cadastro/projeto" element={<CadastroProjeto />} />
                    <Route path="/cadastro/noticia" element={<CadastroNoticia />} />
                    <Route path="/cadastro/vaga" element={<CadastroVaga />} />
                </Route>

            </Routes>
        </Router>
    );
}

export default App;