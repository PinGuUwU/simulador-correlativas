import { useMemo } from 'react'

const useSimuladorMaterias = (materias, progreso, cuatri, setProgreso, progresoBase, anioActual) => {

    // Evaluamos las materias posibles SÓLO al inicio usando el progresoBase (la "foto" de progreso inicial).
    // Esto asegura que al volver atrás en el historial, las que marcaste no desaparezcan de la vista.
    const materiasCursables = useMemo(() => {
        if (!progresoBase || Object.keys(progresoBase).length === 0) return [];

        // Filtramos para que no sean del futuro Y respeten la época del año (impar = 1, par = 2)
        let nextMaterias = materias.filter(m => {
            const numCuatri = Number(m.cuatrimestre);
            const esImpar = numCuatri % 2 !== 0;
            const esPar = numCuatri % 2 === 0;

            if (cuatri === "1" && esImpar) return true;
            if (cuatri === "2" && esPar) return true;

            return false; // Si no coincide la temporada, no se muestra
        })
        // Me quedo solo con las que no se cursaron (mirando la foto ANTES de este cuatrimestre)
        nextMaterias = nextMaterias.filter(m => progresoBase[m.codigo] === "No Cursado")
        const posibles = []
        // Filtro por correlativas usando el progresoBase
        nextMaterias.forEach((materia) => {
            const esTesina = materia.tesis

            if (esTesina) {
                // La tesina requiere que absolutamente TODAS las demás materias estén cursadas
                const hayPendientes = materias.some(m =>
                    m.codigo !== materia.codigo && progresoBase[m.codigo] !== "Cursado"
                );
                if (!hayPendientes) posibles.push(materia);
            } else {
                // Materias regulares: revisamos sus correlativas normalmente
                if (materia.correlativas.length > 0) {
                    let todasBien = true
                    materia.correlativas.forEach(codigo => {
                        if (progresoBase[codigo] !== "Cursado") {
                            todasBien = false
                        }
                    })
                    if (todasBien) {
                        posibles.push(materia)
                    }
                } else {
                    posibles.push(materia)
                }
            }
        })

        return posibles;
    }, [cuatri, anioActual, materias, progresoBase])

    const cambioDeEstado = (codigoMateria) => {
        const nuevoEstado = progreso[codigoMateria] === "Cursado" ? "No Cursado" : "Cursado"
        const nuevoProgreso = { ...progreso, [codigoMateria]: nuevoEstado }
        setProgreso(nuevoProgreso)
    }

    return { cambioDeEstado, materiasCursables }
}

export default useSimuladorMaterias