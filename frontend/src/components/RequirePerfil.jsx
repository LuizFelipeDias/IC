import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Mostra a página apenas para quem tem ao menos um dos perfis informados.
 * A API aplica a mesma regra (middleware "perfil"); aqui é só a experiência de uso.
 */
export default function RequirePerfil({ perfis, children }) {
    const { carregando, pode } = useAuth();

    if (carregando) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[11px] font-bold uppercase tracking-widest text-[#858585]">
                Carregando...
            </div>
        );
    }

    if (!pode(...perfis)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center font-['Inter',sans-serif]">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#858585] font-bold">Acesso restrito</p>
                <h1 className="text-[24px] font-black uppercase">Seu perfil não tem acesso a esta área</h1>
                <p className="text-[14px] text-[#555] max-w-md">
                    Se você precisa desta funcionalidade, confira o tipo de perfil escolhido no cadastro.
                </p>
                <Link to="/home" className="mt-2 px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand transition-colors">
                    Voltar para o início
                </Link>
            </div>
        );
    }

    return children;
}
