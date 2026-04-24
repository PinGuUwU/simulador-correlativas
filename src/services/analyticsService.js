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

/**
 * Asocia los eventos de la sesión con un ID de usuario único.
 * @param {string | null} userId
 */
export const setAnalyticsUser = async (userId) => {
    try {
        if (!analytics) return;
        const { setUserId } = await import('firebase/analytics');
        setUserId(analytics, userId);
    } catch {
        // Silencio
    }
};

// ─── Eventos de Autenticación ─────────────────────────────────────────────────

/**
 * Trackea un login exitoso con Google.
 * @param {{ userId: string }} params
 */
export const trackLogin = ({ userId }) => {
    setAnalyticsUser(userId);
    track('login', { method: 'google', uid: userId });
};

/**
 * Trackea el cierre de sesión.
 */
export const trackLogout = () => {
    setAnalyticsUser(null);
    track('logout');
};

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

// ─── Eventos de UI y Feedback ─────────────────────────────────────────────────

/**
 * Trackea una búsqueda de materia.
 * Útil para detectar si los usuarios buscan cosas que no existen.
 * @param {{ term: string, resultsCount: number, context: string }} params
 */
export const trackSearch = ({ term, resultsCount, context }) => {
    if (!term || term.length < 3) return; // Evitar ruido de búsquedas cortas
    track('search_materia', { 
        search_term: term.toLowerCase(), 
        results_count: resultsCount,
        context: context // 'equivalencias', 'progreso', etc.
    });
};

/**
 * Trackea la interacción con el tutorial.
 * @param {{ action: 'start' | 'step_view' | 'complete' | 'skip', stepIndex?: number, stepTitle?: string }} params
 */
export const trackTutorial = ({ action, stepIndex, stepTitle }) =>
    track('tutorial_progreso', { 
        action, 
        step_index: stepIndex, 
        step_title: stepTitle 
    });

/**
 * Trackea un error capturado por la app en GA4.
 * @param {{ code: string, message: string, fatal?: boolean }} params
 */
export const trackErrorGA = ({ code, message, fatal = false }) =>
    track('exception', { 
        description: `${code}: ${message}`, 
        fatal 
    });

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

// ─── Nuevos Eventos Estratégicos (Insights Académicos) ────────────────────────

/**
 * Trackea cuando el usuario elige o cambia de plan (Sistemas, Civil, etc.).
 * @param {{ plan: string, origen: 'settings' | 'welcome_modal' }} params
 */
export const trackSeleccionCarrera = ({ plan, origen }) =>
    track('seleccion_carrera', { plan, origen });

/**
 * Trackea el estado inicial del usuario al guardar por primera vez.
 * @param {{ plan: string, aprobadas: number, total: number }} params
 */
export const trackProgresoInicial = ({ plan, aprobadas, total }) =>
    track('progreso_inicial', { 
        plan, 
        cant_aprobadas: aprobadas,
        porcentaje_inicial: Math.round((aprobadas / total) * 100)
    });

/**
 * Trackea clics en materias bloqueadas para identificar trabas.
 * @param {{ plan: string, codigo: string, nombre: string }} params
 */
export const trackFriccionCorrelativa = ({ plan, codigo, nombre }) =>
    track('friccion_correlativa', { plan, codigo, nombre });

/**
 * Trackea cuando un alumno pasa de un estado avanzado a uno inicial (recursada).
 * @param {{ plan: string, codigo: string, estado_anterior: string }} params
 */
export const trackRecursada = ({ plan, codigo, estado_anterior }) =>
    track('recursada_materia', { plan, codigo, estado_anterior });

/**
 * Trackea la cantidad de semestres proyectados para recibirse al terminar una simulación.
 * @param {{ plan: string, semestres_totales: number }} params
 */
export const trackProyeccionEgreso = ({ plan, semestres_totales }) =>
    track('proyeccion_egreso', { plan, semestres_totales });
