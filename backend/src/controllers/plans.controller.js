import plansService from '../services/plans.service.js'

//getMateriasByPlan
const getMateriasByPlan = async (req, res) => {
    try {
        const { plan_numero } = req.params
        const materias = await plansService.obtenerMateriasPorPlan(plan_numero)
        //Si no se encontraron materias
        if (!materias) {
            return res.status(404).json({ message: "No se encontraron materias" })
        }

        //Se encontraron las materias
        return res.status(200).json(materias)

    } catch (error) {
        res.status(500).json({
            message: "Error al buscar las materias",
            error: error.message
        })
    }
}

//getPlans
const getPlans = async (req, res) => {
    try {
        const planes = await plansService.obtenerPlanes()
        //Si no se encontraron los planes
        if (!planes) {
            return res.status(404).json({ message: "No se encontraron planes" })
        }
        //Si se encontraron planes
        return res.status(200).json(planes)
    } catch (error) {
        res.status(500).json({
            message: "Error al buscar los planes",
            error: error.message
        })
    }
}

//getCorrelativasByPlanAndMateria
const getCorrelativasByPlanAndMateria = async (req, res) => {
    try {
        const { plan_numero, materia_codigo } = req.params
        const materia = await plansService.obtenerCorrelativasPorPlanYmateria(plan_numero, materia_codigo)
        //Si no se encontró la materia
        if (!materia) {
            return res.status(404).json({ message: 'Materia no encontrada' })
        }
        //Habría que hacer un loop para buscar las correlativas?
        //Primero consulto sus correlativas si es que tiene
        if (materia.correlativas && materia.correlativas.length > 0) {
            //Si tengo al menos una correlativa
            const materiasCorrelativas = await plansService.obtenerMateriasCorrelativas(plan_numero, materia.correlativas)

            //Le mando al frontend las materias encontradas correlativas
            return res.status(200).json(materiasCorrelativas)
        } else {
            //Si no tengo correlativas
            return res.status(200).json([])
        }
    } catch (error) {
        res.status(500).json({
            message: "Error al buscar correlativas",
            error: error.message
        })
    }
}

export default {
    getMateriasByPlan,
    getPlans,
    getCorrelativasByPlanAndMateria,
}