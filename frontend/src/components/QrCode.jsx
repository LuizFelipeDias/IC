import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR Code gerado no navegador apontando para a página pública de rastreio do lote. */
export default function QrCode({ codigo, tamanho = 168 }) {
    const [imagem, setImagem] = useState(null);
    const url = `${window.location.origin}/rastreio/${codigo}`;

    useEffect(() => {
        QRCode.toDataURL(url, { margin: 1, width: tamanho * 2, color: { dark: "#0c0b14", light: "#ffffff" } })
            .then(setImagem)
            .catch(() => setImagem(null));
    }, [url, tamanho]);

    return (
        <a className="qr" href={url} title="Abrir página de rastreio">
            {imagem ? <img src={imagem} width={tamanho} height={tamanho} alt={`QR Code do lote ${codigo}`} /> : <span style={{ display: "block", width: tamanho, height: tamanho }} />}
        </a>
    );
}
