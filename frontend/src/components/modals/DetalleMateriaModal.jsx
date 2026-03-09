import { Card, CardFooter, CardHeader, Chip, Divider, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@heroui/react";
import materiasUtils from "../../utils/materiasUtils";

function DetalleMateriaModal({ isOpen, onOpenChange, infoMateria, materias, progreso }) {
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
                                        <h3 className="text-xl font-medium text-slate-900 px-1">Detalle de Materia</h3>
                                        <Divider className="my-1" />
                                    </div>

                                    {/* Contenido principal del Header (estilizado según image_2.png) */}
                                    <div className="flex flex-col px-1 pt-3">
                                        {/* 1. Ícono (libro) y Código inline */}
                                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                                            <i className="fa-solid fa-book-open text-base" />
                                            <span className="text-sm font-medium tracking-wide">{infoMateria.codigo}</span>
                                        </div>

                                        {/* 2. Nombre de la Materia (grande y negrita) */}
                                        <h2 className="text-4xl font-extrabold text-slate-950 mb-3 tracking-tight">
                                            {infoMateria.nombre}
                                        </h2>

                                        {/* 3. Badges / Estado / Info (inline) */}
                                        {/* Reutilizando tu lógica de colores de los estados anteriores */}
                                        {(() => {
                                            let colorChip = "default";
                                            // Asumiendo que 'progreso' y 'obtenerEstiloPorEstado' están accesibles aquí
                                            const estadoActual = progreso[infoMateria.codigo]

                                            //TODO poner esto arriba
                                            switch (estadoActual) {
                                                case "Aprobado": colorChip = "success"; break;
                                                case "Disponible": colorChip = "primary"; break;
                                                case "Regular": colorChip = "warning"; break;
                                                case "Bloqueado": default: colorChip = "default"; break;
                                            }

                                            return (
                                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-5">
                                                    {/* Usamos Chip para el badge del estado */}
                                                    <Chip size="sm" color={colorChip} variant="flat" className="capitalize font-medium">
                                                        {progreso[infoMateria.codigo]}
                                                    </Chip>
                                                    <span>{infoMateria.anio}° Año</span>
                                                    <span>Cuatrimestre {infoMateria.cuatrimestre}</span>
                                                </div>
                                            )
                                        })()}

                                        {/* 4. Sección de Descripción (recuadro gris redondeado) */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]">
                                            <h4 className="font-bold text-slate-950 mb-2">Descripción</h4>
                                            <p className="text-slate-600 leading-relaxed text-base">
                                                {infoMateria.descripcion || "Agregarle descripción a las materias"}
                                            </p>
                                        </div>
                                    </div>
                                </DrawerHeader>
                                <DrawerBody>
                                    <div>
                                        <p>
                                            Correlativas para cursar
                                        </p>
                                        {/* Mapear correlativas con estado disponible */}
                                        <div className='py-2'>

                                            {infoMateria && (() => {
                                                const materiasDisponibles = materiaUtils.buscarMateriasCorrelativasDisponibles(infoMateria.correlativas, materias, progreso)
                                                if (materiasDisponibles.length > 0) {
                                                    return (
                                                        < div >

                                                            {
                                                                materiasDisponibles.length > 0 &&
                                                                materiasDisponibles.map((m, index) => {
                                                                    const estilo = materiaUtils.obtenerEstiloPorEstado(progreso[m.codigo])
                                                                    return (
                                                                        <Card className='mb-3 border-2 border-gray-200' key={index}>
                                                                            <CardHeader>
                                                                                <div className='flex justify-between items-center w-full'>
                                                                                    <div className="font-semibold text-slate-700">
                                                                                        {m.nombre}
                                                                                    </div>

                                                                                    {/* Aquí aplicamos el ícono con los colores dinámicos */}
                                                                                    <div className={`
                                                                                                flex items-center justify-center
                                                                                                w-8 h-8 rounded-full border-2 bg-slate-900
                                                                                                border-${estilo.accent}-400/50 
                                                                                                shadow-[0_0_10px_rgba(var(--tw-shadow-color),0.4)]
                                                                                                shadow-${estilo.accent}-400/30
                                                                                            `}>
                                                                                        <i className={`fa-solid ${estilo.icon} text-${estilo.accent}-400 text-sm`}></i>
                                                                                    </div>
                                                                                </div>
                                                                            </CardHeader>
                                                                            <CardFooter className="pt-0">
                                                                                <span className={`text-xs font-bold uppercase ${estilo.colorText}`}>
                                                                                    {m.codigo}
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
                                                        <div className='text-slate-500 italic mt-2 bg-gray-100 px-3 py-1 rounded-lg'>
                                                            No requiere correlativas previas
                                                        </div>
                                                    )
                                                }
                                            })()}
                                        </div>

                                    </div>
                                    <div>
                                        Correlativas para rendir examen final
                                        {/* mapear correlativas con estado regular */}
                                        {infoMateria && (() => {
                                            const materiasRegulares = materiaUtils.buscarMateriasCorrelativasRegulares(infoMateria.correlativas, materias, progreso)

                                            if (materiasRegulares.length > 0) {
                                                return (
                                                    <div>
                                                        {
                                                            materiasRegulares.map((m, index) => {
                                                                const estilo = materiaUtils.obtenerEstiloPorEstado(progreso[m.codigo])
                                                                return (
                                                                    <Card className='mb-3 border-2 border-gray-200' key={index}>
                                                                        <CardHeader>
                                                                            <div className='flex justify-between items-center w-full'>
                                                                                <div className="font-semibold text-slate-700">
                                                                                    {m.nombre}
                                                                                </div>

                                                                                {/* Aquí aplicamos el ícono con los colores dinámicos */}
                                                                                <div className={`
                                                                                                flex items-center justify-center
                                                                                                w-8 h-8 rounded-full border-2 bg-slate-900
                                                                                                border-${estilo.accent}-400/50 
                                                                                                shadow-[0_0_10px_rgba(var(--tw-shadow-color),0.4)]
                                                                                                shadow-${estilo.accent}-400/30
                                                                                            `}>
                                                                                    <i className={`fa-solid ${estilo.icon} text-${estilo.accent}-400 text-sm`}></i>
                                                                                </div>
                                                                            </div>
                                                                        </CardHeader>
                                                                        <CardFooter className="pt-0">
                                                                            <span className={`text-xs font-bold uppercase ${estilo.colorText}`}>
                                                                                {m.codigo}
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
                                                    <div className='text-slate-500 italic mt-2 bg-gray-100 px-3 py-1 rounded-lg'>
                                                        No requiere correlativas previas
                                                    </div>
                                                )
                                            }
                                        })()}
                                    </div>
                                </DrawerBody>
                                <DrawerFooter>
                                    {/* Acá agregar el consejo */}
                                    <Card className='text-blue-900 bg-blue-100 border-blue-300 border-2 p-2'>
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