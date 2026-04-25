import { saveUserProgreso, getUserData } from './dbService';

/**
 * Sube el progreso actual de un plan a la nube de forma manual.
 * Se asegura de leer tanto el progreso (estados) como los detalles (notas, fechas)
 * desde el localStorage antes de enviarlos.
 */
export const uploadPlanProgress = async (uid, plan) => {
    try {
        const progreso = JSON.parse(localStorage.getItem(`progreso+${plan}`));
        const detalles = JSON.parse(localStorage.getItem(`detalles_progreso+${plan}`));

        if (!progreso) {
            throw new Error("No hay datos locales para este plan.");
        }

        // Se pasa tanto el progreso como los detalles al servicio de base de datos.
        await saveUserProgreso(uid, plan, progreso, detalles || {});
        return true;
    } catch (error) {
        if (import.meta.env.DEV) console.error("Error al subir datos:", error);
        throw error;
    }
};

/**
 * Descarga TODO el progreso y detalles desde la nube y lo guarda en local.
 * Esta función es la que se llama al iniciar sesión o al presionar "Cargar".
 */
export const downloadAllProgress = async (uid) => {
    try {
        const cloudData = await getUserData(uid);
        if (!cloudData) return false;

        let progreso = cloudData.progreso || {};
        let detalles = cloudData.progresoDetalles || {};
        let simulaciones = cloudData.simulaciones || {};

        // Normalización: Extraemos datos de llaves con puntos literales (ej: "progreso.17.14")
        // y también intentamos aplanar mapas anidados que pudieron crearse por el bug de updateDoc
        Object.keys(cloudData).forEach(key => {
            if (key.startsWith('progreso.')) {
                const plan = key.substring('progreso.'.length);
                if (!progreso[plan]) progreso[plan] = cloudData[key];
            }
            if (key.startsWith('progresoDetalles.')) {
                const plan = key.substring('progresoDetalles.'.length);
                if (!detalles[plan]) detalles[plan] = cloudData[key];
            }
            if (key.startsWith('simulaciones.')) {
                const plan = key.substring('simulaciones.'.length);
                if (!simulaciones[plan]) simulaciones[plan] = cloudData[key];
            }
        });

        // Caso especial: si el bug de updateDoc creó { progreso: { "17": { "14": ... } } }
        // Necesitamos reconstruir "17.14" en el mapa plano
        if (progreso['17'] && typeof progreso['17'] === 'object' && progreso['17']['14']) {
            if (!progreso['17.14']) progreso['17.14'] = progreso['17']['14'];
        }
        if (detalles['17'] && typeof detalles['17'] === 'object' && detalles['17']['14']) {
            if (!detalles['17.14']) detalles['17.14'] = detalles['17']['14'];
        }

        if (import.meta.env.DEV) console.log("🛠️ Progreso procesado para sincronización:", { progreso, detalles });

        if (Object.keys(progreso).length === 0) {
            return false;
        }

        // Limpiamos cualquier progreso local viejo para evitar mezclas indeseadas.
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('progreso+') || key.startsWith('detalles_progreso+') || key.startsWith('simulacion+')) {
                localStorage.removeItem(key);
            }
        });
        
        // Escribimos los datos de la nube en el localStorage.
        for (const [plan, data] of Object.entries(progreso)) {
            localStorage.setItem(`progreso+${plan}`, JSON.stringify(data));
        }

        for (const [plan, data] of Object.entries(detalles)) {
            localStorage.setItem(`detalles_progreso+${plan}`, JSON.stringify(data));
        }

        for (const [plan, data] of Object.entries(simulaciones)) {
            localStorage.setItem(`simulacion+${plan}`, JSON.stringify(data));
        }

        if (cloudData.config?.tema) {
            localStorage.setItem('theme', cloudData.config.tema);
        }

        if (cloudData.config?.planActivo) {
            localStorage.setItem('plan_activo', cloudData.config.planActivo);
        }

        // Avisamos a la UI que los datos han cambiado y necesita recargarse.
        window.dispatchEvent(new Event('progress-hydrated'));
        window.dispatchEvent(new Event('storage'));
        
        return cloudData;
    } catch (error) {
        if (import.meta.env.DEV) console.error("Error al descargar datos:", error);
        throw error;
    }
};
