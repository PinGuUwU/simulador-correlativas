import { useEffect } from "react"
import materiasUtils from "../../utils/Progreso/materiasUtils"

const useProgresoMaterias = (progreso, setProgreso, materias) => {

    // Vigilancia de la tesis
    useEffect(() => {
        const tesinas = materias.find(m => m.tesis);
        const tesina = tesinas[0]
        if (!tesina) return;

        const revisarTesina = () => {
            // Usamos el flag m.tesis para excluirla, es mucho más seguro que el nombre
            const hayMateriasPendientes = materias.some(m =>
                !m.tesis && progreso[m.codigo] !== materiasUtils.estadosPosibles[2]
            );

            // IMPORTANTE: Solo bloqueamos si hay pendientes Y si la tesina no está ya bloqueada.
            // Pero si el usuario la acaba de aprobar (Short-cut), el efecto no debe revertirlo.
            if (hayMateriasPendientes && progreso[tesina.codigo] !== materiasUtils.bloquear) {
                setProgreso(prev => ({
                    ...prev,
                    [tesina.codigo]: materiasUtils.bloquear
                }));
            }
        };

        revisarTesina();
    }, [progreso, materias])


    //Funcion para aprobar todas las materias para la tesis
    const aprobarTodas = (nuevoProgreso, materiasModificadas) => {
        materias.forEach((m) => {
            nuevoProgreso[m.codigo] = materiasUtils.estadosPosibles[2]
            //Ya que se modifico, la guardo
            materiasModificadas.push(m.codigo)
        })
    }

    // Funciones recursivas para la actualización de estado de materias 
    const regularizarCorrelativas = (codigosCorrelativas, nuevoProgreso, materiasModificadas) => {
        //Dos casos posibles
        //1. bloqueado -> disponible
        //2. disponible -> regular (Descartado, si anteriormente se puso en estado disponible entonces ya se encargó de regularizar las correlativas)

        codigosCorrelativas.forEach((codigo) => {
            //si la materia no está regularizada o aprobada 
            if (!([materiasUtils.estadosPosibles[1], materiasUtils.estadosPosibles[2]].includes(nuevoProgreso[codigo]))) {
                nuevoProgreso[codigo] = materiasUtils.estadosPosibles[1]
                //Ya que fue modificada, la agrego al array de materias modificadas para luego revisar si tiene que desbloquear dependencias
                materiasModificadas.push(codigo)
                //Reviso también para regularizar sus correlativas si es que tiene
                const materiaActual = materias.find((materia) => materia.codigo === codigo)
                if (materiaActual.correlativas.length > 0) {
                    regularizarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas)
                }
            }
        })

    }
    const bloquearDependencias = (codigoMateria, nuevoProgreso) => {
        //aprobado -> disponibes
        //Debe materiasUtils.bloquear a las materias cuyas correlativas incluyen su código
        materias.forEach((m) => {
            if (m.correlativas.includes(codigoMateria) && nuevoProgreso[m.codigo] != materiasUtils.bloquear) {
                //Si esta materia tiene como correlativa codigoMateria y no está bloqueada, entonces la bloqueo
                nuevoProgreso[m.codigo] = materiasUtils.bloquear
                //Busco a ver si hay otras materias dependientes a esta, que acaba de ser bloqueada, para bloquearlas
                bloquearDependencias(m.codigo, nuevoProgreso)
            }
        })
    }
    const desbloquearDependencias = (codigoMateria, nuevoProgreso) => {
        //bloqueado -> disponibles
        //Debo desbloquear las materias que tengan esta materia como correlativa y el resto de correlativas también estén regular o aprobadas
        materias.forEach((m) => {
            const todasBien = m.correlativas.every(c => ([materiasUtils.estadosPosibles[1], materiasUtils.estadosPosibles[2]].includes(nuevoProgreso[c])))
            const buenEstado = [materiasUtils.estadosPosibles[1], materiasUtils.estadosPosibles[2]].includes(nuevoProgreso[m.codigo])
            if (m.correlativas.includes(codigoMateria) && todasBien && !buenEstado) {
                nuevoProgreso[m.codigo] = materiasUtils.estadosPosibles[0]
                //Creo que acá no necesito hacer recursividad como en otras funciones, con una pasada es suficiente
            }
        })
    }

    const aprobarCorrelativas = (codigosCorrelativas, nuevoProgreso, materiasModificadas) => {
        // regular -> aprobado
        codigosCorrelativas.forEach((codigo) => {
            // Si su correlativa no está aprobada, la apruebo
            if (nuevoProgreso[codigo] != materiasUtils.estadosPosibles[2]) {
                nuevoProgreso[codigo] = materiasUtils.estadosPosibles[2]
                // Agrego la materia a materias Modificadas
                materiasModificadas.push(codigo)
                //Reviso también para aprobar sus correlativas si es que tiene
                const materiaActual = materias.find((materia) => materia.codigo === codigo)
                if (materiaActual.correlativas.length > 0) {
                    aprobarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas)
                }
            }
        })
    }

    //Función para poder actualizar el estado individual de cada materia
    const actualizarEstado = (estadoMateria) => {
        const posEstado = materiasUtils.estadosPosibles.indexOf(estadoMateria)
        if (posEstado === 0) {
            //Si está disponible -> regular
            return materiasUtils.estadosPosibles[posEstado + 1]
        } else if (estadoMateria === materiasUtils.bloquear) {
            //Si está bloqueado -> regular
            return materiasUtils.estadosPosibles[1]
        } else if (posEstado === (materiasUtils.estadosPosibles.length - 1)) {
            //Si está aprobado -> disponible
            return materiasUtils.estadosPosibles[0]
        } else {
            //Si está regular -> aprobado
            return materiasUtils.estadosPosibles[2]
        }


    }

    const cambioDeEstado = (codigoMateria, plan) => {

        //Busco el estado actual de la materia, si no existe la inicializo
        const materiaActual = materias.find((materia) => materia.codigo === codigoMateria)
        const estadoInicial = progreso[codigoMateria]

        //Actualizo su estado a el siguiente estado posible
        const estadoNuevo = actualizarEstado(estadoInicial)

        //Creo un progreso con el nuevo cambio
        let nuevoProgreso = { ...progreso, [codigoMateria]: estadoNuevo }
        let materiasModificadas = [materiaActual.codigo]

        //Si es una materia optativa tendrá "es_optativa" === true
        //Que ya NO se maneja como caso a parte, se solucionaron los problemas de correlatividades disminuyendo así el código utilizado

        //Si es la tesina
        if (materiaActual.tesis && estadoNuevo === materiasUtils.estadosPosibles[2]) {
            aprobarTodas(nuevoProgreso, materiasModificadas)
        } else {
            //4 casos posibles:
            if ((estadoInicial === materiasUtils.bloquear || estadoInicial === materiasUtils.estadosPosibles[0]) && estadoNuevo === materiasUtils.estadosPosibles[1]) {
                // 1. Bloqueado -> Regular || 2. disponible -> regular
                //Solo si tiene correlativas
                if (materiaActual.correlativas.length > 0) {
                    regularizarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas)
                }
            } else if (estadoInicial === materiasUtils.estadosPosibles[1] && estadoNuevo === materiasUtils.estadosPosibles[2]) {
                //(caso extra, si se necesita tener todas aprobadas entonces es la tesina)

                //3. regular -> aprobado
                //Solo si tiene correlativas
                if (materiaActual.correlativas.length > 0) {
                    aprobarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas)
                }
            } else if (estadoInicial === materiasUtils.estadosPosibles[2] && estadoNuevo === materiasUtils.estadosPosibles[0]) {
                //4. aprobado -> disponible
                bloquearDependencias(codigoMateria, nuevoProgreso)
            } else {
                //extra. bloqueado -> disponible
                //No existe, es "actualizarCorrelativas()" que hace esta transición solo a partir de las materias modificadas
            }
        }
        //Desbloqueo dependencias
        if (materiasModificadas.length > 0) {
            materiasModificadas.forEach((codigoMateria) => {
                desbloquearDependencias(codigoMateria, nuevoProgreso)
            })
        }
        setProgreso(nuevoProgreso)
        const nombreStorage = "progreso+" + plan

        localStorage.setItem(nombreStorage, JSON.stringify(nuevoProgreso))
    }


    return { cambioDeEstado }
}

export default useProgresoMaterias