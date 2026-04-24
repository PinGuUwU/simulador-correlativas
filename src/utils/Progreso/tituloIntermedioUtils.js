/**
 * Utilidades para el manejo del Título Intermedio (Analista)
 */

/**
 * Obtiene el nombre del título intermedio según el plan
 * @param {string} plan - Nombre del plan de estudios
 * @returns {string} - Nombre del título intermedio o string vacío si no tiene
 */
const getTituloIntermedioNombre = (plan) => {
    if (plan === "Sistemas 17.14" || plan?.includes("17.14") || 
        plan === "Sistemas 17.13" || plan?.includes("17.13")) {
        return "Título Intermedio (Analista)";
    }
    return "";
};

/**
 * Obtiene las materias requeridas para el título intermedio
 * @param {string} plan - Nombre del plan de estudios
 * @param {Array} materias - Lista de todas las materias del plan
 * @returns {Array} - Lista de materias filtradas para el título intermedio
 */
const getMateriasIntermedio = (plan, materias) => {
    if (!materias || materias.length === 0) return [];

    if (plan === "Sistemas 17.14" || plan?.includes("17.14")) {
        // En 17.14 es hasta 6to cuatrimestre (3er año completo)
        return materias.filter(m => Number(m.cuatrimestre) <= 6 && !m.tesis && m.codigo !== "N/A");
    } else if (plan === "Sistemas 17.13" || plan?.includes("17.13")) {
        // En 17.13 es hasta 7mo cuatrimestre
        return materias.filter(m => Number(m.cuatrimestre) <= 7 && !m.tesis && m.codigo !== "N/A");
    }
    
    return [];
};

/**
 * Calcula el progreso del título intermedio
 * @param {Array} materiasIntermedio - Materias requeridas para el título intermedio
 * @param {Object} progreso - Estado de progreso de todas las materias
 * @returns {Object} - { porcentaje, completadas, totales }
 */
const calcularProgresoIntermedio = (materiasIntermedio, progreso) => {
    if (!materiasIntermedio || materiasIntermedio.length === 0) {
        return { porcentaje: 0, completadas: 0, totales: 0 };
    }

    const completadas = materiasIntermedio.filter(m => 
        progreso[m.codigo] === 'Aprobado' || progreso[m.codigo] === 'Promocionado'
    ).length;
    
    const totales = materiasIntermedio.length;
    const porcentaje = Math.round((completadas * 100) / totales);

    return { porcentaje, completadas, totales };
};

export default {
    getTituloIntermedioNombre,
    getMateriasIntermedio,
    calcularProgresoIntermedio
};
