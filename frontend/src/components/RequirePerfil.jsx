import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Carregando, Vazio } from "./ui";
import { useAuth } from "../contexts/AuthContext";

/**
 * Mostra a página apenas para quem tem ao menos um dos perfis informados.
 * A API aplica a mesma regra (middleware "perfil"); aqui é só a experiência de uso.
 */
export default function RequirePerfil({ perfis, children }) {
    const { carregando, pode, usuario } = useAuth();

    if (carregando) return <Carregando />;

    if (!pode(...perfis)) {
        return (
            <div className="container" style={{ paddingTop: "var(--esp-16)" }}>
                <Vazio
                    icone={Lock}
                    titulo="Seu perfil não tem acesso a esta área"
                    acao={<Link to="/home" className="botao">Voltar para o início</Link>}
                >
                    {usuario?.verificacao_status === "pendente"
                        ? "Seu cadastro de instituição ainda está em análise. Assim que for verificado, esta área é liberada."
                        : "Se você precisa desta funcionalidade, confira o tipo de perfil escolhido no cadastro."}
                </Vazio>
            </div>
        );
    }

    return children;
}
