import { useState } from 'react';
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

    const guardarDetalles = (nuevosDetalles) => {
        const payload = { ...progresoDetalles, [infoMateria.codigo]: nuevosDetalles };
        setProgresoDetalles(payload);
        updateAuthProgreso(plan, progreso, payload);
    };

    const handleCambioAnio = (e) => {
        const currentData = progresoDetalles[infoMateria?.codigo] || { intentosFinal: [] };
        const anioN = Number(e.target.value);
        
        if (anioN < 2000) {
            guardarDetalles({
                ...currentData,
                fechaRegularidad: { anio: anioN, cuatrimestre: 1 }
            });
            return;
        }

        const cuatriAuto = infoMateria?.cuatrimestre ? (Number(infoMateria.cuatrimestre) % 2 === 0 ? 2 : 1) : 1;
        const nuevaFecha = { anio: anioN, cuatrimestre: cuatriAuto };
        
        guardarDetalles({
            ...currentData,
            fechaRegularidad: nuevaFecha
        });

        const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
            estadoActual,
            nuevaFecha,
            currentData.intentosFinal
        );

        if (estadoActualizado !== estadoActual) {
            cambioDeEstado(infoMateria.codigo, estadoActualizado);
        }
    };

    const handleCambioNotaCursada = (val) => {
        const currentData = progresoDetalles[infoMateria?.codigo] || { intentosFinal: [] };
        guardarDetalles({ ...currentData, notaRegularizacion: val === "" ? null : Number(val) });
    };

    const handleToggleLibre = (isLibre) => {
        const currentData = progresoDetalles[infoMateria?.codigo] || { intentosFinal: [] };
        if (isLibre) {
            guardarDetalles({
                ...currentData,
                fechaRegularidad: null,
                notaRegularizacion: null,
                rendidaLibre: true
            });
        } else {
            guardarDetalles({
                ...currentData,
                rendidaLibre: false
            });
        }
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

        const currentData = progresoDetalles[infoMateria?.codigo] || { intentosFinal: [] };
        const intentosActuales = currentData.intentosFinal || [];

        if (intentosActuales.length >= reglas.limites.intentos_final) return;

        const newIntentos = [...intentosActuales, {
            nota: notaParsed,
            estado: status,
            fecha: fechaIntento
        }];

        const updatedData = {
            ...currentData,
            intentosFinal: newIntentos,
            ...(status === 'aprobado' && { notaFinal: notaParsed })
        };
        guardarDetalles(updatedData);

        setShowNotaForm(false);
        setNotaVal("");
        setEstadoVal("rendido");
        setFechaIntento(new Date().toISOString().split('T')[0]);

        if (status === 'aprobado') {
            cambioDeEstado(infoMateria.codigo, 'Aprobado');
        } else {
            const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
                "Regular",
                currentData.fechaRegularidad,
                newIntentos
            );
            if (estadoActualizado === 'Libre') {
                cambioDeEstado(infoMateria.codigo, 'Libre');
            }
        }
    };

    const handleEliminarIntento = (index) => {
        const currentData = progresoDetalles[infoMateria?.codigo];
        if (!currentData || !currentData.intentosFinal) return;

        const newIntentos = currentData.intentosFinal.filter((_, i) => i !== index);
        const fueAprobado = currentData.intentosFinal[index]?.estado === 'aprobado';

        const updatedData = {
            ...currentData,
            intentosFinal: newIntentos,
            ...(fueAprobado && { notaFinal: null })
        };
        guardarDetalles(updatedData);

        if (fueAprobado) {
            cambioDeEstado(infoMateria.codigo, 'Regular');
        } else {
            const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
                estadoActual,
                currentData.fechaRegularidad,
                newIntentos
            );
            if (estadoActualizado !== estadoActual) {
                cambioDeEstado(infoMateria.codigo, estadoActualizado);
            }
        }
    };

    const handleUpdateCursadaHistorial = (index, dataActualizada) => {
        const currentData = { ...(progresoDetalles[infoMateria?.codigo] || {}) };
        const newHistorial = [...(currentData.historial || [])];
        newHistorial[index] = dataActualizada;
        
        guardarDetalles({
            ...currentData,
            historial: newHistorial
        });
        setEditingHistorialIndex(null);
    };

    const handleEliminarCursadaHistorial = (index) => {
        const currentData = { ...(progresoDetalles[infoMateria?.codigo] || {}) };
        const newHistorial = (currentData.historial || []).filter((_, i) => i !== index);
        
        guardarDetalles({
            ...currentData,
            historial: newHistorial
        });
    };

    const handleUpdateIntento = (index, dataActualizada) => {
        const currentData = progresoDetalles[infoMateria?.codigo];
        if (!currentData || !currentData.intentosFinal) return;

        const newIntentos = [...currentData.intentosFinal];
        newIntentos[index] = dataActualizada;

        // Si se editó a "aprobado", actualizar notaFinal. Si ya no es, remover notaFinal
        const fueAprobado = dataActualizada.estado === 'aprobado';
        
        const updatedData = {
            ...currentData,
            intentosFinal: newIntentos,
            ...(fueAprobado ? { notaFinal: dataActualizada.nota } : { notaFinal: null })
        };
        guardarDetalles(updatedData);

        // Actualizar estado general consolidado
        if (fueAprobado) {
            cambioDeEstado(infoMateria.codigo, 'Aprobado');
        } else {
            const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
                estadoActual === "Aprobado" ? "Regular" : estadoActual, 
                currentData.fechaRegularidad,
                newIntentos
            );
            if (estadoActualizado !== estadoActual) {
                cambioDeEstado(infoMateria.codigo, estadoActualizado);
            }
        }
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
        handleToggleLibre
    };
}