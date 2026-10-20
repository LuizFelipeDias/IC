import React from "react";
import { Recycle } from "lucide-react";

export default function Marca({ className = "" }) {
    return (
        <span className={`marca ${className}`}>
            <span className="marca__simbolo" aria-hidden="true">
                <Recycle size={18} strokeWidth={2.4} />
            </span>
            EcoHub <span className="marca__3d">3D</span>
        </span>
    );
}
