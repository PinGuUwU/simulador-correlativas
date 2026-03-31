import { saveUserProgreso } from './dbService';

const QUEUE_KEY = 'sync_pending_queue';
let debounceTimeout = null;
let isFlushing = false;

/**
 * Encola una actualización pendiente en la cola de LocalStorage (Offline-First)
 */
const enqueueToLocalStorage = (uid, plan, progreso) => {
    let queue = [];
    try {
        const stored = localStorage.getItem(QUEUE_KEY);
        if (stored) queue = JSON.parse(stored);
    } catch (e) {
        console.warn("Error leyendo la cola de sincronización:", e);
    }

    // Buscamos si ya hay una entrada para este UID y plan, para actualizarla (y no duplicar)
    const existingIndex = queue.findIndex(item => item.uid === uid && item.plan === plan);
    if (existingIndex !== -1) {
        queue[existingIndex].progreso = progreso;
    } else {
        queue.push({ uid, plan, progreso });
    }

    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Ejecuta un flush de la cola guardada localmente hacia Firestore
 */
export const flushSyncQueue = async () => {
    if (isFlushing || !navigator.onLine) return;

    let queue = [];
    try {
        const stored = localStorage.getItem(QUEUE_KEY);
        if (stored) queue = JSON.parse(stored);
    } catch (e) {
        return;
    }

    if (queue.length === 0) return;

    isFlushing = true;
    const remainingQueue = [];

    // Verificamos e intentamos sincronizar cada elemento pendiente
    for (const item of queue) {
        try {
            await saveUserProgreso(item.uid, item.plan, item.progreso);
        } catch (error) {
            console.error("Fallo al sincronizar un item a Firestore:", error);
            // Si el guardado falla, conservamos la partida en la cola para intentar más adelante
            remainingQueue.push(item);
        }
    }

    // Actualizamos LocalStorage dejando solo los que fallaron (si todo salió bien, guardará array vacío)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
    isFlushing = false;
};

/**
 * Suscribe un listener global a la ventana para reanudar la sincronización automáticamente
 * tan pronto el navegador detecte que se reanudó la conexión.
 */
export const initOfflineListener = () => {
    window.addEventListener('online', () => {
        console.log("Conexión restablecida. Sincronizando pendientes...");
        flushSyncQueue();
    });
};

/**
 * Función principal para usar desde los hooks.
 * Implementa un "debounce" de 3 segundos para evitar saturar la cuota de escrituras y enviar updates contínuos
 */
export const syncProgreso = (uid, plan, progreso) => {
    // 1. Guardar de forma local SIEMPRE para soportar caso offline y resguardar la manipulación
    enqueueToLocalStorage(uid, plan, progreso);

    // 2. Limpiar el temporizador anterior para reiniciar el debounce si el usuario interactuó rápido nuevamente
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }

    // 3. Setear encolamiento, tras 3 segundos de inactividad, se iniciará la sincronización en nube
    debounceTimeout = setTimeout(() => {
        flushSyncQueue();
    }, 3000);
};
