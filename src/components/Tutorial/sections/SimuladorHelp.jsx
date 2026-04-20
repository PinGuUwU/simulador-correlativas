import React from 'react'
import { Card, CardBody, Button } from '@heroui/react'

export default function SimuladorHelp() {
    return (
        <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lógica del Simulador */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Planificá tu Futuro</h3>
                        <p className="text-foreground/70 leading-relaxed">
                            El <b>Simulador</b> te permite proyectar cómo serían tus próximos cuatrimestres sin afectar tu progreso real. Es ideal para organizar qué materias cursar y en qué orden.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-default-100 rounded-2xl border border-default-200">
                            <div className="shrink-0 w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary">
                                <i className="fa-solid fa-layer-group"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wider text-secondary">Correlatividades Automáticas</h4>
                                <p className="text-sm text-foreground/60 mt-1">
                                    Al cursar/no cursar una materia en el simulador, el sistema desbloquea (o bloquea) automáticamente las que podés cursar en el siguiente cuatrimestre.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 bg-default-100 rounded-2xl border border-default-200">
                            <div className="shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                                <i className="fa-solid fa-forward-step"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wider text-primary">Avance por Cuatrimestre</h4>
                                <p className="text-sm text-foreground/60 mt-1">
                                    Podés simular el paso del tiempo. Organizá tus materias por "paquetes" cuatrimestrales, avanzá para ver tu evolución y saber en qué año te egresarías.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exportación y Resultados */}
                <div className="space-y-6">
                    <Card className="bg-default-100 border-none shadow-none p-2">
                        <CardBody className="space-y-4">
                            <h4 className="text-lg font-bold flex items-center gap-2">
                                <i className="fa-solid fa-file-pdf text-danger"></i>
                                Exportar tu Plan
                            </h4>
                            <p className="text-sm text-foreground/70">
                                Una vez que terminás de simular tu camino ideal, podés descargar un documento <b>PDF</b> con todo tu cronograma planificado.
                            </p>
                            <div className="p-4 bg-background rounded-xl border border-dashed border-default-300 flex items-center justify-center">
                                <Button 
                                    size="sm" 
                                    color="danger" 
                                    variant="flat" 
                                    startContent={<i className="fa-solid fa-download"></i>}
                                    className="font-bold"
                                >
                                    Simulación_Plan.pdf
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    <div className="p-6 bg-linear-to-br from-secondary/10 to-primary/10 rounded-3xl border border-primary/20">
                        <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-list-check text-primary"></i>
                            Historial de Simulación
                        </h4>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                            Mantené un registro de cada paso. El simulador guarda un historial de qué materias aprobaste en cada cuatrimestre simulado para que no pierdas el hilo de tu estrategia.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
