import { Card, CardFooter, CardHeader, Chip, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import DetalleMateriaModal from './DetalleMateriaModal';
import materiasUtils from '../../../utils/Progreso/materiasUtils';

function FiltroMateriasModal({ estado, materias, progreso, isOpen, onOpenChange, titulo, isDetailOpen, onDetailOpen, onDetailOpenChange, onDetailClose }) {
    const materiasFiltradas = materias.filter(m => progreso[m.codigo] === estado)
    const estiloEstado = (estado) => {
        switch (estado) {
            case "Aprobado": return "success"
            case "Promocionado": return "success"
            case "Disponible": return "primary"
            case "Regular": return "warning"
            case "Bloqueado": default: return "default"
        }
    }
    const [infoMateria, setInfoMateria] = useState()
    const handleClick = (materia) => {
        setInfoMateria(materia)
        onDetailOpen()
        window.history.pushState({ modalOpen: true }, "")
    }

    //Manejo el evento de que en celu haga para atrás, que cierre el modal y no se saque la página
    useEffect(() => {
        const handlePopState = () => {
            // Si el usuario vuelve atrás, cerramos el modal
            // (Asegúrate de tener acceso a la función que lo cierra aquí)
            onDetailClose()
        }

        // Solo activamos el "escuchador" si el modal está abierto
        if (isDetailOpen) {
            window.addEventListener("popstate", handlePopState)
        }

        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [isDetailOpen, onDetailClose])
    return (
        <div>

            <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader>
                                Materias {titulo}
                            </DrawerHeader>
                            <DrawerBody>
                                {materiasFiltradas && (() => {
                                    if (materiasFiltradas.length > 0) {
                                        return (
                                            <div >

                                                {
                                                    materiasFiltradas.length > 0 &&
                                                    materiasFiltradas.map((m, index) => {
                                                        const estilo = materiasUtils.obtenerEstiloPorEstado(estado)
                                                        return (
                                                            <Card className='mb-3 border-2 border-default-200 w-full' key={index}
                                                                isPressable onPress={() => handleClick(m)}>
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
                                        let emptyText = "No hay materias en este estado."
                                        switch (estado) {
                                            case "Aprobado":
                                                emptyText = "Aún no tenés materias aprobadas."
                                                break
                                            case "Disponible":
                                                emptyText = "No hay materias disponibles para cursar en esta sección."
                                                break
                                            case "Regular":
                                                emptyText = "No tenés materias regulares (pendientes de final)."
                                                break
                                            case "Promocionado":
                                                emptyText = "No tenés materias promocionadas aún."
                                                break
                                            case "Bloqueado":
                                                emptyText = "¡Excelente! No tenés materias bloqueadas."
                                                break
                                        }

                                        return (
                                            <div className='text-default-500 italic mt-4 text-center py-6 bg-default-50/50 border border-default-100 rounded-xl'>
                                                {emptyText}
                                            </div>
                                        )
                                    }
                                })()}
                            </DrawerBody>
                            <DrawerFooter>

                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>

            <DetalleMateriaModal
                isOpen={isDetailOpen}
                onOpen={onDetailOpen}
                onOpenChange={onDetailOpenChange}
                materias={materias}
                progreso={progreso}
                infoMateria={infoMateria}
            />
        </div>
    )
}

export default FiltroMateriasModal