import { addToast as heroAddToast, closeAll } from "@heroui/react";

/**
 * Wrapper global para Toasts.
 * Asegura que no se acumulen visualmente cerrando los anteriores antes de mostrar uno nuevo.
 */
export const addToastCustom = (props) => {
    // Cerramos todos los anteriores para que solo haya uno a la vez en pantalla (Singleton)
    if (typeof closeAll === 'function') {
        try { closeAll(); } catch { }
    }

    heroAddToast({
        ...props,
        timeout: 3000 // Tiempo estándar de visibilidad
    });
};
