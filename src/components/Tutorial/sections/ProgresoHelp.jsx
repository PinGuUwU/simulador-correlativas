import React from 'react'
import { Card, CardBody, Divider } from '@heroui/react'
import InteractiveMateriaDemo from './InteractiveMateriaDemo'

export default function ProgresoHelp() {
    return (
        <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda - Funcionalidades Principales */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Tu Tablero Académico</h3>
                        <p className="text-foreground/70 leading-relaxed">
                            La sección de <b>Mi Progreso</b> es tu centro de control. Aquí podés ver el estado de cada materia, registrar tus notas, controlar la validez de tu regularidad y mucho más.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-primary/5 border-none shadow-none">
                            <CardBody className="p-4 flex flex-col gap-2 items-start">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary mb-2">
                                    <i className="fa-solid fa-graduation-cap text-xl"></i>
                                </div>
                                <h4 className="font-bold text-foreground">Estados de Materia</h4>
                                <p className="text-sm text-foreground/60">
                                    Cambiá entre <b>Libre</b>, <b>Regular</b>, <b>Aprobada</b> o <b>Promocionada</b> para ver cómo se actualiza tu carrera.
                                </p>
                            </CardBody>
                        </Card>
                        <Card className="bg-default-100 border-none shadow-none">
                            <CardBody className="p-4 flex flex-col gap-2 items-start">
                                <div className="p-3 bg-default-200 rounded-xl text-foreground/80 mb-2">
                                    <i className="fa-solid fa-clock-rotate-left text-xl"></i>
                                </div>
                                <h4 className="font-bold text-foreground">Notas e Historial</h4>
                                <p className="text-sm text-foreground/60">
                                    Registrá tus notas de finales, cursadas y mantené un historial de tu desempeño.
                                </p>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Nueva utilidad: Filtro por estado */}
                    <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                        <h4 className="font-bold text-foreground flex items-center gap-2 mb-3">
                            <i className="fa-solid fa-filter text-primary" />
                            Resumen e Interacción
                        </h4>
                        <p className="text-sm text-foreground/70 leading-relaxed">
                            Las tarjetas superiores (Disponibles, Regulares, etc.) no son solo informativas:
                            <b> si haces clic en ellas</b>, se abrirá un panel con el listado detallado de todas las materias que tienen ese estado.
                            Esto te permite revisar rápidamente qué te falta o qué tenés pendiente sin navegar por toda la lista.
                        </p>
                    </div>

                    {/* Tip para avanzados */}
                    <Card className="bg-gradient-to-br from-secondary/10 to-primary/10 border-none shadow-none">
                        <CardBody className="p-6 flex flex-col sm:flex-row gap-5 items-center">
                            <div className="p-4 bg-background/50 rounded-2xl text-secondary shadow-sm shrink-0">
                                <i className="fa-solid fa-wand-magic-sparkles text-2xl"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-lg mb-1">¡Tip para avanzados!</h4>
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    ¿Ya tenés muchas materias hechas? No hace falta marcar una por una.
                                    Si marcás tus <b>últimas materias</b> aprobadas, regulares o promocionadas, el sistema <b>actualizará automáticamente</b> todas sus correlativas previas en cascada.
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Columna Derecha - Sincronización */}
                <div className="p-6 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 flex flex-col justify-center">
                    <div className="mb-4">
                        <i className="fa-solid fa-cloud text-3xl opacity-80"></i>
                    </div>
                    <h4 className="font-bold text-2xl mb-4">Sincronización Manual</h4>
                    <p className="text-sm leading-relaxed mb-6">
                        Tus datos se guardan **localmente**. Para llevarlos a otro dispositivo o hacer un backup, usá los botones de la página de Progreso:
                    </p>
                    <ul className="space-y-4 text-sm">
                        <li className="flex gap-3 items-center">
                            <i className="fa-solid fa-cloud-arrow-up w-5"></i>
                            <div>
                                <span className="font-bold">Guardar:</span>
                                <p>Sube tus cambios actuales a tu cuenta.</p>
                            </div>
                        </li>
                        <li className="flex gap-3 items-center">
                            <i className="fa-solid fa-cloud-arrow-down w-5"></i>
                            <div>
                                <span className="font-bold">Cargar:</span>
                                <p>Reemplaza lo local con tu última copia guardada.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <Divider className="my-12 opacity-50" />

            {/* Demo Interactiva */}
            <InteractiveMateriaDemo />
        </div>
    )
}
