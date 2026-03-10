const ESTADO_CONFIG = {
    Bloqueado: {
        estilo: "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-400",
        color: "default",
        icono: "fa-solid fa-lock",
    },
    Disponible: {
        estilo: "bg-blue-100 border-blue-300 hover:bg-blue-200 hover:border-blue-400",
        color: "primary",
        icono: "fa-solid fa-lock-open",
    },
    Regular: {
        estilo: "bg-yellow-50 border-yellow-200 hover:bg-yellow-200 hover:border-yellow-400",
        color: "warning",
        icono: "fa-regular fa-clock",
    },
    Aprobado: {
        estilo: "bg-green-100 border-green-500 hover:bg-green-200 hover:border-green-400",
        color: "success",
        icono: "fa-regular fa-circle-check",
    },
};

export default {
    ESTADO_CONFIG
}