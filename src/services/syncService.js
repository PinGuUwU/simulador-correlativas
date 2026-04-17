import { saveUserProgreso, getUserData } from './dbService';
import { auth } from './firebase';
import { addToast } from '@heroui/react';

/**
 * Sube el progreso actual de un plan a la nube de forma manual.
 */
export const uploadPlanProgress = async (uid, plan) => {
    try {
        const progreso = JSON.parse(localStorage.getItem(`progreso+${plan}`));
        const detalles = JSON.parse(localStorage.getItem(`detalles_progreso+${plan}`));

        if (!progreso) {
            throw new Error("No hay datos locales para este plan.");
        }

        await saveUserProgreso(uid, plan, progreso, detalles);
        return true;
    } catch (error) {
        console.error("Error al subir datos:", error);
        throw error;
    }
};

/**
 * Descarga el progreso desde la nube y lo guarda en local.
 */
export const downloadAllProgress = async (uid) => {
    try {
        const cloudData = await getUserData(uid);
        if (!cloudData) return false;

        if (cloudData.progreso) {
            for (const [plan, data] of Object.entries(cloudData.progreso)) {
                localStorage.setItem(`progreso+${plan}`, JSON.stringify(data));
            }
        }

        if (cloudData.progresoDetalles) {
            for (const [plan, data] of Object.entries(cloudData.progresoDetalles)) {
                localStorage.setItem(`detalles_progreso+${plan}`, JSON.stringify(data));
            }
        }

        if (cloudData.config?.tema) {
            localStorage.setItem('theme', cloudData.config.tema);
        }

        // Avisar a la UI que los datos cambiaron
        window.dispatchEvent(new Event('progress-hydrated'));
        window.dispatchEvent(new Event('storage'));
        
        return true;
    } catch (error) {
        console.error("Error al descargar datos:", error);
        throw error;
    }
};
