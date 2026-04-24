import { useState, useEffect } from 'react'
import { addToast } from '@heroui/react'
import planService from '../../services/planService'
import { useAuth } from '../../context/AuthContext'

const useSimuladorEstado = ({ plan, anioInicio, cuatriInicio }) => {
    const [materias, setMaterias] = useState([])
    const [cargando, setCargando] = useState(false)
    const [progresoSimulado, setProgresoSimulado] = useState(null)
    const [progresoBase, setProgresoBase] = useState(null)
    const [cuatri, setCuatri] = useState('1')
    const [anioActual, setAnioActual] = useState(new Date().getFullYear())
    const [historialSemestres, setHistorialSemestres] = useState([])
    const [estadoAnterior, setEstadoAnterior] = useState(false)
    const [estadoSiguiente, setEstadoSiguiente] = useState(true)
    const [simulacionTerminada, setSimulacionTerminada] = useState(false)

    // Calculamos el semestre del plan (1 a 10) basándonos en el historial
    const semestreActualPlan = historialSemestres.length + 1;

    // ─── Carga de materias e inicialización ──────────────────────────────────
    useEffect(() => {
        if (!plan) return
        setCargando(true)
        try {
            const planData = planService.getPlanByNumber(plan)
            if (!planData) {
                addToast({ title: 'Plan no encontrado', description: `No existe el plan "${plan}". Intentá recargar la página.`, color: 'danger' });
                setCargando(false);
                return;
            }
            const data = planData.materias
            setMaterias(data)

            // Siempre iniciamos desde cero para una simulación limpia
            let nuevoProgreso = {}
            data.forEach(m => { nuevoProgreso[m.codigo] = 'No Cursado' })
            
            setProgresoSimulado(nuevoProgreso)
            setProgresoBase(nuevoProgreso)
            setAnioActual(Number(anioInicio) || new Date().getFullYear())
            setCuatri(cuatriInicio || '1')
            setHistorialSemestres([])
            setSimulacionTerminada(false)
        } catch (error) {
            console.error(error)
        } finally {
            setCargando(false)
        }
    }, [plan]) // Only re-run when plan changes. anioInicio/cuatriInicio are initial values.


    // ─── Habilitar/deshabilitar botones de navegación ──────────────────────
    useEffect(() => {
        setEstadoAnterior(historialSemestres.length > 0)
        setEstadoSiguiente(!simulacionTerminada)
    }, [historialSemestres, simulacionTerminada])

    // ─── Handlers de navegación ─────────────────────────────────────────────
    const handleAnterior = () => {
        if (historialSemestres.length === 0) return
        const last = historialSemestres[historialSemestres.length - 1]
        setAnioActual(last.anioActual)
        setCuatri(last.cuatri)
        setProgresoSimulado(last.progresoSnapshot)
        setProgresoBase(last.progresoBaseSnapshot)
        setSimulacionTerminada(false)
        setHistorialSemestres(prev => prev.slice(0, -1))
    }

    const handleSiguiente = (materiasCursables) => {
        if (!progresoSimulado || !materias.length) return

        const algunCambio = materiasCursables.some(
            m => progresoSimulado[m.codigo] === 'Cursado' && progresoBase[m.codigo] !== 'Cursado'
        )
        if (materiasCursables.length > 0 && !algunCambio) {
            try {
                addToast({
                    title: 'Atención',
                    description: 'Avanzaste sin haber modificado el estado de ninguna materia mostrada.',
                    color: 'warning'
                })
            } catch (_) { /* no-op */ }
        }

        const semestreCompletado = {
            anioActual,
            cuatri,
            materiasDelSemestre: materiasCursables,
            progresoSnapshot: { ...progresoSimulado },
            progresoBaseSnapshot: { ...progresoBase }
        }
        setHistorialSemestres(prev => [...prev, semestreCompletado])
        setProgresoBase({ ...progresoSimulado })

        const cantidadCursados = materias.filter(m => progresoSimulado[m.codigo] === 'Cursado').length
        if (cantidadCursados === materias.length) {
            setSimulacionTerminada(true)
            setEstadoSiguiente(false)
        } else if (cuatri === '1') {
            setCuatri('2')
        } else {
            setAnioActual(a => a + 1)
            setCuatri('1')
        }
    }

    return {
        materias,
        cargando,
        progresoSimulado,
        setProgresoSimulado,
        progresoBase,
        setProgresoBase,
        cuatri,
        setCuatri,
        anioActual,
        historialSemestres,
        setHistorialSemestres,
        semestreActualPlan,
        estadoAnterior,
        estadoSiguiente,
        simulacionTerminada,
        setSimulacionTerminada,
        handleAnterior,
        handleSiguiente
    }
}

export default useSimuladorEstado
