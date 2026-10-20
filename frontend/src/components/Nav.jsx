import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Nav() {
    const { usuario, sair } = useAuth();
    const navigate = useNavigate();

    const nomeUsuario = usuario?.nome ? usuario.nome.split(" ")[0] : "PROFILE";

    // Logout revoga o token no servidor antes de voltar ao login.
    const handleExit = async () => {
        await sair();
        navigate("/", { replace: true });
    };

    return (
        <div style={{ width: "100%" }}>
            <style>
                {`
          .nav-bg {
            background-color: white; 
            height: 67px;              
            width: 100%;
            display: flex;
            align-items: center;       
            justify-content: space-between; 
            padding: 0 48px;           
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
          }

          .logo {
            font-size: 25px;
            font-weight: 800;
            color: #000;
            margin: 0;
            cursor: pointer;
          }

          .nav-group {
            display: flex;
            align-items: center;       
            gap: 40px;                 
          }

          .nav-link {
            font-size: 14px;
            font-weight: 700;
            color: #000;
            text-decoration: none;
            text-transform: uppercase;
            cursor: pointer;
            position: relative;
          }

          .nav-link:not(.btn-exit)::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            bottom: -5px;
            left: 0;
            background-color: #e31c1c;
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }

          .nav-link:hover::after {
            transform: scaleX(1);
          }

          .btn-exit {
            border: 1px solid #ff0066;
            color: #ff0066;
            padding: 8px 20px;
            border-radius: 6px;
            background: transparent;
            font-weight: 700;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-exit:hover {
            background-color: #ff0066;
            color: #fff;
          }

          @media (max-width: 900px) {
            .hide-tablet { display: none; }
            .nav-bg { padding: 0 20px; }
            .nav-group { gap: 20px; }
          }
        `}
            </style>

            <nav className="nav-bg">
                <h1 className="logo" onClick={() => navigate("/home")}>3D HUB</h1>

                <div className="nav-group">
                    <span className="nav-link hide-tablet">
                        NOTIFICATIONS
                    </span>
                    <span className="nav-link">MENU</span>

                    {/* Aqui o nome do usuário será exibido corretamente */}
                    <span className="nav-link">{nomeUsuario}</span>

                    <button type="button" className="nav-link btn-exit" onClick={handleExit}>
                        EXIT
                    </button>
                </div>
            </nav>
        </div>
    );
}