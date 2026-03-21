import { useState, useEffect } from 'react'

const useSimuladorMaterias = (materias, progreso, cuatri, setProgreso, progresoBase, anioActual) => {
    const [materiasCursables, setMateriasCursables] = useState([])

    // Evaluamos las materias posibles SÓLO al inicio usando el progresoBase (la "foto" de progreso inicial).
    // Esto asegura que al volver atrás en el historial, las que marcaste no desaparezcan de la vista.
    useEffect(() => {
        if (!progresoBase || Object.keys(progresoBase).length === 0) return;

        // Calculamos el índice global del cuatrimestre en base al año y cuatri actual
        const semestreGlobal = (anioActual - 1) * 2 + Number(cuatri);

        // Filtramos para que no sean del futuro Y respeten la época del año (impar = 1, par = 2)
        let nextMaterias = materias.filter(m => {
            const numCuatri = Number(m.cuatrimestre);
            
            // Verificamos si la temporada del año coincide
            const esImpar = numCuatri % 2 !== 0;
            const esPar = numCuatri % 2 === 0;
            
            let temporadaCorrecta = false;
            if (cuatri === "1" && esImpar) temporadaCorrecta = true;
            if (cuatri === "2" && esPar) temporadaCorrecta = true;

            return temporadaCorrecta;
        });

        // Me quedo solo con las que no se cursaron (mirando la foto ANTES de este cuatrimestre)
        nextMaterias = nextMaterias.filter(m => progresoBase[m.codigo] === "No Cursado")
        const posibles = []
        // Filtro por correlativas usando el progresoBase
        nextMaterias.forEach((materia) => {
            const nombreStr = materia.nombre.toLowerCase();
            const esTesina = nombreStr.includes("tesina de grado") || materia.correlativas[0] === "Todas";
            const esOptativa = nombreStr.includes("optativa ");

            if (esTesina) {
                // La tesina requiere que absolutamente TODAS las demás materias estén cursadas
                const hayPendientes = materias.some(m => 
                    m.codigo !== materia.codigo && progresoBase[m.codigo] !== "Cursado"
                );
                if (!hayPendientes) posibles.push(materia);
            } 
            else if (esOptativa) {
                // Las optativas requieren que todas las materias hasta X cuatrimestre estén cursadas
                const cuatriLimite = Number(materia.correlativas[0]);
                if (!isNaN(cuatriLimite)) {
                    const hayPendientes = materias.some(m => 
                        Number(m.cuatrimestre) <= cuatriLimite && progresoBase[m.codigo] !== "Cursado"
                    );
                    if (!hayPendientes) posibles.push(materia);
                } else {
                    // Fallback si no está bien configurado el cuatri
                    posibles.push(materia);
                }
            } 
            else {
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

        setMateriasCursables(posibles)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cuatri, anioActual, materias, progresoBase])

    const cambioDeEstado = (codigoMateria) => {
        const nuevoEstado = progreso[codigoMateria] === "Cursado" ? "No Cursado" : "Cursado"
        const nuevoProgreso = { ...progreso, [codigoMateria]: nuevoEstado }
        setProgreso(nuevoProgreso)
    }

    return { cambioDeEstado, materiasCursables }
}

export default useSimuladorMaterias