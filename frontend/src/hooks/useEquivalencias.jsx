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

    // Lógica de emparejamiento (Plan Viejo -> Plan Nuevo)
    const paresMaterias = useMemo(() => {
        if (!planViejo || !planNuevo) return [];
        return planViejo.materias.map(mVieja => {
            let mNuevaCodigo = Object.keys(equivalenciasData).find(key =>
                equivalenciasData[key].includes(mVieja.codigo)
            );
            if (!mNuevaCodigo) {
                const mismaMateria = planNuevo.materias.find(m => m.codigo === mVieja.codigo);
                if (mismaMateria) mNuevaCodigo = mismaMateria.codigo;
            }
            const mNueva = planNuevo.materias.find(m => m.codigo === mNuevaCodigo);
            return {
                id: `${mVieja.codigo}-${mNuevaCodigo || 'null'}`,
                materiaVieja: mVieja,
                materiaNueva: mNueva || { nombre: "Sin equivalente directo", codigo: "N/A", horas_totales: "0", horas_semanales: "0" },
                esEquivalente: !!mNueva
            };
        });
    }, [planViejo, planNuevo]);

    const materiasFiltradas = useMemo(() => {
        return paresMaterias.filter(par => {
            const matchesBusqueda = par.materiaVieja.nombre.toLowerCase().includes(busqueda.toLowerCase()) || par.materiaVieja.codigo.includes(busqueda);
            const estado = progresoSimulado[par.materiaVieja.codigo];
            if (filtro === 'aprobadas') return matchesBusqueda && estado === materiasUtils.estadosPosibles[2];
            if (filtro === 'pendientes') return matchesBusqueda && estado === materiasUtils.estadosPosibles[0];
            return matchesBusqueda;
        });
    }, [paresMaterias, progresoSimulado, filtro, busqueda]);

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
            porcentajeViejo: Math.round(((planViejo?.materias.length - (comparativaHoras?.viejo.restantes / 96)) * 100) / planViejo?.materias.length), // Aproximación por UI
            porcentajeNuevo: Math.round(((planNuevo?.materias.length - (comparativaHoras?.nuevo.restantes / 96)) * 100) / planNuevo?.materias.length),
            totalNuevas: planNuevo?.materias.length || 0,
            aprobadasNuevas: planNuevo?.materias.filter(m => {
                const equivs = equivalenciasData[m.codigo];
                return equivs ? equivs.every(c => progresoSimulado[c] === materiasUtils.estadosPosibles[2]) : progresoSimulado[m.codigo] === materiasUtils.estadosPosibles[2];
            }).length
        }
    };
};
