import { useEffect } from "react"
import materiasUtils from "../../utils/Progreso/materiasUtils"
import { trackCambioMateria, trackRecursada } from "../../services/analyticsService"

const useProgresoMaterias = (progreso, setProgreso, materias, plan, updateAuthProgreso) => {

    // 1. Vigilante de la Tesina (Maneja el bloqueo y desbloqueo "Natural")
    useEffect(() => {
        // Encontramos el objeto de la tesina usando el flag
        const tesina = materias.find(m => m.tesis);

        // Si no hay tesina, o el progreso todavía no cargó en memoria, salimos
        if (!tesina || !progreso || Object.keys(progreso).length === 0) return;

        // Verificamos si queda alguna materia (que no sea la tesina) sin aprobar
        const hayMateriasPendientes = materias.some(m =>
            !m.tesis && progreso[m.codigo] !== materiasUtils.estadosPosibles[2]
        );

        let huboCambios = false;
        let nuevoProgreso = { ...progreso };

        if (hayMateriasPendientes && progreso[tesina.codigo] !== materiasUtils.bloquear) {
            // Si faltan materias y la tesina NO está bloqueada -> La bloqueamos
            nuevoProgreso[tesina.codigo] = materiasUtils.bloquear;
            huboCambios = true;
        } else if (!hayMateriasPendientes && progreso[tesina.codigo] === materiasUtils.bloquear) {
            // Si NO hay pendientes y la tesina ESTÁ bloqueada -> La ponemos Disponible automáticamente
            nuevoProgreso[tesina.codigo] = materiasUtils.estadosPosibles[0];
            huboCambios = true;
        }

        // Si el vigilante tuvo que hacer cambios, actualizamos el estado
        if (huboCambios) {
            setProgreso(nuevoProgreso);
        }
    }, [progreso, materias, setProgreso]);


    // 2. Función para aprobar todas las materias (Aprobado Forzoso)
    const aprobarTodas = (nuevoProgreso, materiasModificadas) => {
        materias.forEach((m) => {
            // Solo modificamos las que no estén ya aprobadas o promocionadas para evitar bucles
            if (![materiasUtils.estadosPosibles[2], materiasUtils.estadosPosibles[4]].includes(nuevoProgreso[m.codigo])) {
                nuevoProgreso[m.codigo] = materiasUtils.estadosPosibles[2];
                materiasModificadas.push(m.codigo);
            }
        });
    }

    // 3. Funciones recursivas para la actualización de estado de materias 
    const regularizarCorrelativas = (codigosCorrelativas, nuevoProgreso, materiasModificadas) => {
        codigosCorrelativas.forEach((codigo) => {
            if (!([materiasUtils.estadosPosibles[1], materiasUtils.estadosPosibles[2], materiasUtils.estadosPosibles[4]].includes(nuevoProgreso[codigo]))) {
                nuevoProgreso[codigo] = materiasUtils.estadosPosibles[1];
                materiasModificadas.push(codigo);
                const materiaActual = materias.find((materia) => materia.codigo === codigo);
                if (materiaActual && materiaActual.correlativas.length > 0) {
                    regularizarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas);
                }
            }
        });
    }

    const bloquearDependencias = (codigoMateria, nuevoProgreso) => {
        materias.forEach((m) => {
            if (m.correlativas.includes(codigoMateria) && nuevoProgreso[m.codigo] !== materiasUtils.bloquear) {
                nuevoProgreso[m.codigo] = materiasUtils.bloquear;
                bloquearDependencias(m.codigo, nuevoProgreso);
            }
        });
    }

    const desbloquearDependencias = (codigoMateria, nuevoProgreso) => {
        const ESTADOS_VALIDOS_DESBLOQUEO = [materiasUtils.estadosPosibles[1], materiasUtils.estadosPosibles[2], materiasUtils.estadosPosibles[4], 'Cursando'];
        materias.forEach((m) => {
            const todasBien = m.correlativas.every(c => ESTADOS_VALIDOS_DESBLOQUEO.includes(nuevoProgreso[c]));
            const buenEstado = ESTADOS_VALIDOS_DESBLOQUEO.includes(nuevoProgreso[m.codigo]);
            if (m.correlativas.includes(codigoMateria) && todasBien && !buenEstado) {
                nuevoProgreso[m.codigo] = materiasUtils.estadosPosibles[0];
            }
        });
    }

    const aprobarCorrelativas = (codigosCorrelativas, nuevoProgreso, materiasModificadas) => {
        codigosCorrelativas.forEach((codigo) => {
            if (![materiasUtils.estadosPosibles[2], materiasUtils.estadosPosibles[4]].includes(nuevoProgreso[codigo])) {
                nuevoProgreso[codigo] = materiasUtils.estadosPosibles[2];
                materiasModificadas.push(codigo);
                const materiaActual = materias.find((materia) => materia.codigo === codigo);
                if (materiaActual && materiaActual.correlativas.length > 0) {
                    aprobarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas);
                }
            }
        });
    }

    // 4. Función de mapeo de estados
    const actualizarEstado = (estadoMateria) => {
        const posEstado = materiasUtils.estadosPosibles.indexOf(estadoMateria);
        if (posEstado === 0) {
            return materiasUtils.estadosPosibles[posEstado + 1];
        } else if (estadoMateria === materiasUtils.bloquear) {
            return materiasUtils.estadosPosibles[1];
        } else if (posEstado === (materiasUtils.estadosPosibles.length - 1)) {
            return materiasUtils.estadosPosibles[0];
        } else {
            return materiasUtils.estadosPosibles[2];
        }
    }

    // 5. El motor principal de cambios
    const cambioDeEstado = (codigoMateria, targetState = null) => {
        const materiaActual = materias.find((materia) => materia.codigo === codigoMateria);
        if (!materiaActual) return; // Chequeo de seguridad

        const estadoInicial = progreso[codigoMateria];
        const estadoNuevo = targetState ? targetState : actualizarEstado(estadoInicial);

        let nuevoProgreso = { ...progreso, [codigoMateria]: estadoNuevo };
        let materiasModificadas = [materiaActual.codigo];

        // LOGICA DE LA TESINA (Aprobado Forzoso)
        if (materiaActual.tesis && (estadoNuevo === materiasUtils.estadosPosibles[1] || estadoNuevo === materiasUtils.estadosPosibles[2])) {
            aprobarTodas(nuevoProgreso, materiasModificadas);
        } else {
            // Cursando y Regular: disparan regularización de correlativas
            if (estadoNuevo === 'Cursando' || estadoNuevo === materiasUtils.estadosPosibles[1]) {
                if (materiaActual.correlativas.length > 0) {
                    regularizarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas);
                }
            } else if (estadoNuevo === materiasUtils.estadosPosibles[2] || estadoNuevo === materiasUtils.estadosPosibles[4]) { // Aprobado o Promocionado
                if (materiaActual.correlativas.length > 0) {
                    aprobarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas);
                }
            } else if (estadoNuevo === materiasUtils.estadosPosibles[0] || estadoNuevo === materiasUtils.bloquear) {
                // Disponible o Bloqueado (Ej: Reiniciar)
                bloquearDependencias(codigoMateria, nuevoProgreso);
            }
        }

        // Desbloqueo de dependencias para todas las materias afectadas
        if (materiasModificadas.length > 0) {
            materiasModificadas.forEach((codMateria) => {
                desbloquearDependencias(codMateria, nuevoProgreso);
            });
        }

        // Guardamos en estado local y global/nube
        setProgreso(nuevoProgreso);
        updateAuthProgreso(plan, nuevoProgreso);

        // Trackeamos el cambio
        trackCambioMateria({ plan, codigoMateria, estadoNuevo });

        // Detección de Recursada (Regresión de estado o vuelta desde Libre)
        const estadosQueImplicanRecursada = ['Regular', 'Aprobado', 'Promocionado', 'Libre'];
        const estadosPostRecursada = ['Cursando', 'Disponible', 'Bloqueado', 'Regular', 'Aprobado', 'Promocionado'];
        const esRecursadaDesdeLibre = estadoInicial === 'Libre' && estadosPostRecursada.includes(estadoNuevo);
        const esRegresionDeEstado = ['Regular', 'Aprobado', 'Promocionado'].includes(estadoInicial) && ['Cursando', 'Disponible', 'Bloqueado'].includes(estadoNuevo);
        if (esRecursadaDesdeLibre || esRegresionDeEstado) {
            trackRecursada({ plan, materia_codigo: codigoMateria, materia_nombre: materiaActual.nombre, estado_anterior: estadoInicial });
        }
    }

    // 6. Cambio para múltiples materias a la vez
    const cambioDeEstadoMultiple = (codigosMaterias, targetState) => {
        let nuevoProgreso = { ...progreso };
        let materiasModificadas = [];

        codigosMaterias.forEach(codigoMateria => {
            const materiaActual = materias.find((m) => m.codigo === codigoMateria);
            if (!materiaActual) return;

            const estadoNuevo = targetState;
            if (nuevoProgreso[codigoMateria] === estadoNuevo || 
               (estadoNuevo === materiasUtils.estadosPosibles[2] && nuevoProgreso[codigoMateria] === materiasUtils.estadosPosibles[4])) {
                return; // Evita actualizar si ya está igual o mejor
            }

            nuevoProgreso[codigoMateria] = estadoNuevo;
            materiasModificadas.push(codigoMateria);

            // Trackeamos individualmente cada cambio masivo si es relevante
            trackCambioMateria({ plan, codigoMateria, estadoNuevo });

            // Siempre asumiremos targetState === Aprobado para esta utilidad, pero por las dudas:
            if (materiaActual.tesis && (estadoNuevo === materiasUtils.estadosPosibles[1] || estadoNuevo === materiasUtils.estadosPosibles[2])) {
                aprobarTodas(nuevoProgreso, materiasModificadas);
            } else if (estadoNuevo === materiasUtils.estadosPosibles[2] || estadoNuevo === 'Promocionado') {
                if (materiaActual.correlativas.length > 0) {
                    aprobarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas);
                }
            } else if (estadoNuevo === 'Cursando' || estadoNuevo === materiasUtils.estadosPosibles[1]) {
                if (materiaActual.correlativas.length > 0) {
                    regularizarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas);
                }
            } else if (estadoNuevo === materiasUtils.estadosPosibles[0] || estadoNuevo === materiasUtils.bloquear) {
                bloquearDependencias(codigoMateria, nuevoProgreso);
            }
        });

        if (materiasModificadas.length > 0) {
            materiasModificadas.forEach((codMateria) => {
                desbloquearDependencias(codMateria, nuevoProgreso);
            });
            setProgreso(nuevoProgreso);
            updateAuthProgreso(plan, nuevoProgreso);
        }
    }

    return { cambioDeEstado, cambioDeEstadoMultiple }
}

export default useProgresoMaterias;