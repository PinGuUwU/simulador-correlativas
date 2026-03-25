import plansData, { careers } from '../data/plansData';

/**
 * Servicio para gestionar los planes de estudio y materias.
 */
const planService = {
    /**
     * Obtiene todas las materias de una carrera específica.
     * @param {string} careerName - Nombre de la carrera (ej. "Sistemas", "Civil")
     * @returns {Array} - Array de planes de la carrera
     * @throws {Error} - Si la carrera no existe
     */
    getPlansByCareer(careerName) {
        if (!careers[careerName]) {
            throw new Error(`La carrera "${careerName}" no existe en el sistema.`);
        }
        return careers[careerName];
    },

    /**
     * Obtiene un plan específico por su número.
     * @param {string} planNumber - Número del plan (ej. "17.14")
     * @returns {Object|null} - El objeto del plan o null si no existe
     */
    getPlanByNumber(planNumber) {
        return plansData.find(p => p.plan_numero === planNumber) || null;
    },

    /**
     * Obtiene el listado de materias de un plan específico.
     * @param {string} planNumber - Número del plan
     * @returns {Array} - Array de materias
     * @throws {Error} - Si el plan no existe
     */
    getMateriasByPlan(planNumber) {
        const plan = this.getPlanByNumber(planNumber);
        if (!plan) {
            throw new Error(`El plan "${planNumber}" no existe.`);
        }
        return plan.materias;
    },

    /**
     * Devuelve todos los planes disponibles.
     * @returns {Array}
     */
    getAllPlans() {
        return plansData;
    }
};

export default planService;
