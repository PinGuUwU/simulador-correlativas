const ESTADO_CONFIG = {
    Bloqueado: {
        estilo: "bg-default-50 border-default-200 hover:bg-default-100 hover:border-default-400 text-default-700 dark:text-default-300",
        color: "default",
        icono: "fa-solid fa-lock",
    },
    Disponible: {
        estilo: "bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/40 text-primary-950 dark:text-primary-100",
        color: "primary",
        icono: "fa-solid fa-lock-open",
    },
    Regular: {
        estilo: "bg-warning/10 border-warning/40 hover:bg-warning/20 hover:border-warning/50 text-warning-950 dark:text-warning-100",
        color: "warning",
        icono: "fa-regular fa-clock",
    },
    Aprobado: {
        estilo: "bg-success/20 border-success/50 hover:bg-success/30 hover:border-success/60 text-success-950 dark:text-success-100 font-bold",
        color: "success",
        icono: "fa-regular fa-circle-check",
    },
};

export default {
    ESTADO_CONFIG
}