import express from 'express'
import PlansController from '../controllers/plans.controller.js'

const router = express.Router()

// (R) READ - Leer materias del plan
// GET to /api/plans/:plan_numero
router.get('/:plan_numero', PlansController.getMateriasByPlan)

// (R) READ - Leer planes
// GET to /api/plans
router.get('/', PlansController.getPlans)

// (R) READ - Leer correlativas de una materia
// GET to /api/plans/correlativas/:plan_numero/:materia_codigo
router.get('/correlativas/:plan_numero/:materia_codigo', PlansController.getCorrelativasByPlanAndMateria)

export default router