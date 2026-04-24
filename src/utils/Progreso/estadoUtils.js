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
        estilo: "bg-violet-500/15 border-violet-400/60 hover:bg-violet-500/20 hover:border-violet-500/70 text-violet-900 dark:text-violet-100 font-black shadow-[0_0_12px_-2px_rgba(139,92,246,0.4)]",
        color: "secondary",
        icono: "fa-solid fa-crown",
    },
    Libre: {
        estilo: "bg-danger/8 border-danger/30 hover:bg-danger/15 hover:border-danger/45 text-danger-900 dark:text-danger-100 font-bold",
        color: "danger",
        icono: "fa-solid fa-user-slash",
    },
    // --- Estados para el Simulador Dinámico ---
    Seleccionada: {
        estilo: "bg-primary/20 border-primary shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)] ring-2 ring-primary/20 text-primary-900 dark:text-primary-100 font-black scale-105 z-10 transition-all duration-300",
        color: "primary",
        icono: "fa-solid fa-check-double",
    },
    Proyectada: {
        estilo: "bg-default-100/40 border-dashed border-default-300 opacity-60 hover:opacity-100 transition-opacity text-default-600",
        color: "default",
        icono: "fa-solid fa-wand-magic-sparkles",
    },
    Aprobada: {
        estilo: "bg-success/20 border-success/40 text-success-800 dark:text-success-200 opacity-80",
        color: "success",
        icono: "fa-solid fa-circle-check",
    }
};

export default {
    ESTADO_CONFIG
}