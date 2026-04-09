import { useState, useEffect, useMemo, useCallback } from 'react';
import planService from '../services/planService';
import equivalenciasData from '../data/equivalencias.json';
import materiasUtils from '../utils/Progreso/materiasUtils';
import { addToast } from '@heroui/react';

export const useEquivalencias = () => {
    const planViejo = useMemo(() => planService.getPlanByNumber("17.13"), []);
    const planNuevo = useMemo(() => planService.getPlanByNumber("17.14"), []);

    const [progresoSimulado, setProgresoSimulado] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [filtro, setFiltro] = useState('todas');
    const [busqueda, setBusqueda] = useState('');

    const cargarProgresoReal = useCallback(() => {
        const storageKey = "progreso+17.13";
        const storageData = localStorage.getItem(storageKey);

        let progreso = {};
        if (storageData) {
            progreso = JSON.parse(storageData);
        } else {
            planViejo?.materias.forEach(m => {
                progreso[m.codigo] = m.tesis ? materiasUtils.bloquear : materiasUtils.estadosPosibles[0];
            });
        }
        setProgresoSimulado(progreso);
        addToast({ title: "Progreso sincronizado", description: "Datos reales cargados correctamente.", color: "success" });
    }, [planViejo]);

    useEffect(() => {
        cargarProgresoReal();
    }, [cargarProgresoReal]);

    const guardarSimulacion = () => {
        localStorage.setItem(`simulacion+equivalencias+17.13`, JSON.stringify(progresoSimulado));
        addToast({ title: "Simulación guardada", variant: "flat", color: "success" });
    };

    const cargarSimulacion = () => {
        const data = localStorage.getItem(`simulacion+equivalencias+17.13`);
        if (data) {
            setProgresoSimulado(JSON.parse(data));
            addToast({ title: "Simulación cargada", variant: "flat", color: "primary" });
        }
    };

    // NUEVO MOTOR DE MAPEO: Grupos de Equivalencia (Many-to-One y One-to-One)
    const gruposEquivalencia = useMemo(() => {
        if (!planViejo || !planNuevo) return [];

        // 1. Mapear todas las materias del Plan Nuevo a sus orígenes
        const grupos = planNuevo.materias.map(mNueva => {
            const codigosOrigen = equivalenciasData[mNueva.codigo] || [];
            const materiasOrigen = planViejo.materias.filter(mVieja => 
                codigosOrigen.includes(mVieja.codigo) || mVieja.codigo === mNueva.codigo
            );

            return {
                id: `grupo-${mNueva.codigo}`,
                materiaNueva: mNueva,
                materiasViejas: materiasOrigen.length > 0 ? materiasOrigen : [],
                esEquivalente: materiasOrigen.length > 0,
                // AHORA: El orden lo dicta el Plan Nuevo
                anio: mNueva.anio,
                cuatrimestre: mNueva.cuatrimestre
            };
        });

        // 2. Identificar materias del Plan Viejo que se quedaron huérfanas (sin equivalencia)
        const codigosViejosMapeados = new Set();
        grupos.forEach(g => g.materiasViejas.forEach(m => codigosViejosMapeados.add(m.codigo)));
        
        const huerfanas = planViejo.materias
            .filter(m => !codigosViejosMapeados.has(m.codigo))
            .map(mVieja => ({
                id: `huerfana-${mVieja.codigo}`,
                materiaNueva: { nombre: "Sin equivalente directo", codigo: "N/A", horas_totales: "0", horas_semanales: "0" },
                materiasViejas: [mVieja],
                esEquivalente: false,
                anio: mVieja.anio,
                cuatrimestre: mVieja.cuatrimestre
            }));

        return [...grupos, ...huerfanas].sort((a, b) => {
            if (a.anio !== b.anio) return parseInt(a.anio) - parseInt(b.anio);
            return parseInt(a.cuatrimestre) - parseInt(b.cuatrimestre);
        });
    }, [planViejo, planNuevo]);

    const materiasFiltradas = useMemo(() => {
        return gruposEquivalencia.filter(grupo => {
            // Busqueda en cualquier materia vieja del grupo o en la nueva
            const matchesBusqueda = 
                grupo.materiaNueva.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                grupo.materiasViejas.some(m => m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || m.codigo.includes(busqueda));
            
            // Para el filtro de estado, consideramos el estado del grupo (Equivalencia aceptada si TODAS están aprobadas)
            const todasAprobadas = grupo.materiasViejas.length > 0 && 
                grupo.materiasViejas.every(m => progresoSimulado[m.codigo] === materiasUtils.estadosPosibles[2]);
            
            if (filtro === 'aprobadas') return matchesBusqueda && todasAprobadas;
            if (filtro === 'pendientes') return matchesBusqueda && !todasAprobadas;
            
            return matchesBusqueda;
        });
    }, [gruposEquivalencia, progresoSimulado, filtro, busqueda]);

    const toggleEstado = (codigoMateria) => {
        if (!modoEdicion) return;
        setProgresoSimulado(prev => {
            const currentStatus = prev[codigoMateria];
            const currentIndex = materiasUtils.estadosPosibles.indexOf(currentStatus);
            const nextIndex = (currentIndex + 1) % materiasUtils.estadosPosibles.length;
            return { ...prev, [codigoMateria]: materiasUtils.estadosPosibles[nextIndex] };
        });
    };

    // MOTOR DE CÁLCULO DE HORAS REFACTORIZADO
    const comparativaHoras = useMemo(() => {
        if (!planViejo || !planNuevo) return null;

        // 1. Calcular Horas Plan Viejo
        let viejoTotales = 0;
        let viejoRestantes = 0;
        planViejo.materias.forEach(m => {
            const h = parseInt(m.horas_totales) || 0;
            viejoTotales += h;
            if (progresoSimulado[m.codigo] !== materiasUtils.estadosPosibles[2]) {
                viejoRestantes += h;
            }
        });

        // 2. Calcular Horas Plan Nuevo (Considerando herencia de equivalencias compleja)
        let nuevoTotales = 0;
        let nuevoRestantes = 0;

        planNuevo.materias.forEach(m => {
            const h = parseInt(m.horas_totales) || 0;
            nuevoTotales += h;

            const equivs = equivalenciasData[m.codigo];
            let estaAprobada = false;

            if (equivs) {
                // Si tiene equivalencias en el JSON, deben estar TODAS aprobadas en el plan viejo
                estaAprobada = equivs.every(c => progresoSimulado[c] === materiasUtils.estadosPosibles[2]);
            } else {
                // Si no tiene equivalencia en JSON, buscamos por código directo
                estaAprobada = progresoSimulado[m.codigo] === materiasUtils.estadosPosibles[2];
            }

            if (!estaAprobada) {
                nuevoRestantes += h;
            }
        });

        return {
            viejo: { totales: viejoTotales, restantes: viejoRestantes },
            nuevo: { totales: nuevoTotales, restantes: nuevoRestantes }
        };
    }, [progresoSimulado, planViejo, planNuevo]);

    return {
        planViejo, planNuevo, progresoSimulado, materiasFiltradas, filtro, setFiltro, busqueda, setBusqueda,
        modoEdicion, setModoEdicion, toggleEstado, guardarSimulacion, cargarSimulacion, cargarProgresoReal,
        comparativaHoras,
        stats: {
            porcentajeViejo: comparativaHoras?.viejo.totales ? Math.round(((comparativaHoras.viejo.totales - comparativaHoras.viejo.restantes) * 100) / comparativaHoras.viejo.totales) : 0,
            porcentajeNuevo: comparativaHoras?.nuevo.totales ? Math.round(((comparativaHoras.nuevo.totales - comparativaHoras.nuevo.restantes) * 100) / comparativaHoras.nuevo.totales) : 0,
            totalNuevas: planNuevo?.materias.length || 0,
            aprobadasNuevas: planNuevo?.materias.filter(m => {
                const equivs = equivalenciasData[m.codigo];
                return equivs ? equivs.every(c => progresoSimulado[c] === materiasUtils.estadosPosibles[2]) : progresoSimulado[m.codigo] === materiasUtils.estadosPosibles[2];
            }).length
        }
    };
};
