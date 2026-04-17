import React from 'react'
import { Card, CardBody, Chip } from '@heroui/react'

export default function ProgresoHelp() {
    return (
        <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sección Principal */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Seguimiento Académico</h3>
                        <p className="text-foreground/70 leading-relaxed">
                            La sección de <b>Mi Progreso</b> es tu tablero central. Aquí podés ver el estado de cada materia y cómo avanzás en tu carrera de forma visual.
                        </p>
                    </div>

                    <Card className="bg-primary/5 border-none shadow-none">
                        <CardBody className="p-4 flex flex-row gap-4 items-start">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <i className="fa-solid fa-graduation-cap text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Estados de Materia</h4>
                                <p className="text-sm text-foreground/60">
                                    Cambiá entre <b>Libre</b>, <b>Regular</b> <b>Aprobada</b> o <b>Promocionada</b> para ver cómo se actualiza tu porcentaje de carrera.
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <div className="space-y-4 mt-8">
                        <h4 className="text-xl font-bold flex items-center gap-2">
                            <i className="fa-solid fa-clock-rotate-left text-primary"></i>
                            Notas e Historial
                        </h4>
                        <p className="text-foreground/70">
                            No solo podés marcar materias; podés llevar un registro detallado de tu desempeño académico:
                        </p>
                        
                        <ul className="space-y-4">
                            <li className="flex gap-3 items-start">
                                <div className="mt-1 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-check text-[10px] text-success font-bold"></i>
                                </div>
                                <div>
                                    <span className="font-bold">Promedio de Cursada:</span>
                                    <p className="text-sm text-foreground/60">Registrá con qué nota regularizaste para tener un seguimiento de tu rendimiento en clase.</p>
                                </div>
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="mt-1 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-check text-[10px] text-success font-bold"></i>
                                </div>
                                <div>
                                    <span className="font-bold">Intentos de Finales:</span>
                                    <p className="text-sm text-foreground/60">Anotá cada vez que te presentaste a rendir, la fecha y la nota obtenida, manteniendo un historial de tus intentos.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Sección de Regularidad */}
                <div className="space-y-6">
                    <div className="p-6 bg-default-100 rounded-3xl border border-default-200">
                        <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-hourglass-half text-warning"></i>
                            Vencimientos de Regularidad
                        </h4>
                        <p className="text-foreground/70 mb-6">
                            El sistema calcula automáticamente cuánto tiempo te queda antes de perder la condición de alumno regular en cada materia.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-background rounded-2xl border border-default-200">
                                <span className="text-sm font-medium">Cuatrimestres restantes</span>
                                <Chip size="sm" color="warning" variant="flat" className="font-bold">2 restantes</Chip>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-background rounded-2xl border border-default-200">
                                <span className="text-sm font-medium">Instancias de final</span>
                                <Chip size="sm" color="danger" variant="flat" className="font-bold">1 intento más</Chip>
                            </div>
                        </div>
                        
                        <p className="text-xs text-foreground/50 mt-4 italic">
                            * Los cálculos se basan en el régimen de la Universidad (5 cuatrimestres de regularidad y 5 instancias de examen final).
                        </p>
                    </div>

                    <Card className="border-none shadow-lg bg-linear-to-br from-primary to-primary-600 text-white">
                        <CardBody className="p-6">
                            <h4 className="font-bold text-lg mb-2">Tip de organización</h4>
                            <p className="text-sm opacity-90 leading-relaxed">
                                Usá los filtros de <b>"Aprobadas"</b> o <b>"Pendientes"</b> para enfocarte en lo que te falta y planificar mejor tus próximos finales.
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    )
}
