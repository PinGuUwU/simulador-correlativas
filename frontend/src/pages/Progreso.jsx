import { useEffect, useRef, useState } from 'react';
import MateriasList from '../components/Progreso/MateriasList';
import ProgresoTotal from '../components/Progreso/ProgresoTotal';
import { Spinner } from '@heroui/react';
import LeyendaEstados from '../components/Progreso/LeyendaEstados';
import PlanSelectionModal from '../components/Progreso/modals/PlanSelectionModal';
import usePlanData from '../hooks/usePlanData';
import materiasUtils from '../utils/Progreso/materiasUtils';

function Progreso({ plan, setPlan }) {
    // Usamos el hook centralizado para la carga de datos y progreso
    const { 
        materias, 
        progreso, 
        setProgreso, 
        progresoDetalles, 
        setProgresoDetalles, 
        cargandoPlan: cargando 
    } = usePlanData(plan);

    const carrera = "Licenciatura en Sistemas de Información";
    const headerRef = useRef(null);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Calcular el progreso total (materias aprobadas)
    const totalProgreso = () => {
        if (!materias.length) return 0;
        let total = 0;
        materias.forEach((m) => {
            if (progreso[m.codigo] === materiasUtils.estadosPosibles[2]) {
                total += 1;
            }
        });
        return total;
    };
    
    const progress = materias.length > 0 
        ? Math.round((totalProgreso() * 100) / materias.length) 
        : 0;

    return (
        <div className="overflow-visible bg-default-100 min-h-screen">
            <PlanSelectionModal 
                isOpen={!plan} 
                onSelect={(selectedPlan) => setPlan(selectedPlan)} 
            />

            {cargando && (
                <div className='flex justify-center items-center h-screen'>
                    <Spinner size="lg" label="Cargando materias..." />
                </div>
            )}

            {!cargando && plan && (
                <div>
                    <ProgresoTotal
                        carrera={carrera}
                        progress={progress}
                        progreso={progreso}
                        progresoDetalles={progresoDetalles}
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

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 mx-5 md:mx-10 lg:mx-15">
                        <LeyendaEstados materias={materias} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Progreso;