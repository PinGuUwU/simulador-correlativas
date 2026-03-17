const ESTADO_CONFIG = {
    Bloqueado: {
        estilo: "bg-default-50 border-default-200 hover:bg-default-100 hover:border-default-400",
        color: "default",
        icono: "fa-solid fa-lock",
    },
    Disponible: {
        estilo: "bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/40",
        color: "primary",
        icono: "fa-solid fa-lock-open",
    },
    Regular: {
        estilo: "bg-warning/10 border-warning/30 hover:bg-warning/20 hover:border-warning/40",
        color: "warning",
        icono: "fa-regular fa-clock",
    },
    Aprobado: {
        estilo: "bg-success/10 border-success/50 hover:bg-success/20 hover:border-success/40",
        color: "success",
        icono: "fa-regular fa-circle-check",
    },
};

export default {
    ESTADO_CONFIG
}