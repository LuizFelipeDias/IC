/* Formatadores e rótulos usados em toda a interface. */

export const formatarData = (valor, opcoes = {}) =>
    valor ? new Date(valor).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", ...opcoes }) : "—";

export const formatarDataHora = (valor) =>
    valor ? new Date(valor).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

/** Datas só com dia (YYYY-MM-DD) sem deslocamento de fuso. */
export const formatarDia = (valor) => (valor ? formatarData(`${valor}T12:00:00`) : "—");

export const formatarPeso = (gramas) => {
    if (gramas == null) return "—";
    return gramas >= 1000 ? `${(gramas / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg` : `${gramas} g`;
};

export const formatarBytes = (bytes) => {
    if (bytes == null) return "—";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
};

export const iniciais = (nome = "") =>
    nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join("") || "?";

export const tempoRelativo = (valor) => {
    if (!valor) return "";
    const dias = Math.round((Date.now() - new Date(valor).getTime()) / 86400000);
    if (dias <= 0) return "hoje";
    if (dias === 1) return "ontem";
    if (dias < 30) return `há ${dias} dias`;
    return formatarData(valor);
};

export const TIPOS_USUARIO = {
    pessoa_fisica: "Pessoa física",
    empresa: "Empresa",
    escola: "Escola",
    laboratorio: "Laboratório",
};

export const AREAS_PROJETO = {
    saude: "Saúde",
    educacao: "Educação",
    agro: "Agro",
    acessibilidade: "Acessibilidade",
    outro: "Outro",
};

export const LICENCAS = {
    "cc-by": { nome: "CC BY 4.0", descricao: "Uso livre com atribuição." },
    "cc-by-sa": { nome: "CC BY-SA 4.0", descricao: "Atribuição e mesma licença nas derivações." },
    "cc-by-nc": { nome: "CC BY-NC 4.0", descricao: "Atribuição, sem uso comercial." },
    "cc-by-nc-sa": { nome: "CC BY-NC-SA 4.0", descricao: "Atribuição, sem uso comercial, mesma licença." },
    cc0: { nome: "CC0 1.0", descricao: "Domínio público." },
};

export const TIPOS_DOACAO = {
    peca_excedente: "Peça excedente",
    carretel_usado: "Carretel usado",
    resto_filamento: "Resto de filamento",
};

export const STATUS_PUBLICACAO = {
    publicado: { rotulo: "Publicado", tom: "sucesso" },
    em_revisao: { rotulo: "Em revisão", tom: "alerta" },
    rejeitado: { rotulo: "Rejeitado", tom: "perigo" },
};

export const STATUS_CHAMADO = {
    Aberto: "info",
    "Em Atendimento": "alerta",
    Resolvido: "sucesso",
    Cancelado: "neutro",
};

export const STATUS_COLETA = {
    pendente: { rotulo: "Aguardando doador", tom: "alerta" },
    aceita: { rotulo: "Aceita", tom: "info" },
    agendada: { rotulo: "Agendada", tom: "primaria" },
    concluida: { rotulo: "Concluída", tom: "sucesso" },
    recusada: { rotulo: "Recusada", tom: "perigo" },
    cancelada: { rotulo: "Cancelada", tom: "neutro" },
};

export const STATUS_LOTE = {
    em_processamento: { rotulo: "Em processamento", tom: "info" },
    aguardando_laudo: { rotulo: "Aguardando laudo", tom: "alerta" },
    aprovado: { rotulo: "Aprovado", tom: "sucesso" },
    reprovado: { rotulo: "Reprovado", tom: "perigo" },
    distribuido: { rotulo: "Distribuído", tom: "primaria" },
};

export const EVENTOS_LOTE = {
    coletado: "Material coletado",
    triturado: "Triturado",
    extrudado: "Extrudado em filamento",
    laudo_emitido: "Laudo emitido",
    enviado: "Enviado",
    utilizado: "Utilizado em peça",
};
