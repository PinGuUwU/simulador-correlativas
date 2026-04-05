
import { useEffect, useRef, useState } from 'react';
import MateriasList from '../components/Progreso/MateriasList';
import MateriasProgreso from '../components/Progreso/MateriasProgreso';
import ProgresoTotal from '../components/Progreso/ProgresoTotal';
import { Spinner, Button, addToast } from '@heroui/react';
import LeyendaEstados from '../components/Progreso/LeyendaEstados';
import TutorialTour from '../components/Tutorial/TutorialTour';
import planService from '../services/planService';
import materiasUtils from '../utils/Progreso/materiasUtils';
import { useAuth } from '../context/AuthContext';

function Progreso({ plan }) {
    const { getProgresoLocal, getProgresoDetallesLocal, updateAuthProgreso } = useAuth();
    
    // Inicialización síncrona para anular el bloqueo de renderizado (Mejora radical de LCP y FCP)
    const [materias, setMaterias] = useState(() => {
        const planData = planService.getPlanByNumber(plan);
        return planData ? planData.materias : [];
    });

    const [progreso, setProgreso] = useState(() => {
        const planData = planService.getPlanByNumber(plan);
        if (!planData) return {};
        const storageData = getProgresoLocal(plan);
        if (storageData) return storageData;

        let progresoInicial = {};
        planData.materias.forEach(m => {
            if (m.tesis) progresoInicial[m.codigo] = materiasUtils.bloquear;
            else progresoInicial[m.codigo] = (m.correlativas.length > 0 ? materiasUtils.bloquear : materiasUtils.estadosPosibles[0]);
        });
        return progresoInicial;
    });

    const [progresoDetalles, setProgresoDetalles] = useState(() => {
        const storageData = getProgresoDetallesLocal(plan);
        return storageData || {};
    });

    const [cargando, setCargando] = useState(false);
    const carrera = "Licenciatura en Sistemas de Información";
    const headerRef = useRef(null);
    const [isSticky, setIsSticky] = useState(false);
    const [mostrarTutorial, setMostrarTutorial] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Actualizar si el plan cambia dinámicamente
    useEffect(() => {
        const planData = planService.getPlanByNumber(plan);
        if (!planData) {
            addToast({ title: 'Plan no encontrado', description: `No existe el plan "${plan}".`, color: 'danger' });
            return;
        }
        setMaterias(planData.materias);
        
        let localProgreso = getProgresoLocal(plan);
        let localDetalles = getProgresoDetallesLocal(plan);
        if (!localProgreso) {
            localProgreso = {};
            localDetalles = {};
            planData.materias.forEach(m => {
                if (m.tesis) localProgreso[m.codigo] = materiasUtils.bloquear;
                else localProgreso[m.codigo] = (m.correlativas.length > 0 ? materiasUtils.bloquear : materiasUtils.estadosPosibles[0]);
            });
            updateAuthProgreso(plan, localProgreso, localDetalles);
        }
        setProgreso(localProgreso);
        setProgresoDetalles(localDetalles || {});
    }, [plan, getProgresoLocal, getProgresoDetallesLocal, updateAuthProgreso]);

    //Calcular el progreso total para pasarselo al componente
    const totalProgreso = () => {
        let total = 0
        materias.forEach((m) => {
            if (progreso[m.codigo] === materiasUtils.estadosPosibles[2]) {
                total += 1
            }
        })
        return total
    }
    const progress = Math.round((totalProgreso() * 100) / materias.length)

    const handleTutorialComplete = () => {
        setMostrarTutorial(false)
        localStorage.setItem(`tutorial_progreso`, 'true')
    }

    // Escuchar el evento 'start-tutorial' disparado desde el botón "Repetir Tutorial" del NavBar
    useEffect(() => {
        const handleStartTutorial = () => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            setMostrarTutorial(true);
        };
        window.addEventListener('start-tutorial', handleStartTutorial);
        return () => window.removeEventListener('start-tutorial', handleStartTutorial);
    }, []);

    return (
        <div className="overflow-hidden bg-default-100">
            {mostrarTutorial && <TutorialTour onComplete={handleTutorialComplete} onCancel={handleTutorialComplete} />}
            {cargando && (
                <div className='flex justify-center items-center h-screen'>
                    < Spinner />
                </div>
            )}
            {!cargando && (
                <div>
                    <ProgresoTotal
                        carrera={carrera}
                        progress={progress}
                        progreso={progreso}
                        materias={materias}
                        isSticky={isSticky}
                        headerRef={headerRef}
                        setIsSticky={setIsSticky}
                    />
                    <div className='mx-5 md:mx-10 lg:mx-15 mt-6'>
                        <MateriasList
                            plan={plan}
                            progreso={progreso}
                            setProgreso={setProgreso}
                            progresoDetalles={progresoDetalles}
                            setProgresoDetalles={setProgresoDetalles}
                            materias={materias}
                            cargando={cargando}
                            isProgressSticky={isSticky}
                        />
                    </div>
                </div>
            )}

            {/* Breve descripción de lo que significa cada estado posible */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 mx-5 md:mx-10 lg:mx-15">
                <LeyendaEstados materias={materias} />
                <Button
                    color="primary"
                    variant="flat"
                    onPress={() => setMostrarTutorial(true)}
                    startContent={<i className="fa-solid fa-circle-question" />}
                    className="font-bold w-full md:w-auto"
                >
                    Ver Tutorial
                </Button>
            </div>
        </div>
    );
}

export default Progreso;