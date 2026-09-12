import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [usuario, setUsuario] = useState(null);

    const deslogar = () => {
        localStorage.removeItem("@hub:token");
        window.location.href = "/";
    };

    useEffect(() => {
        const buscarUsuario = async () => {
            const token = localStorage.getItem("@hub:token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:8000/api/usuario/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json"
                    }
                });

                // A barreira de segurança que evita a tela branca!
                if (res.status === 401 || res.status === 403) {
                    deslogar();
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setUsuario(data);
                }
            } catch (error) {
                console.error("Erro na Navbar:", error);
            }
        };

        buscarUsuario();
    }, []);

    return (
        <nav className="w-full h-[80px] bg-white border-b border-[#f0f0f0] flex items-center justify-between px-6 md:px-12 font-['Inter',sans-serif]">
            <div className="flex items-center gap-8">
                <Link to="/home" className="text-[18px] font-black tracking-[0.2em] uppercase text-black hover:text-[#3800df] transition-colors">
                    HUB
                </Link>
                {/* Outros links de navegação podem ser colocados aqui */}
            </div>

            <div className="flex items-center gap-4 md:gap-8">
                {usuario ? (
                    <span className="hidden md:inline-block text-[11px] font-bold tracking-widest uppercase text-[#858585]">
                        {usuario.nome || "Usuário"}
                    </span>
                ) : null}

                <button
                    onClick={deslogar}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-white bg-black px-5 py-3 hover:bg-[#3800df] transition-colors cursor-pointer"
                >
                    SAIR
                </button>
            </div>
        </nav>
    );
}