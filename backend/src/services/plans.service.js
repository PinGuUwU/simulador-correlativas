import Plan from "../models/plans.model.js"

//obtenerMateriasPorPlan
const obtenerMateriasPorPlan = async (numero) => {
    const plan = await buscarPlan(numero)
    const materias = plan.materias
    return materias
}
// TODO: Buscar la forma de que al encontrar el plan, pueda retornar sus materias y no el plan
//obtenerPlanes
const obtenerPlanes = async () => {
    //Traigo todos los planes pero sin las materias, así obtengo los números, veremos si me es útil sin materias y si no lo modifico
    const planes = await Plan.find().select('-materias')
    return planes
}

//obtenerCorrelativasPorPlanYmateria
const obtenerCorrelativasPorPlanYmateria = async (numeroPlan, codigoMateria) => {
    const plan = await buscarPlan(numeroPlan)
    //Busco la materia por su código, dentro del array de materias que tiene el plan
    const materia = plan.materias.find(m => m.codigo === codigoMateria)

    return materia
}

const obtenerMateriasCorrelativas = async (numero_plan, correlativas) => {
    //'correlativas' es un array de String que tienen sus respectivos códigos
    const plan = await buscarPlan(numero_plan)
    //Necesito buscar las correlativas
    //Agarro todas las materias del plan y las filtramos
    const materiasCorrelativas = plan.materias.filter(materia => correlativas.includes(materia.codigo))
    return materiasCorrelativas
}

const buscarPlan = async (numero) => {
    const plan = await Plan.findOne({ plan_numero: numero })

    if (!plan) {
        throw new Error('Plan no encontrado')
    }
    return plan
}

export default {
    obtenerCorrelativasPorPlanYmateria,
    obtenerMateriasPorPlan,
    obtenerPlanes,
    obtenerMateriasCorrelativas
}