import React, { useState } from 'react';
import { Card, CardBody, Chip, Button, Divider, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import MateriaCard from '../../Progreso/MateriaCard';
import DetalleMateriaModal from '../../Progreso/modals/DetalleMateriaModal';

export default function InteractiveMateriaDemo() {
    const [estado, setEstado] = useState('Disponible');
    const [detalles, setDetalles] = useState({});
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Datos de ejemplo para la materia demo
    const materiaDemo = {
        codigo: "99001",
        nombre: "Materia de Ejemplo",
        anio: "1",
        cuatrimestre: "1",
        horas_semanales: "6",
        horas_totales: "96",
        correlativas: ["11071"],
        taller: false
    };

    const mockMaterias = [
        materiaDemo,
        { codigo: "11071", nombre: "Materia Correlativa Previa", anio: "1", cuatrimestre: "1", correlativas: [] }
    ];

    const mockProgreso = {
        "99001": estado,
        "11071": "Aprobado"
    };

    const handleCambioEstado = (target) => {
        if (target === 'Reiniciar') {
            setEstado('Disponible');
            setDetalles({});
        } else {
            setEstado(target);
            // Simular carga de año si es Aprobado/Promocionado para evitar chips de falta info
            if (target === 'Aprobado' || target === 'Promocionado') {
                setDetalles(prev => ({ ...prev, fechaRegularidad: { anio: 2024, cuatrimestre: 1 }, notaFinal: 10 }));
            }
        }
    };

    const handleUpdateDetalles = (nuevosDetalles) => {
        setDetalles(nuevosDetalles[materiaDemo.codigo]);
    };

    return (
        <div className="flex flex-col gap-8 my-10 animate-in fade-in zoom-in duration-700">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-4">
                <Chip color="secondary" variant="dot" className="mb-2 font-bold uppercase">Simulador Interactivo</Chip>
                <h3 className="text-2xl font-black text-foreground">¡Probá la tarjeta vos mismo!</h3>
                <p className="text-foreground/60 text-sm">
                    Interactuá con esta materia de ejemplo para entender cómo funcionan los estados, los avisos y el panel de detalles.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Columna de la Tarjeta (Demo) */}
                <div className="lg:col-span-5 flex justify-center sticky top-24">
                    <div className="w-full max-w-[320px]">
                        <MateriaCard 
                            materia={materiaDemo}
                            estado={estado}
                            detalles={detalles}
                            actualizarEstados={handleCambioEstado}
                            abrirInfo={() => setIsDetailOpen(true)}
                        />
                        <div className="mt-4 flex justify-center">
                            <i className="fa-solid fa-arrow-pointer text-secondary animate-bounce text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Columna de Explicación */}
                <div className="lg:col-span-7 space-y-6">
                    <section>
                        <h4 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
                            <i className="fa-solid fa-list-check text-primary" />
                            Gestión de Estados
                        </h4>
                        <p className="text-sm text-foreground/70 leading-relaxed">
                            Al hacer <b>clic en la tarjeta</b>, se abrirá un menú con los estados posibles. Al seleccionar uno, la tarjeta cambiará su color e ícono. 
                        </p>
                    </section>

                    <section className="bg-default-100 p-5 rounded-3xl border border-default-200">
                        <h4 className="text-sm font-black text-default-500 uppercase tracking-widest mb-4">Guía de Indicadores</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Chip size="sm" color="danger" variant="flat" className="animate-pulse">Falta Info</Chip>
                                    <span className="text-xs font-bold text-foreground/80">Vacío total</span>
                                </div>
                                <p className="text-[11px] text-foreground/60 leading-tight">Aparece en Regular si no cargaste ni año ni nota.</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Chip size="sm" color="danger" variant="flat" className="animate-pulse">Falta Nota</Chip>
                                    <span className="text-xs font-bold text-foreground/80">Nota pendiente</span>
                                </div>
                                <p className="text-[11px] text-foreground/60 leading-tight">Falta la nota de cursada o el examen final.</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Chip size="sm" color="warning" variant="dot">Vence: Jul 2027</Chip>
                                </div>
                                <p className="text-[11px] text-foreground/60 leading-tight">El sistema calcula automáticamente cuándo vence tu regularidad por tiempo.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
                            <i className="fa-solid fa-circle-info text-primary" />
                            Panel de Detalles
                        </h4>
                        <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                            Dentro del panel de detalles (botón "Detalles"), podrás gestionar el historial completo:
                        </p>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-xs text-foreground/70">
                                <i className="fa-solid fa-calendar-check text-secondary shrink-0" />
                                <span><b>Año y Nota:</b> Registrá cuándo regularizaste/aprobaste y con qué nota.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-foreground/70">
                                <i className="fa-solid fa-list-ol text-secondary shrink-0" />
                                <span><b>Historial:</b> Llevá la cuenta de tus intentos de final (fechas y notas).</span>
                            </li>
                            <li className="flex gap-3 text-xs text-foreground/70">
                                <i className="fa-solid fa-diagram-project text-secondary shrink-0" />
                                <span><b>Correlativas:</b> Revisá qué necesitás para cursar (solo visible si no está finalizada).</span>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>

            {/* Modal de Detalles para la Demo */}
            <DetalleMateriaModal 
                isOpen={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                infoMateria={materiaDemo}
                materias={mockMaterias}
                progreso={mockProgreso}
                progresoDetalles={{ "99001": detalles }}
                setProgresoDetalles={handleUpdateDetalles}
                plan="DEMO"
                cambioDeEstado={handleCambioEstado}
            />
        </div>
    );
}
