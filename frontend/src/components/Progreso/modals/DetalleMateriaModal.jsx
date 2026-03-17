import { Card, CardFooter, CardHeader, Chip, Divider, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@heroui/react";
import materiasUtils from "../../../utils/Progreso/materiasUtils";

function DetalleMateriaModal({ isOpen, infoMateria, materias, progreso, onOpenChange }) {
    const estiloEstado = (estado) => {
        switch (estado) {
            case "Aprobado": return "success"
            case "Disponible": return "primary"
            case "Regular": return "warning"
            case "Bloqueado": default: return "default"
        }
    }

    return (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent>
                {(onClose) => (
                    <>
                        {infoMateria ? (
                            <>
                                <DrawerHeader className="flex flex-col gap-1 pb-1">
                                    {/* Título y Divider */}
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-xl font-medium text-foreground px-1">Detalle de Materia</h3>
                                        <Divider className="my-1" />
                                    </div>

                                    {/* Contenido principal del Header (estilizado según image_2.png) */}
                                    <div className="flex flex-col px-1 pt-3">
                                        {/* 1. Ícono (libro) y Código inline */}
                                        <div className="flex items-center gap-2 text-default-500 mb-1">
                                            <i className="fa-solid fa-book-open text-base" />
                                            <span className="text-sm font-medium tracking-wide">{infoMateria.codigo}</span>
                                        </div>

                                        {/* 2. Nombre de la Materia (grande y negrita) */}
                                        <h2 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">
                                            {infoMateria.nombre}
                                        </h2>

                                        {/* 3. Badges / Estado / Info (inline) */}
                                        {/* Reutilizando tu lógica de colores de los estados anteriores */}
                                        {(() => {

                                            return (
                                                <div className="flex items-center gap-4 text-sm text-default-600 mb-5">
                                                    {/* Usamos Chip para el badge del estado */}
                                                    <Chip size="sm" color={estiloEstado(progreso[infoMateria.codigo])} variant="flat" className="capitalize font-medium">
                                                        {progreso[infoMateria.codigo]}
                                                    </Chip>
                                                    <span>{infoMateria.anio}° Año</span>
                                                    <span>Cuatrimestre {infoMateria.cuatrimestre}</span>
                                                </div>
                                            )
                                        })()}

                                        {/* 4. Sección de Descripción (recuadro redondeado) */}
                                        <div className="bg-default-50 border border-default-100 rounded-3xl p-6 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]">
                                            <h4 className="font-bold text-foreground mb-2">Descripción</h4>
                                            <p className="text-default-600 leading-relaxed text-base">
                                                {infoMateria.descripcion || "Agregarle descripción a las materias"}
                                            </p>
                                        </div>
                                    </div>
                                </DrawerHeader>
                                <DrawerBody>
                                    <div>
                                        <p>
                                            Materias Correlativas
                                        </p>
                                        {/* Mapear correlativas con estado disponible */}
                                        <div className='py-2'>

                                            {infoMateria && (() => {
                                                const materiasCorrelativas = materiasUtils.buscarMateriasCorrelativas(infoMateria.correlativas, materias, progreso)
                                                if (materiasCorrelativas.length > 0) {
                                                    return (
                                                        <div >

                                                            {
                                                                materiasCorrelativas.length > 0 &&
                                                                materiasCorrelativas.map((m, index) => {
                                                                    const estilo = materiasUtils.obtenerEstiloPorEstado(progreso[m.codigo])
                                                                    return (
                                                                        <Card className='mb-3 border-2 border-default-200' key={index}>
                                                                            <CardHeader>
                                                                                <div className='flex justify-between items-center w-full'>
                                                                                    <div className="font-semibold text-default-700">
                                                                                        {m.nombre}
                                                                                    </div>

                                                                                    {/* Aquí aplicamos el ícono con los colores dinámicos */}
                                                                                    <Chip variant="flat" className="w-8 h-8" color={estiloEstado(progreso[m.codigo])}>
                                                                                        <i className={`fa-solid ${estilo.icon} ${estilo.colorText} text-sm `}></i>
                                                                                    </Chip>
                                                                                </div>
                                                                            </CardHeader>
                                                                            <CardFooter className="pt-0 flex justify-between">
                                                                                <span className={`text-xs font-bold uppercase`}>
                                                                                    {m.codigo}
                                                                                </span>
                                                                                <span>
                                                                                    <Chip color={estiloEstado(progreso[m.codigo])} variant="flat">{progreso[m.codigo]}</Chip>
                                                                                </span>
                                                                            </CardFooter>
                                                                        </Card>
                                                                    )
                                                                })
                                                            }
                                                        </div>

                                                    )
                                                } else {
                                                    return (
                                                        <div className='text-default-500 italic mt-2 bg-default-100 px-3 py-1 rounded-lg'>
                                                            No requiere correlativas previas
                                                        </div>
                                                    )
                                                }
                                            })()}
                                        </div>

                                    </div>
                                </DrawerBody>
                                <DrawerFooter>
                                    {/* Acá agregar el consejo */}
                                    <Card className='text-primary bg-primary/10 border-primary/30 border-2 p-2'>
                                        <p className='font-bold'>
                                            Consejo
                                        </p>
                                        Completa las correlativas requeridas para desbloquear esta materia.

                                    </Card>
                                </DrawerFooter>

                            </>
                        ) : <DrawerBody>Cargando contenido...</DrawerBody>}

                    </>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default DetalleMateriaModal