//Estilos de los estados
const obtenerEstiloPorEstado = (estado) => {
    switch (estado) {
        case "Aprobado":
            return { icon: "fa-check-double", accent: "green", colorText: "text-green-500" }
        case "Disponible":
            return { icon: "fa-unlock", accent: "cyan", colorText: "text-cyan-500" }
        case "Regular":
            return { icon: "fa-clock", accent: "amber", colorText: "text-amber-500" }
        case "Bloqueado":
        default:
            return { icon: "fa-lock", accent: "slate", colorText: "text-slate-400" }
    }
}

//Obtener las materias Correlativas Disponibles
const buscarMateriasCorrelativasDisponibles = (codigosCorrelativas, materias, progreso) => {
    let materiasEncontradas = []
    materias.forEach((m) => {
        if (codigosCorrelativas.includes(m.codigo) && progreso[m.codigo] === estadosPosibles[0]) {

            materiasEncontradas.push(m)
        }
    })
    return materiasEncontradas
}
//Obtener las materias Correlativas Regulares
const buscarMateriasCorrelativasRegulares = (codigosCorrelativas, materias, progreso) => {
    let materiasEncontradas = []
    materias.forEach((m) => {
        if (codigosCorrelativas.includes(m.codigo) && progreso[m.codigo] === estadosPosibles[1]) {

            materiasEncontradas.push(m)
        }
    })
    return materiasEncontradas
}

const estadosPosibles = ['Disponible', 'Regular', 'Aprobado']
const bloquear = 'Bloqueado'
const numsRomanos = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

export default {
    estadosPosibles,
    buscarMateriasCorrelativasDisponibles,
    buscarMateriasCorrelativasRegulares,
    obtenerEstiloPorEstado,
    bloquear
}