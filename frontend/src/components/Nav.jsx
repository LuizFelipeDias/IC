import React, { useState, useEffect } from "react";

export default function Nav() {

    const [nomeUsuario, setNomeUsuario] = useState("PROFILE");

    useEffect(() => {
        const buscarUsuario = async () => {
            try {
                const token = localStorage.getItem("@hub:token");

                if (!token) return;

                const resposta = await fetch("http://localhost:8000/api/usuario/me", {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (resposta.ok) {
                    const dados = await resposta.json();

                    const nomeFinal = dados.nome || dados.name || "USUÁRIO";

                    const primeiroNome = nomeFinal.split(" ")[0];

                    setNomeUsuario(primeiroNome);ch
                }
            } catch (erro) {
                console.error("Erro ao buscar usuário logado:", erro);
            }
        };

        buscarUsuario().catch(console.error);
    }, []);

    // Função para lidar com a saída (logout)
    const handleExit = () => {
        localStorage.removeItem("@hub:token");
        window.location.href = "/";
    };

    return (
        <div style={{ width: "100%" }}>
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');

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
                <h1 className="logo">3D HUB</h1>

                <div className="nav-group">
                    <span className="nav-link hide-tablet">
                        NOTIFICATIONS
                    </span>
                    <span className="nav-link">MENU</span>

                    {/* Aqui o nome do usuário será exibido corretamente */}
                    <span className="nav-link">{nomeUsuario}</span>

                    <span className="nav-link btn-exit" onClick={handleExit}>
                        EXIT
                    </span>
                </div>
            </nav>
        </div>
    );
}