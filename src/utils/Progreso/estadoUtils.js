const ESTADO_CONFIG = {
    Bloqueado: {
        estilo: "bg-default-50/80 border-default-200/70 hover:bg-default-100/80 hover:border-default-300 text-default-600 dark:text-default-400 backdrop-blur-sm",
        color: "default",
        icono: "fa-solid fa-lock",
    },
    Disponible: {
        estilo: "bg-primary/8 border-primary/25 hover:bg-primary/15 hover:border-primary/35 text-primary-900 dark:text-primary-100",
        color: "primary",
        icono: "fa-solid fa-lock-open",
    },
    Cursando: {
        estilo: "bg-indigo-500/10 border-indigo-400/70 hover:bg-indigo-500/20 text-indigo-900 dark:text-indigo-100 font-bold",
        color: "secondary",
        icono: "fa-solid fa-pencil",
        pulso: true,
    },
    Regular: {
        estilo: "bg-warning/8 border-warning/30 hover:bg-warning/15 hover:border-warning/40 text-warning-900 dark:text-warning-100",
        color: "warning",
        icono: "fa-regular fa-clock",
    },
    Aprobado: {
        estilo: "bg-success/10 border-success/35 hover:bg-success/18 hover:border-success/50 text-success-900 dark:text-success-100 font-bold",
        color: "success",
        icono: "fa-regular fa-circle-check",
    },
    Promocionado: {
        estilo: "bg-emerald-500/15 border-emerald-400/60 hover:bg-emerald-500/20 hover:border-emerald-500/70 text-emerald-900 dark:text-emerald-100 font-black shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]",
        color: "success",
        icono: "fa-solid fa-crown",
    },
    Libre: {
        estilo: "bg-danger/8 border-danger/30 hover:bg-danger/15 hover:border-danger/45 text-danger-900 dark:text-danger-100 font-bold",
        color: "danger",
        icono: "fa-solid fa-user-slash",
    }
};

export default {
    ESTADO_CONFIG
}