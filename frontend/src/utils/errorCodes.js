/**
 * @fileoverview Diccionario de mapeo de errores de Firebase a mensajes
 * amigables en español. Los componentes NUNCA muestran códigos técnicos al usuario.
 *
 * Principio: capturar → mapear → presentar.
 */

// ─── Mensajes por código de error ────────────────────────────────────────────
const AUTH_ERROR_MESSAGES = {
    // Popup / OAuth
    'auth/popup-closed-by-user':      null, // intencional → no mostrar nada
    'auth/cancelled-popup-request':   null, // race entre popups → silencioso
    'auth/popup-blocked':             'El popup fue bloqueado por tu navegador. Habilitá los popups para este sitio.',

    // Red y disponibilidad
    'auth/network-request-failed':    'Sin conexión a internet. Revisá tu red e intentá de nuevo.',
    'auth/too-many-requests':         'Demasiados intentos fallidos. Esperá unos minutos antes de volver a intentar.',
    'auth/internal-error':            'Hubo un problema interno. Intentá de nuevo en unos segundos.',

    // Cuenta
    'auth/user-disabled':             'Esta cuenta fue deshabilitada. Contacta al soporte si creés que es un error.',
    'auth/account-exists-with-different-credential':
        'Ya existe una cuenta con ese email usando otro método de inicio de sesión.',

    // Firestore / permisos
    'permission-denied':              'No tenés permisos para realizar esta acción.',
    'unavailable':                    'El servicio no está disponible en este momento. Intentá de nuevo.',
    'not-found':                      'No se encontraron los datos solicitados.',
    'already-exists':                 'El registro ya existe.',
    'resource-exhausted':             'Límite de operaciones alcanzado. Intentá más tarde.',
};

const FALLBACK_MESSAGE = 'Ocurrió un error inesperado. Intentá de nuevo.';

// ─── Clase de error estructurado ─────────────────────────────────────────────

/**
 * Error enriquecido que los servicios lanzan hacia arriba.
 * Los componentes consumen `message` (humano) y pueden inspeccionar
 * `code` si necesitan lógica condicional.
 */
export class AppError extends Error {
    /**
     * @param {string} code   - Código original de Firebase (ej: 'auth/popup-blocked')
     * @param {string} message - Mensaje traducido listo para mostrar al usuario
     * @param {unknown} originalError - Error raw de Firebase para debugging interno
     */
    constructor(code, message, originalError = null) {
        super(message);
        this.name    = 'AppError';
        this.code    = code;
        this.originalError = originalError;
    }
}

// ─── Función pública de mapeo ─────────────────────────────────────────────────

/**
 * Convierte un error de Firebase en un `AppError` con mensaje legible.
 * Retorna `null` si el error es intencional y no debe mostrarse al usuario
 * (ej: el usuario cerró el popup manualmente).
 *
 * @param {unknown} firebaseError - Error capturado del SDK de Firebase
 * @returns {AppError | null}
 */
export const mapFirebaseError = (firebaseError) => {
    const code    = firebaseError?.code ?? 'unknown';
    const rawMsg  = AUTH_ERROR_MESSAGES[code];

    // undefined → código desconocido → mensaje genérico
    // null      → error intencional → no mostrar nada
    if (rawMsg === null) return null;

    const message = rawMsg ?? FALLBACK_MESSAGE;
    return new AppError(code, message, firebaseError);
};

/**
 * Devuelve true si el error es uno que el usuario produjo a propósito
 * (cerrar el popup, cancelar) y no debería mostrarse como alerta.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
export const isIntentionalAuthCancel = (error) => {
    const code = error?.code ?? '';
    return (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
    );
};
