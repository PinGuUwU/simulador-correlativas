import { useState, useEffect } from 'react'
import { addToast } from '@heroui/react'
import planService from '../../services/planService'
import { useAuth } from '../../context/AuthContext'

const useSimuladorEstado = ({ plan, modo, anioInicio, cuatriInicio }) => {
    const { getProgresoLocal, getSimulacionLocal } = useAuth();
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
            setMaterias(planData.materias)

            // Modo: cargar simulación guardada
            if (modo === 'guardado') {
                const parsed = getSimulacionLocal(plan);
                if (parsed) {
                    setHistorialSemestres(parsed.historialSemestres ?? [])
                    setProgresoSimulado(parsed.progresoSimulado ?? {})
                    setProgresoBase(parsed.progresoBase ?? {})
                    setAnioActual(parsed.anioActual ?? new Date().getFullYear())
                    setCuatri(parsed.cuatri ?? '1')
                    setSimulacionTerminada(parsed.simulacionTerminada ?? false)
                    setCargando(false)
                    return
                }
                // Si no hay guardado, cae al modo "nuevo"
            }

            // Progreso real del alumno (de /progreso)
            const progresoInicial = getProgresoLocal(plan);

            let nuevoProgreso = {}
            const data = planData.materias
            // Modo: nuevo (sin progreso previo)
            if (modo === 'nuevo' || !progresoInicial) {
                data.forEach(m => { nuevoProgreso[m.codigo] = 'No Cursado' })
                setProgresoSimulado(nuevoProgreso)
                setProgresoBase(nuevoProgreso)
                setAnioActual(Number(anioInicio) || new Date().getFullYear())
                setCuatri(cuatriInicio || '1')
                setHistorialSemestres([])
                setSimulacionTerminada(false)
            } else {
                // Modo: viejo (con progreso previo del alumno)
                data.forEach(m => {
                    nuevoProgreso[m.codigo] = ['Regular', 'Aprobado'].includes(progresoInicial[m.codigo])
                        ? 'Cursado'
                        : 'No Cursado'
                })

                let maxSemestre = 0
                data.forEach(m => {
                    if (nuevoProgreso[m.codigo] === 'Cursado')
                        maxSemestre = Math.max(maxSemestre, Number(m.cuatrimestre))
                })

                // Calcular fechas reales hacia atrás desde anioInicio/cuatriInicio
                let currentY = Number(anioInicio) || new Date().getFullYear()
                let currentC = Number(cuatriInicio) || 1
                const pastDates = []
                for (let i = 0; i < maxSemestre; i++) {
                    if (currentC === 1) { currentC = 2; currentY-- }
                    else { currentC = 1 }
                    pastDates.push({ y: currentY, c: currentC })
                }
                pastDates.reverse()

                const fakeHistorial = []
                const acumulado = {}
                data.forEach(m => { acumulado[m.codigo] = 'No Cursado' })

                for (let i = 1; i <= maxSemestre; i++) {
                    const materiasDelSemestre = data.filter(m => Number(m.cuatrimestre) === i)
                    const progresoBaseSnapshot = { ...acumulado }
                    materiasDelSemestre.forEach(m => {
                        if (nuevoProgreso[m.codigo] === 'Cursado') acumulado[m.codigo] = 'Cursado'
                    })
                    const progresoSnapshot = { ...acumulado }
                    const pd = pastDates[i - 1]
                    fakeHistorial.push({
                        anioActual: pd.y,
                        cuatri: String(pd.c),
                        materiasDelSemestre,
                        progresoSnapshot,
                        progresoBaseSnapshot
                    })
                }

                setHistorialSemestres(fakeHistorial)
                setProgresoSimulado({ ...acumulado })
                setProgresoBase({ ...acumulado })
                setAnioActual(Number(anioInicio) || new Date().getFullYear())
                setCuatri(cuatriInicio || '1')

                const cursadas = data.filter(m => acumulado[m.codigo] === 'Cursado').length
                setSimulacionTerminada(cursadas === data.length && data.length > 0)
            }
        } catch {
            // Error interno al calcular el estado inicial: el finally resetea cargando.
        } finally {
            setCargando(false)
        }
    }, [plan, modo, anioInicio, cuatriInicio])


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
        estadoAnterior,
        estadoSiguiente,
        simulacionTerminada,
        setSimulacionTerminada,
        handleAnterior,
        handleSiguiente
    }
}

export default useSimuladorEstado
