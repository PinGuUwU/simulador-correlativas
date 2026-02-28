import express from 'express'

const router = express.Router()

// (R) READ - Leer materias del plan
// GET to /api/plans/:plan_numero
router.get('/:plan_numero', obtenerMateriasPorPlan)

// (R) READ - Leer planes
// GET to /api/plans
router.get('/', obtenerPlanes)

// (R) READ - Leer correlativas de una materia
// GET to /api/plans/correlativas/:plan_numero/:materia_codigo
router.get('/correlativas/:plan_numero/:materia_codigo', obtenerCorrelativasPorPlanYmateria)

export default router