/**
 * @fileoverview Servicio centralizado de Firebase Analytics.
 *
 * Todos los trackeos pasan por este módulo. Los componentes no importan
 * `logEvent` directamente para que sea fácil mockear en tests o cambiar
 * el proveedor de analytics en el futuro.
 *
 * Convención de nombres de eventos: snake_case, máx 40 caracteres (límite GA4).
 */

import { analytics } from './firebase';

// Guard: en entornos donde analytics no está disponible (SSR, tests), no falla
const track = async (eventName, params = {}) => {
    try {
        if (!analytics) return;
        const { logEvent } = await import('firebase/analytics');
        logEvent(analytics, eventName, params);
    } catch {
        // Never break the app for a tracking failure
    }
};

// ─── Eventos de Autenticación ─────────────────────────────────────────────────

/**
 * Trackea un login exitoso con Google.
 * @param {{ userId: string }} params
 */
export const trackLogin = ({ userId }) =>
    track('login', { method: 'google', uid: userId });

/**
 * Trackea el cierre de sesión.
 */
export const trackLogout = () =>
    track('logout');

// ─── Eventos de Navegación ────────────────────────────────────────────────────

/**
 * Trackea una vista de página (page_view) al cambiar de ruta.
 * @param {{ path: string, title?: string }} params
 */
export const trackPageView = ({ path, title = document.title }) =>
    track('page_view', { page_path: path, page_title: title });

// ─── Eventos de Progreso ──────────────────────────────────────────────────────

/**
 * Trackea cuando el usuario cambia el estado de una materia en /progreso.
 * @param {{ plan: string, codigoMateria: string, estadoNuevo: string }} params
 */
export const trackCambioMateria = ({ plan, codigoMateria, estadoNuevo }) =>
    track('cambio_materia', { plan, codigo: codigoMateria, estado: estadoNuevo });

/**
 * Trackea cuando el usuario guarda su simulación.
 * @param {{ plan: string, semestresCompletados: number }} params
 */
export const trackGuardarSimulacion = ({ plan, semestresCompletados }) =>
    track('guardar_simulacion', { plan, semestres: semestresCompletados });

/**
 * Trackea cuando el usuario avanza al siguiente semestre en el simulador.
 * @param {{ plan: string, anio: number, cuatri: string }} params
 */
export const trackAvanceSemestre = ({ plan, anio, cuatri }) =>
    track('avance_semestre', { plan, anio, cuatri });

// ─── Eventos de UI ────────────────────────────────────────────────────────────

/**
 * Trackea cuando el usuario cambia el tema visual.
 * @param {{ tema: string }} params
 */
export const trackCambioTema = ({ tema }) =>
    track('cambio_tema', { tema });

/**
 * Trackea la descarga del PDF del historial.
 * @param {{ plan: string }} params
 */
export const trackDescargaPDF = ({ plan }) =>
    track('descarga_pdf', { plan });
