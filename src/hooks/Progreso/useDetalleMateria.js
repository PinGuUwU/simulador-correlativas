import { useState, useEffect, useRef } from 'react';
import regularidadUtils from '../../utils/Progreso/regularidadUtils';
import reglas from '../../utils/Progreso/reglas_universidad.json';
import { useAuth } from '../../context/AuthContext';

/**
 * Hook para gestionar la lógica de negocio del modal de detalle de materia.
 * Maneja el historial de intentos, notas de cursada y cambios de estado.
 */
export default function useDetalleMateria(infoMateria, progresoDetalles, setProgresoDetalles, plan, progreso, cambioDeEstado, estadoActual) {
    const { updateAuthProgreso } = useAuth();
    const [showNotaForm, setShowNotaForm] = useState(false);
    const [notaVal, setNotaVal] = useState("");
    const [estadoVal, setEstadoVal] = useState("rendido");
    const [fechaIntento, setFechaIntento] = useState(new Date().toISOString().split('T')[0]);
    const [notaError, setNotaError] = useState("");
    const [editingHistorialIndex, setEditingHistorialIndex] = useState(null);
    const [editingIntentoIndex, setEditingIntentoIndex] = useState(null);

    // Ref para evitar ciclos infinitos o actualizaciones innecesarias si se desea, 
    // pero aquí usaremos useEffect para el side effect del servidor.
    const lastDetallesRef = useRef(progresoDetalles);

    useEffect(() => {
        lastDetallesRef.current = progresoDetalles;
    }, [progresoDetalles]);

    // Función centralizada para guardar detalles usando actualización funcional
    const updateDetalles = (updater) => {
        if (!infoMateria?.codigo) return;
        setProgresoDetalles(prev => {
            const currentData = prev[infoMateria.codigo] || { intentosFinal: [] };
            const newData = typeof updater === 'function' ? updater(currentData) : updater;
            const updated = { ...prev, [infoMateria.codigo]: newData };
            
            // Disparamos la actualización al servidor (side effect controlado)
            // Lo ideal es hacerlo fuera del setstate, pero aquí lo mantenemos simple con un delay 
            // o simplemente confiando en que updateAuthProgreso es seguro.
            // Para ser 100% React-compliant, lo sacaremos a un useEffect.
            return updated;
        });
    };

    // Sincronización con el servidor cuando cambian los detalles locales
    useEffect(() => {
        if (infoMateria) {
            updateAuthProgreso(plan, progreso, progresoDetalles);
        }
    }, [progresoDetalles, plan, progreso]);

    const handleCambioAnio = (e) => {
        const anioN = Number(e.target.value);
        const cuatriAuto = infoMateria?.cuatrimestre ? (Number(infoMateria.cuatrimestre) % 2 === 0 ? 2 : 1) : 1;
        const nuevaFecha = anioN < 2000 ? { anio: anioN, cuatrimestre: 1 } : { anio: anioN, cuatrimestre: cuatriAuto };

        updateDetalles(currentData => {
            if (currentData.esEquivalencia) {
                return {
                    ...currentData,
                    anioExamen: anioN
                };
            }

            const newData = {
                ...currentData,
                fechaRegularidad: nuevaFecha
            };

            const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
                estadoActual,
                nuevaFecha,
                currentData.intentosFinal
            );

            if (estadoActualizado !== estadoActual) {
                setTimeout(() => cambioDeEstado(infoMateria.codigo, estadoActualizado), 0);
            }

            return newData;
        });
    };

    const handleCambioNotaCursada = (val) => {
        const nota = val === "" ? null : Number(val);
        updateDetalles(currentData => ({
            ...currentData,
            notaRegularizacion: nota
        }));
    };

    const handleToggleLibre = (isLibre) => {
        updateDetalles(currentData => {
            if (isLibre) {
                return {
                    ...currentData,
                    fechaRegularidad: null,
                    notaRegularizacion: null,
                    rendidaLibre: true,
                    esEquivalencia: false
                };
            } else {
                return {
                    ...currentData,
                    rendidaLibre: false
                };
            }
        });
    };

    const handleToggleEquivalencia = (isEquiv) => {
        updateDetalles(currentData => {
            if (isEquiv) {
                return {
                    ...currentData,
                    fechaRegularidad: null,
                    notaRegularizacion: null,
                    intentosFinal: [],
                    esEquivalencia: true,
                    rendidaLibre: false
                };
            } else {
                return {
                    ...currentData,
                    esEquivalencia: false
                };
            }
        });
    };

    const handleCambioNotaEquivalencia = (val) => {
        const nota = val === "" ? null : Number(val);
        updateDetalles(currentData => ({
            ...currentData,
            notaFinal: nota
        }));
    };

    const handleGuardarIntento = () => {
        setNotaError("");
        if (estadoVal === 'rendido') {
            const n = Number(notaVal);
            if (notaVal === "" || isNaN(n) || n < 0 || n > 10) {
                setNotaError("La nota debe estar entre 0 y 10");
                return;
            }
        }

        let notaParsed = estadoVal === 'rendido' ? parseInt(notaVal) : null;
        let status = estadoVal === 'rendido'
            ? (notaParsed >= 4 ? 'aprobado' : 'reprobado')
            : 'ausente';

        updateDetalles(currentData => {
            const intentosActuales = currentData.intentosFinal || [];
            if (intentosActuales.length >= reglas.limites.intentos_final) return currentData;

            const newIntentos = [...intentosActuales, {
                nota: notaParsed,
                estado: status,
                fecha: fechaIntento
            }];

            if (status === 'aprobado') {
                setTimeout(() => cambioDeEstado(infoMateria.codigo, 'Aprobado'), 0);
            } else {
                const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
                    "Regular",
                    currentData.fechaRegularidad,
                    newIntentos
                );
                if (estadoActualizado === 'Libre') {
                    setTimeout(() => cambioDeEstado(infoMateria.codigo, 'Libre'), 0);
                }
            }

            return {
                ...currentData,
                intentosFinal: newIntentos,
                ...(status === 'aprobado' && { notaFinal: notaParsed })
            };
        });

        setShowNotaForm(false);
        setNotaVal("");
        setEstadoVal("rendido");
        setFechaIntento(new Date().toISOString().split('T')[0]);
    };

    const handleEliminarIntento = (index) => {
        updateDetalles(currentData => {
            if (!currentData || !currentData.intentosFinal) return currentData;

            const newIntentos = currentData.intentosFinal.filter((_, i) => i !== index);
            const fueAprobado = currentData.intentosFinal[index]?.estado === 'aprobado';

            if (fueAprobado) {
                setTimeout(() => cambioDeEstado(infoMateria.codigo, 'Regular'), 0);
            } else {
                const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
                    estadoActual,
                    currentData.fechaRegularidad,
                    newIntentos
                );
                if (estadoActualizado !== estadoActual) {
                    setTimeout(() => cambioDeEstado(infoMateria.codigo, estadoActualizado), 0);
                }
            }

            return {
                ...currentData,
                intentosFinal: newIntentos,
                ...(fueAprobado && { notaFinal: null })
            };
        });
    };

    const handleUpdateCursadaHistorial = (index, dataActualizada) => {
        updateDetalles(currentData => {
            const newHistorial = [...(currentData.historial || [])];
            newHistorial[index] = dataActualizada;
            return {
                ...currentData,
                historial: newHistorial
            };
        });
        setEditingHistorialIndex(null);
    };

    const handleEliminarCursadaHistorial = (index) => {
        updateDetalles(currentData => {
            const newHistorial = (currentData.historial || []).filter((_, i) => i !== index);
            return {
                ...currentData,
                historial: newHistorial
            };
        });
    };

    const handleUpdateIntento = (index, dataActualizada) => {
        updateDetalles(currentData => {
            if (!currentData || !currentData.intentosFinal) return currentData;

            const newIntentos = [...currentData.intentosFinal];
            newIntentos[index] = dataActualizada;

            const fueAprobado = dataActualizada.estado === 'aprobado';
            
            if (fueAprobado) {
                setTimeout(() => cambioDeEstado(infoMateria.codigo, 'Aprobado'), 0);
            } else {
                const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
                    estadoActual === "Aprobado" ? "Regular" : estadoActual, 
                    currentData.fechaRegularidad,
                    newIntentos
                );
                if (estadoActualizado !== estadoActual) {
                    setTimeout(() => cambioDeEstado(infoMateria.codigo, estadoActualizado), 0);
                }
            }

            return {
                ...currentData,
                intentosFinal: newIntentos,
                ...(fueAprobado ? { notaFinal: dataActualizada.nota } : { notaFinal: null })
            };
        });
        setEditingIntentoIndex(null);
    };

    return {
        showNotaForm, setShowNotaForm,
        notaVal, setNotaVal,
        estadoVal, setEstadoVal,
        fechaIntento, setFechaIntento,
        notaError,
        editingHistorialIndex, setEditingHistorialIndex,
        editingIntentoIndex, setEditingIntentoIndex,
        handleCambioAnio,
        handleCambioNotaCursada,
        handleGuardarIntento,
        handleEliminarIntento,
        handleUpdateIntento,
        handleUpdateCursadaHistorial,
        handleEliminarCursadaHistorial,
        handleToggleLibre,
        handleToggleEquivalencia,
        handleCambioNotaEquivalencia
    };
}
