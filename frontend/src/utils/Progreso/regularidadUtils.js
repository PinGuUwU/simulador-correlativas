import reglas from './reglas_universidad.json';

/**
 * Convierte {anio, cuatrimestre} a número de cuatrimestres desde el inicio de los tiempos.
 * Usado internamente para comparar distancias.
 */
function toCuatriIndex(anio, cuatrimestre) {
    return anio * 2 + cuatrimestre;
}

/**
 * Calcula cuántos cuatrimestres han pasado desde la fecha de regularidad hasta hoy.
 * @param {{ anio: number, cuatrimestre: number }|string} fechaRegularidad
 */
function getCuatrimestresTranscurridos(fechaRegularidad) {
    if (!fechaRegularidad) return 0;

    let anioReg, cuatriReg;

    // Soportar el viejo formato "YYYY-MM" y el nuevo { anio, cuatrimestre }
    if (typeof fechaRegularidad === 'string') {
        const [year, month] = fechaRegularidad.split('-').map(Number);
        anioReg = year;
        cuatriReg = month <= 6 ? 1 : 2;
    } else {
        anioReg = fechaRegularidad.anio;
        cuatriReg = fechaRegularidad.cuatrimestre;
    }

    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();
    const cuatriActual = mesActual <= 6 ? 1 : 2;

    return Math.max(0, toCuatriIndex(anioActual, cuatriActual) - toCuatriIndex(anioReg, cuatriReg));
}

/**
 * Verifica si la regularidad venció por tiempo (> 5 cuatrimestres)
 */
export function verificarVencimientoTiempo(fechaRegularidad) {
    if (!fechaRegularidad) return false;
    const transcurridos = getCuatrimestresTranscurridos(fechaRegularidad);
    return transcurridos > reglas.limites.cuatrimestres_regularidad;
}

/**
 * Verifica si la regularidad venció por exceso de intentos fallidos/ausentes
 */
export function verificarVencimientoIntentos(intentosFinal) {
    if (!intentosFinal || !Array.isArray(intentosFinal)) return false;
    const fallidos = intentosFinal.filter(i => i.estado === 'reprobado' || i.estado === 'ausente').length;
    return fallidos >= reglas.limites.intentos_final;
}

/**
 * Determina si una materia 'Regular' debe pasar a 'Libre'
 */
export function calcularEstadoConsolidado(actualEstado, fechaRegularidad, intentosFinal) {
    if (actualEstado !== 'Regular' && actualEstado !== 'Libre') return actualEstado;

    if (verificarVencimientoTiempo(fechaRegularidad) || verificarVencimientoIntentos(intentosFinal)) {
        return 'Libre';
    }
    return 'Regular';
}

/**
 * Retorna cuántos cuatrimestres e intentos le quedan al alumno.
 */
export function obtenerPlanificacionInstancias(fechaRegularidad, intentosFinal) {
    if (!fechaRegularidad) return { cuatrimestresRestantes: reglas.limites.cuatrimestres_regularidad, intentosRestantes: reglas.limites.intentos_final };

    const transcurridos = getCuatrimestresTranscurridos(fechaRegularidad);
    const cuatrimestresRestantes = Math.max(0, reglas.limites.cuatrimestres_regularidad - transcurridos);

    const fallidos = intentosFinal ? intentosFinal.filter(i => i.estado === 'reprobado' || i.estado === 'ausente').length : 0;
    const intentosRestantes = Math.max(0, reglas.limites.intentos_final - fallidos);

    return { cuatrimestresRestantes, intentosRestantes };
}

/**
 * Calcula el promedio general de un alumno usando los detalles de progreso.
 * Solo incluye materias con nota final cargada.
 * @param {Object} progresoDetalles - { [codigo]: { notaFinal, notaRegularizacion, ... } }
 * @param {Object} progreso - { [codigo]: estado }
 * @returns {{ promedio: number|null, materiasContadas: number, totalNotas: number }}
 */
export function calcularPromedioGeneral(progresoDetalles, progreso) {
    if (!progresoDetalles || !progreso) return { promedio: null, materiasContadas: 0, totalNotas: 0 };

    let totalNotas = 0;
    let materiasContadas = 0;

    Object.entries(progresoDetalles).forEach(([codigo, detalles]) => {
        const estado = progreso[codigo];
        // Solo contar materias terminadas (Aprobado) con nota cargada
        if (estado === 'Aprobado' && detalles?.notaFinal != null) {
            totalNotas += detalles.notaFinal;
            materiasContadas++;
        }
    });

    return {
        promedio: materiasContadas > 0 ? Math.round((totalNotas / materiasContadas) * 100) / 100 : null,
        materiasContadas,
        totalNotas
    };
}

/**
 * Calcula la fecha de vencimiento legible basada en el año y cuatrimestre de regularización.
 */
export function obtenerFechaVencimientoLabel(fechaRegularidad) {
    if (!fechaRegularidad) return null;

    let anioReg, cuatriReg;
    if (typeof fechaRegularidad === 'string') {
        const [year, month] = fechaRegularidad.split('-').map(Number);
        anioReg = year;
        cuatriReg = month <= 6 ? 1 : 2;
    } else {
        anioReg = fechaRegularidad.anio;
        cuatriReg = fechaRegularidad.cuatrimestre;
    }

    // Calculamos el índice del cuatri de vencimiento (5 cuatris después)
    // Ej: 2024-C1 (índice 2024*2 + 1 = 4049) + 5 = 4054
    // 4054 / 2 = 2027. 4054 % 2 = 0? No, wait.
    // Usando toCuatriIndex: 2024, 1 -> 4049. 
    // +5 -> 4054.
    // 4054 / 2 = 2027, resto 0. So 2026-C2? 
    // Let's re-check the logic.
    // 2024-C1 (1), 2024-C2 (2), 2025-C1 (3), 2025-C2 (4), 2026-C1 (5).
    // The 5th cuatri is 2026-C1.
    // index(2024,1) = 4049.
    // 4049 + 5 = 4054.
    // index(2026,2) = 2026*2 + 2 = 4054. No.
    // index(2027,0)? No.
    // Let's use simpler logic:
    let totalCuatris = cuatriReg + reglas.limites.cuatrimestres_regularidad;
    let anioVenc = anioReg + Math.floor((totalCuatris - 1) / 2);
    let cuatriVenc = ((totalCuatris - 1) % 2) + 1;
    
    // Mes estimado de vencimiento
    const mesExp = cuatriVenc === 1 ? "Jul" : "Dic";
    return `${mesExp} ${anioVenc}`;
}

export default {
    verificarVencimientoTiempo,
    verificarVencimientoIntentos,
    calcularEstadoConsolidado,
    obtenerPlanificacionInstancias,
    calcularPromedioGeneral,
    obtenerFechaVencimientoLabel,
}
