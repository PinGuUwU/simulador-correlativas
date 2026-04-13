import { useMemo } from 'react'

const useSimuladorMaterias = (materias, progreso, cuatri, setProgreso, progresoBase, anioActual, semestreActualPlan) => {

    // Separamos la lógica en cursables y bloqueadas
    const { materiasCursables, materiasBloqueadas } = useMemo(() => {
        if (!progresoBase || Object.keys(progresoBase).length === 0) return { materiasCursables: [], materiasBloqueadas: [] };

        // 1. Filtramos por temporada (paridad de cuatrimestre) y que no estén cursadas
        const materiasCandidatas = materias.filter(m => {
            const numCuatri = Number(m.cuatrimestre);
            const esImpar = numCuatri % 2 !== 0;
            const esPar = numCuatri % 2 === 0;

            const coincideTemporada = (cuatri === "1" && esImpar) || (cuatri === "2" && esPar);
            const noCursada = progresoBase[m.codigo] === "No Cursado";

            return coincideTemporada && noCursada;
        });

        const cursables = [];
        const bloqueadas = [];

        materiasCandidatas.forEach((materia) => {
            const esTesina = materia.tesis;
            let esCursable = false;
            let correlativasFaltantes = [];

            if (esTesina) {
                const hayPendientes = materias.some(m =>
                    m.codigo !== materia.codigo && progresoBase[m.codigo] !== "Cursado"
                );
                esCursable = !hayPendientes;
                if (!esCursable) {
                    correlativasFaltantes = ["Todas las materias previas"];
                }
            } else {
                if (materia.correlativas.length > 0) {
                    materia.correlativas.forEach(codigo => {
                        if (progresoBase[codigo] !== "Cursado") {
                            const correlativa = materias.find(mat => mat.codigo === codigo);
                            correlativasFaltantes.push(correlativa?.nombre || codigo);
                        }
                    });
                    esCursable = correlativasFaltantes.length === 0;
                } else {
                    esCursable = true;
                }
            }

            if (esCursable) {
                cursables.push(materia);
            } else {
                // SÓLO agregamos a bloqueadas si es del cuatrimestre EXACTO actual
                // para evitar llenar la pantalla de advertencias de años anteriores o futuros.
                if (Number(materia.cuatrimestre) === semestreActualPlan) {
                    bloqueadas.push({
                        ...materia,
                        correlativasFaltantes
                    });
                }
            }
        });

        return { materiasCursables: cursables, materiasBloqueadas: bloqueadas };
    }, [cuatri, anioActual, materias, progresoBase, semestreActualPlan])

    const cambioDeEstado = (codigoMateria) => {
        const nuevoEstado = progreso[codigoMateria] === "Cursado" ? "No Cursado" : "Cursado"
        const nuevoProgreso = { ...progreso, [codigoMateria]: nuevoEstado }
        setProgreso(nuevoProgreso)
    }

    return { cambioDeEstado, materiasCursables, materiasBloqueadas }
}

export default useSimuladorMaterias
