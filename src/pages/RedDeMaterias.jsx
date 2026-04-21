import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import usePlanData from '../hooks/usePlanData';
import useProgresoMaterias from '../hooks/Progreso/useProgresoMaterias';
import MateriasGrafo from '../components/Progreso/MateriasGrafo';
import { Spinner, Card, CardBody, Chip, Button } from '@heroui/react';
import { Network, Info } from 'lucide-react';
import { useDisclosure } from '@heroui/react';
import DetalleMateriaModal from '../components/Progreso/modals/DetalleMateriaModal';
import { useNavigate } from 'react-router-dom';

const RedDeMaterias = ({ plan }) => {
    const { updateAuthProgreso } = useAuth();
    const { 
        materias, 
        progreso, 
        setProgreso, 
        progresoDetalles, 
        setProgresoDetalles,
        cargandoPlan: loadingPlan 
    } = usePlanData(plan);
    
    const [infoMateria, setInfoMateria] = useState(null);
    const navigate = useNavigate();
    
    const { 
        isOpen: isDetailOpen, 
        onOpen: onDetailOpen, 
        onOpenChange: onDetailOpenChange,
        onClose: onDetailClose 
    } = useDisclosure();

    const { cambioDeEstado } = useProgresoMaterias(
        progreso, 
        setProgreso, 
        materias, 
        plan, 
        updateAuthProgreso
    );

    const abrirInfo = (materia) => {
        setInfoMateria(materia);
        onDetailOpen();
    };

    if (loadingPlan) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Spinner size="lg" label="Cargando red de materias..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header explicativo */}
            <div className="max-w-7xl mx-auto px-6 pt-10 pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Network size={28} />
                            </div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight italic uppercase">
                                Red de <span className="text-primary">Materias</span>
                            </h1>
                        </div>
                        <p className="text-foreground/60 text-lg font-medium max-w-2xl leading-relaxed">
                            Visualizá tu carrera como un mapa interactivo. Explorá las correlatividades, 
                            descubrí qué materias desbloqueás y gestioná tu avance académico de forma gráfica.
                        </p>
                        <div className="pt-2 flex items-center">
                            Si querés actualizar el estado de tus materias: 
                            <Button 
                                size="sm" 
                                color="primary" 
                                variant="flat" 
                                className="font-bold"
                                startContent={<i className="fa-solid fa-graduation-cap" />}
                                onPress={() => navigate('/progreso')}
                            >
                                 ir a mi progreso
                            </Button>
                        </div>
                    </div>
                    
                    <Card className="bg-default-100/50 border-none shadow-none backdrop-blur-md max-w-xs">
                        <CardBody className="flex flex-row gap-3 p-4">
                            <div className="mt-1 text-primary">
                                <Info size={18} />
                            </div>
                            <p className="text-[11px] leading-snug text-foreground/70">
                                <span className="font-bold text-foreground">Tip:</span> Mantené el mouse sobre una materia para ver sus conexiones de entrada y salida. Hacé clic para ver detalles.
                            </p>
                        </CardBody>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <Chip variant="flat" color="primary" size="sm" className="font-bold uppercase tracking-wider text-[10px]">
                        Interactiva
                    </Chip>
                    <Chip variant="flat" color="secondary" size="sm" className="font-bold uppercase tracking-wider text-[10px]">
                        Correlatividades
                    </Chip>
                    <Chip variant="flat" color="success" size="sm" className="font-bold uppercase tracking-wider text-[10px]">
                        Sincronizada
                    </Chip>
                </div>
            </div>

            {/* Grafo */}
            <div className="max-w-300 mx-auto px-4">
                <div className="bg-background/50 backdrop-blur-sm rounded-[2.5rem] border border-default-200/60 p-2 shadow-2xl">
                    <MateriasGrafo 
                        materias={materias}
                        progreso={progreso}
                        abrirInfo={abrirInfo}
                        selectedMateriaCode={isDetailOpen ? infoMateria?.codigo : null}
                    />
                </div>
            </div>

            {/* Modal de Detalle */}
            <DetalleMateriaModal
                isOpen={isDetailOpen}
                onOpenChange={onDetailOpenChange}
                materia={infoMateria}
                progreso={progreso}
                progresoDetalles={progresoDetalles}
                onEstadoChange={cambioDeEstado}
                onClose={onDetailClose}
            />
        </div>
    );
};

export default RedDeMaterias;
