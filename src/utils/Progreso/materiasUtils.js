//Estilos de los estados
const obtenerEstiloPorEstado = (estado) => {
    switch (estado) {
        case "Promocionado":
            return { icon: "fa-crown", accent: "secondary", colorText: "text-violet-500" }
        case "Aprobado":
            return { icon: "fa-circle-check", accent: "success", colorText: "text-success" }
        case "Disponible":
            return { icon: "fa-unlock", accent: "primary", colorText: "text-primary" }
        case "Cursando":
            return { icon: "fa-pencil", accent: "secondary", colorText: "text-indigo-500" }
        case "Regular":
            return { icon: "fa-clock", accent: "warning", colorText: "text-warning" }
        case "Libre":
            return { icon: "fa-user-slash", accent: "danger", colorText: "text-danger" }
        case "Bloqueado":
        default:
            return { icon: "fa-lock", accent: "default", colorText: "text-foreground/60" }
    }
}

//Obtener las materias Correlativas Disponibles
const buscarMateriasCorrelativas = (codigosCorrelativas, materias) => {
    let materiasEncontradas = []
    materias.forEach((m) => {
        if (codigosCorrelativas.includes(m.codigo)) {

            materiasEncontradas.push(m)
        }
    })
    return materiasEncontradas
}

const estadosPosibles = ['Disponible', 'Regular', 'Aprobado', 'Libre', 'Promocionado']
const estadosActivos = ['Regular', 'Aprobado', 'Cursando'] // Los que cuentan como "en curso o terminado"
const bloquear = 'Bloqueado'
const numsRomanos = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

// Calcula cuántas materias dependen directa o indirectamente de una materia específica
const calcularImpactoTapon = (codigoMateria, materias) => {
    let bloqueadas = new Set();

    const encontrarDependientes = (codigo) => {
        materias.forEach(m => {
            if (m.correlativas.includes(codigo) && !bloqueadas.has(m.codigo)) {
                bloqueadas.add(m.codigo);
                encontrarDependientes(m.codigo);
            }
        });
    };

    encontrarDependientes(codigoMateria);
    return bloqueadas.size;
};

export default {
    estadosPosibles,
    estadosActivos,
    buscarMateriasCorrelativas,
    obtenerEstiloPorEstado,
    bloquear,
    calcularImpactoTapon
}