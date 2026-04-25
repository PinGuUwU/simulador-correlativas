/**
 * @fileoverview Servicio de logging propietario con control de entorno,
 * throttling y sanitización de PII.
 *
 * Contratos de seguridad:
 *  ✅ NUNCA lanza excepciones — fire-and-forget garantizado.
 *  ✅ En DEV: imprime por consola, NO escribe en Firestore (preserva cuota Spark).
 *  ✅ En PROD: escribe en Firestore, SIN logs en consola del cliente.
 *  ✅ Throttling: máx. 5 escrituras por ventana de 60 s (evita inundación por bucle).
 *  ✅ PII: elimina emails, teléfonos, IPs y campos de objeto User de Firebase.
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { trackErrorGA } from './analyticsService';

// ─── Entorno ──────────────────────────────────────────────────────────────────
const IS_DEV = import.meta.env.DEV === true;

// ─── Niveles de log ───────────────────────────────────────────────────────────
export const LOG_LEVEL = Object.freeze({
    ERROR:   'error',
    WARNING: 'warning',
    INFO:    'info',
});

// ─── Throttle (máx. 5 logs por 60 segundos) ──────────────────────────────────
const THROTTLE_LIMIT  = 5;
const THROTTLE_WINDOW = 60_000; // ms

// Estado del throttle en memoria (se resetea al recargar la página)
const _throttle = {
    count:     0,
    windowStart: Date.now(),
};

/**
 * Devuelve true si el log puede escribirse (dentro del límite).
 * Resetea el contador automáticamente cuando pasa la ventana de tiempo.
 * @returns {boolean}
 */
const canLog = () => {
    const now = Date.now();
    if (now - _throttle.windowStart >= THROTTLE_WINDOW) {
        _throttle.count = 0;
        _throttle.windowStart = now;
    }
    if (_throttle.count >= THROTTLE_LIMIT) return false;
    _throttle.count++;
    return true;
};

// ─── Sanitización de PII ──────────────────────────────────────────────────────

/**
 * Campos del objeto User de Firebase y otros PII que nunca deben llegar a los logs.
 * Hay que eliminarlos antes de cualquier escritura.
 */
const PII_FIELDS = new Set([
    'email', 'phoneNumber', 'photoURL', 'displayName',
    'providerData', 'refreshToken', 'stsTokenManager',
    'accessToken', 'idToken', 'password', 'token', 'secret',
    'ip', 'ipAddress', 'creditCard', 'ssn',
]);

/** Regex para detectar emails o teléfonos en strings */
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const PHONE_RE = /(\+?\d[\d\s\-().]{7,}\d)/g;

/**
 * Sanitiza un string: reemplaza emails y teléfonos por placeholders.
 * @param {string} str
 * @returns {string}
 */
const sanitizeString = (str) =>
    str
        .replace(EMAIL_RE, '[EMAIL]')
        .replace(PHONE_RE, '[PHONE]');

/**
 * Sanitiza un objeto de contexto:
 *  - Elimina campos PII por nombre
 *  - Mantiene solo primitivos (string, number, boolean)
 *  - Sanitiza strings con regex
 *  - Trunca strings largos
 *
 * @param {Record<string, unknown>} ctx
 * @returns {Record<string, string | number | boolean>}
 */
const sanitizeContext = (ctx) =>
    Object.fromEntries(
        Object.entries(ctx)
            .filter(([key]) => !PII_FIELDS.has(key))
            .filter(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
            .map(([key, v]) => [
                key,
                typeof v === 'string'
                    ? sanitizeString(String(v)).slice(0, 200)
                    : v,
            ])
    );

/**
 * Sanitiza el mensaje de error: quita emails/teléfonos y trunca el stack.
 * @param {string} msg
 * @returns {string}
 */
const sanitizeMessage = (msg) =>
    sanitizeString(String(msg))
        // Eliminar líneas de stacktrace (contienen rutas de archivos)
        .replace(/\s+at\s+.+/g, '')
        .trim()
        .slice(0, 500);

// ─── Escritura interna ────────────────────────────────────────────────────────

/**
 * Imprime en consola de desarrollo con nivel correcto.
 * SOLO se ejecuta en DEV.
 */
const devLog = (level, errorCode, errorMessage, context) => {
    const prefix = `[LogService:${level.toUpperCase()}] ${errorCode}`;
    if (level === LOG_LEVEL.ERROR)   { if (import.meta.env.DEV) console.error(prefix, errorMessage, context); return; }
    if (level === LOG_LEVEL.WARNING) { if (import.meta.env.DEV) console.warn (prefix, errorMessage, context); return; }
    if (import.meta.env.DEV) console.info(prefix, errorMessage, context);
};

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Escribe (o imprime en DEV) un log de la aplicación.
 * Fire-and-forget garantizado: nunca lanza, nunca rompe la UI.
 *
 * @param {{
 *   level?:        'error' | 'warning' | 'info',
 *   errorCode?:    string,
 *   errorMessage?: string,
 *   route?:        string,
 *   userId?:       string | null,
 *   context?:      Record<string, unknown>,
 * }} params
 * @returns {void}
 */
export const writeLog = ({
    level        = LOG_LEVEL.ERROR,
    errorCode    = 'unknown',
    errorMessage = 'Sin detalle',
    route        = window?.location?.pathname ?? '/',
    userId       = null,
    context      = {},
}) => {
    // Descarte rápido si el throttle está saturado
    if (!canLog()) return;

    const cleanMessage = sanitizeMessage(errorMessage);
    const cleanContext  = sanitizeContext(context);

    // Trackear error en Analytics (sin datos sensibles)
    if (level !== LOG_LEVEL.INFO) {
        trackErrorGA({ 
            code: errorCode, 
            message: cleanMessage, 
            fatal: level === LOG_LEVEL.ERROR 
        });
    }

    // ── Modo DEV: solo consola, sin Firestore ─────────────────────────────────
    if (IS_DEV) {
        devLog(level, errorCode, cleanMessage, cleanContext);
        return;
    }

    // ── Modo PROD: Firestore, sin consola ─────────────────────────────────────
    const logEntry = {
        level,
        errorCode,
        errorMessage:  cleanMessage,
        route,
        // userId puede ser null (usuario no autenticado): es aceptable
        userId,
        context:       cleanContext,
        timestamp:     serverTimestamp(),
        schemaVersion: 1,
    };

    addDoc(collection(db, 'app_logs'), logEntry).catch(() => {
        // Silencio total en producción. El log nunca debe romper la UX.
    });
};

/**
 * Shorthand para loguear errores desde bloques `catch`.
 * Extrae solo `code` y `message` del error — nunca el objeto completo.
 *
 * @param {unknown} err
 * @param {{ route?: string, userId?: string | null, context?: Record<string, unknown> }} [opts]
 * @returns {void}
 */
export const logError = (err, opts = {}) => {
    writeLog({
        level:        LOG_LEVEL.ERROR,
        errorCode:    err?.code ?? 'js/unhandled',
        // Extraemos solo el mensaje, no el objeto Error completo
        errorMessage: err?.message ?? String(err),
        ...opts,
    });
};

/**
 * Shorthand para advertencias no críticas.
 *
 * @param {string} message
 * @param {{ route?: string, userId?: string | null, context?: Record<string, unknown> }} [opts]
 * @returns {void}
 */
export const logWarning = (message, opts = {}) => {
    writeLog({
        level:        LOG_LEVEL.WARNING,
        errorCode:    'app/warning',
        errorMessage: message,
        ...opts,
    });
};
