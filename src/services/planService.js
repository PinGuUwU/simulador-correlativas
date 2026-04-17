import { careers } from '../data/plansData';
import plansData from '../data/plansData';

/**
 * Servicio para gestionar los planes de estudio y materias con carga dinámica.
 */
const planService = {
    /**
     * Obtiene un plan completo (con materias) de forma SÍNCRONA.
     * Usa el bundle ya cargado en plansData.
     * @param {string} planNumber - Número del plan (ej: "17.14")
     * @returns {{ plan_numero: string, materias: Array }|null}
     */
    getPlanByNumber(planNumber) {
        return plansData.find(p => p.plan_numero === planNumber) ?? null;
    },

    /**
     * Obtiene el listado de materias de un plan específico de forma asíncrona.
     * @param {string} planNumber - Número del plan
     * @returns {Promise<Array>} - Promise con el array de materias
     */
    async getMateriasByPlan(planNumber) {
        let planData = null;
        
        // Carga dinámica de los JSON para mejorar el rendimiento inicial (LCP)
        if (planNumber.startsWith("17")) {
            const data = await import('../data/sistemas.json');
            planData = data.default.find(p => p.plan_numero === planNumber);
        } else if (planNumber.startsWith("20")) {
            const data = await import('../data/civil.json');
            planData = data.default.find(p => p.plan_numero === planNumber);
        }

        if (!planData) {
            throw new Error(`El plan "${planNumber}" no existe o no pudo ser cargado.`);
        }
        return planData.materias;
    },

    /**
     * Devuelve los encabezados de todos los planes disponibles (sin cargar todas las materias).
     * @returns {Array}
     */
    getAllPlans() {
        return Object.values(careers).flat();
    }
};

export default planService;