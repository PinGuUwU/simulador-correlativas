import { useState, useEffect } from 'react';
import planService from '../services/planService';
import { useAuth } from '../context/AuthContext';
import materiasUtils from '../utils/Progreso/materiasUtils';
import { addToast } from '@heroui/react';

/**
 * Hook centralizado para cargar las materias y el progreso de un plan específico.
 * Evita la duplicación de lógica entre las páginas de Progreso y Simulador.
 */
export default function usePlanData(plan) {
    const { getProgresoLocal, getProgresoDetallesLocal, updateAuthProgreso } = useAuth();
    const [materias, setMaterias] = useState([]);
    const [progreso, setProgreso] = useState({});
    const [progresoDetalles, setProgresoDetalles] = useState({});
    const [cargandoPlan, setCargandoPlan] = useState(true);

    useEffect(() => {
        if (!plan) {
            setCargandoPlan(false);
            return;
        }

        let isMounted = true;
        setCargandoPlan(true);

        // 1. Carga asíncrona del plan (JSON dinámico)
        planService.getMateriasByPlan(plan).then(materiasDelPlan => {
            if (!isMounted) return;
            setMaterias(materiasDelPlan);

            // 2. Recuperación del progreso guardado
            let localProgreso = getProgresoLocal(plan);
            let localDetalles = getProgresoDetallesLocal(plan);

            // 3. Inicialización si es la primera vez que se usa este plan
            if (!localProgreso) {
                localProgreso = {};
                localDetalles = {};
                materiasDelPlan.forEach(m => {
                    if (m.tesis) {
                        localProgreso[m.codigo] = materiasUtils.bloquear;
                    } else {
                        localProgreso[m.codigo] = (m.correlativas.length > 0 
                            ? materiasUtils.bloquear 
                            : materiasUtils.estadosPosibles[0]);
                    }
                });
                updateAuthProgreso(plan, localProgreso, localDetalles);
            }

            setProgreso(localProgreso);
            setProgresoDetalles(localDetalles || {});
            setCargandoPlan(false);
        }).catch(err => {
            console.error("Error al cargar el plan académico:", err);
            if (isMounted) {
                addToast({ 
                    title: 'Error de carga', 
                    description: `No se pudo cargar el plan "${plan}".`, 
                    color: 'danger' 
                });
                setCargandoPlan(false);
            }
        });

        return () => { isMounted = false; };
    }, [plan, getProgresoLocal, getProgresoDetallesLocal, updateAuthProgreso]);

    return { 
        materias, 
        progreso, 
        setProgreso, 
        progresoDetalles, 
        setProgresoDetalles, 
        cargandoPlan 
    };
}