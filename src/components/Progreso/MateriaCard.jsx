import { Card, CardHeader, CardBody, CardFooter, Chip, Popover, PopoverTrigger, PopoverContent, Button, Divider } from "@heroui/react"
import { useState } from "react";
import estadoUtils from "../../utils/Progreso/estadoUtils";
import regularidadUtils from "../../utils/Progreso/regularidadUtils";

function MateriaCard({ materia, estado, detalles, actualizarEstados, abrirInfo, vista = 'grid' }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!estado) return <p>Cargando Materia...</p>
    const { codigo, correlativas, nombre, anio, cuatrimestre, horas_totales, horas_semanales } = materia;

    const config = estadoUtils.ESTADO_CONFIG[estado] || estadoUtils.ESTADO_CONFIG["Disponible"];

    const handleAction = (actionType, arg) => {
        setIsOpen(false); // Cerramos el popover automáticamente
        if (actionType === 'estado') {
            actualizarEstados(arg);
        } else if (actionType === 'detalles') {
            abrirInfo(arg);
        }
    };

    const cardContent = (
        <Card
            isPressable={false}
            className={`w-full border transition-all duration-300 font-medium ${config.estilo} ${vista === 'list' ? 'flex-row items-center justify-between p-2 h-auto' : ''} ${estado === 'Bloqueado' ? 'opacity-60 grayscale-[0.2]' : ''} ${estado === 'Cursando' ? 'shadow-[0_0_14px_3px_rgba(99,102,241,0.30)] border-indigo-400/80' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}
        >
            <CardHeader className={`flex justify-between shrink-0 ${vista === 'list' ? 'w-auto gap-4 p-2' : ''}`}>
                <Chip color={config.color} variant="flat">
                    <i className={config.icono} />
                </Chip>
                <Chip color={config.color} variant="flat">
                    <span className="font-bold">{estado}</span>
                </Chip>
                
                {/* Indicadores de falta de información */}
                {estado === 'Regular' && !detalles?.fechaRegularidad && !detalles?.notaRegularizacion && (
                    <Chip color="danger" variant="flat" size="sm" className="animate-pulse">
                        <i className="fa-solid fa-circle-exclamation mr-1" />
                        Falta Info
                    </Chip>
                )}
                {estado === 'Regular' && !detalles?.fechaRegularidad && detalles?.notaRegularizacion && (
                    <Chip color="danger" variant="flat" size="sm" className="animate-pulse">
                        <i className="fa-solid fa-calendar-circle-exclamation mr-1" />
                        Falta Año
                    </Chip>
                )}
                {estado === 'Regular' && detalles?.fechaRegularidad && !detalles?.notaRegularizacion && (
                    <Chip color="danger" variant="flat" size="sm" className="animate-pulse">
                        <i className="fa-solid fa-pen-to-square mr-1" />
                        Falta Nota
                    </Chip>
                )}

                {(estado === 'Aprobado' || estado === 'Promocionado') && !detalles?.notaFinal && (
                    <Chip color="danger" variant="flat" size="sm" className="animate-pulse">
                        <i className="fa-solid fa-pen-to-square mr-1" />
                        Falta Nota
                    </Chip>
                )}

                {estado === 'Regular' && detalles?.fechaRegularidad && (
                    <Chip color="warning" variant="dot" size="sm" className="font-bold">
                        Vence: {regularidadUtils.obtenerFechaVencimientoLabel(detalles.fechaRegularidad)}
                    </Chip>
                )}
                {estado === 'Aprobado' && detalles?.intentosFinal?.some(i => i.estado === 'aprobado') && (
                    <Chip color="success" variant="dot" size="sm" className="font-bold">
                        Aprobada en: {detalles.intentosFinal.find(i => i.estado === 'aprobado').fecha?.split("-")[0] || 'S/F'}
                    </Chip>
                )}
            </CardHeader>

            <CardBody className={`${vista === 'list' ? 'flex-row items-center flex-1 justify-between p-2 overflow-hidden gap-4' : ''}`}>
                <div className={`text-foreground font-extrabold ${vista === 'list' ? 'w-16 shrink-0' : ''}`}>{codigo}</div>
                <div className={`truncate text-foreground font-black tracking-tight ${vista === 'list' ? 'flex-1 pr-4' : ''}`} title={nombre}>
                    {nombre}
                </div>
                <div className={`gap-2 flex flex-col ${vista === 'list' ? 'shrink-0' : ''}`}>
                    <Chip color={config.color} variant="dot">
                        Horas semanales: {horas_semanales}
                    </Chip>
                    <Chip color={config.color} variant="dot">
                        Horas totales: {horas_totales}
                    </Chip>
                </div>
            </CardBody>

            <CardFooter className={`shrink-0 ${vista === 'list' ? 'w-auto p-2 justify-end' : ''}`}>
                <span className={`text-foreground font-bold ${vista === 'list' ? 'text-xs' : 'text-sm'}`}>
                    {anio}° Año • C{Number(cuatrimestre)}
                </span>
            </CardFooter>
        </Card>
    );

    return (
        <Popover placement="bottom" showArrow={true} className="w-full max-w-[280px]" isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <PopoverTrigger>
                <div role="button" aria-label="Cambiar estado" className="w-full cursor-pointer hover:scale-[1.02] transition-transform">
                    {cardContent}
                </div>
            </PopoverTrigger>
            <PopoverContent>
                <div className="px-2 py-3 w-full flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-gear text-default-500"></i>
                        <span className="text-small font-bold">Cambiar Estado</span>
                    </div>
                    <Divider />

                    {estado === "Bloqueado" && (
                        <div className="bg-warning/10 border border-warning/30 rounded-lg p-2 text-xs text-warning-700 font-medium mb-1">
                            <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                            Esta materia requiere correlativas. Al marcarla, se aprobarán/regularizarán sus dependencias automáticamente.
                        </div>
                    )}

                    <div className="flex flex-col gap-2 w-full mt-1">
                        {/* Solo mostrar Cursando si está Disponible o Bloqueado */}
                        {(estado === 'Disponible' || estado === 'Bloqueado') && (
                            <Button size="sm" color="secondary" variant="flat" className="justify-start font-bold" startContent={<i className="fa-solid fa-pencil w-4" />} onPress={() => handleAction('estado', 'Cursando')}>
                                Cursando
                            </Button>
                        )}
                        {/* Desde Cursando hacia Regular */}
                        {estado !== 'Aprobado' && (
                            <Button size="sm" color="warning" variant="flat" className="justify-start font-bold" startContent={<i className="fa-solid fa-clock w-4" />} onPress={() => handleAction('estado', 'Regular')}>
                                Regular
                            </Button>
                        )}
                        <Button size="sm" color="success" variant="flat" className="justify-start font-bold" startContent={<i className="fa-solid fa-check w-4" />} onPress={() => handleAction('estado', 'Aprobado')}>
                            Aprobado
                        </Button>
                        <Button size="sm" color="success" variant="flat" className="justify-start font-bold" startContent={<i className="fa-solid fa-ranking-star w-4" />} onPress={() => handleAction('estado', 'Promocionado')}>
                            Promocionado
                        </Button>
                        <Divider className="my-1" />
                        <Button size="sm" color="default" variant="flat" className="justify-start font-bold" startContent={<i className="fa-solid fa-circle-info w-4" />} onPress={() => handleAction('detalles', materia)}>
                            Detalles
                        </Button>
                        <Button size="sm" color="danger" variant="flat" className="justify-start font-bold" startContent={<i className="fa-solid fa-rotate-left w-4" />} onPress={() => handleAction('estado', 'Reiniciar')}>
                            Reiniciar Estado
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default MateriaCard;