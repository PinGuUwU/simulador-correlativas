import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Button, Popover, PopoverContent, PopoverTrigger, Progress, useDisclosure } from '@heroui/react'
import React, { useState } from 'react'
import FiltroMateriasModal from './modals/FiltroMateriasModal'

function MateriasProgreso({ progreso, materias }) {
    const [seleccionada, setSeleccionada] = useState()
    // 1. Cálculos de datos (Lógica optimizada)
    const materiasTotales = materias.length
    const stats = [
        {
            label: "Disponibles",
            estado: "Disponible",
            count: materias.filter(m => progreso[m.codigo] === "Disponible").length,
            color: "primary",
            icon: "fa-solid fa-unlock",
            accent: "bg-primary-300 border-primary-400/50 shadow-primary",
            tittle: "Materias disponibles",
            text: "Son las materias que podes cursar en el cuatrimestre correspondiente",
            bg: "bg-primary/5"
        },
        {
            label: "Regulares",
            estado: "Regular",
            count: materias.filter(m => progreso[m.codigo] === "Regular").length,
            color: "warning",
            icon: "fa-regular fa-clock",
            accent: "bg-warning-300 border-warning-400/50 shadow-warning",
            tittle: "Materias regulares",
            text: "Tenes que rendir exámen final",
            bg: "bg-warning-50/50"
        },
        {
            label: "Aprobadas",
            estado: "Aprobado",
            count: materias.filter(m => progreso[m.codigo] === "Aprobado").length,
            color: "success",
            icon: "fa-regular fa-circle-check",
            accent: "bg-success-300 border-success-400/50 shadow-success",
            tittle: "Materias aprobadas",
            text: "Un peso menos",
            bg: "bg-success-50/50"
        },
        {
            label: "Bloqueadas",
            estado: "Bloqueado",
            count: materias.filter(m => progreso[m.codigo] === "Bloqueado").length,
            color: "default",
            icon: "fa-solid fa-lock",
            accent: "bg-default-300 border-default-400/50 shadow-default",
            tittle: "Materias bloqueadas",
            text: "Tenes que regularizar las materias correlativas para cursarlas",
            bg: "bg-default-50/50"
        }
    ]

    const calcularPorcentaje = (cant) => (materiasTotales > 0 ? (cant * 100) / materiasTotales : 0)
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const {
        isOpen: isDetailOpen,
        onOpen: onDetailOpen,
        onOpenChange: onDetailOpenChange,
        onClose: onDetailClose
    } = useDisclosure()
    const [titulo, setTitulo] = useState()
    const handleClick = (estado, titulo) => {
        setSeleccionada(estado)
        setTitulo(titulo)
        onOpen()

        // Agrego una entrada al historial para que el botón "atrás" cierre el modal
        window.history.pushState({ modalOpen: true }, "")
    }

    // Manejo el evento de que en celu haga para atrás, que cierre el modal y no se salga de la página
    React.useEffect(() => {
        const handlePopState = () => {
            // Si el usuario vuelve atrás, cerramos el modal
            onOpenChange(false)
        }

        // Solo activamos el "escuchador" si el modal está abierto
        if (isOpen) {
            window.addEventListener("popstate", handlePopState)
        }

        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [isOpen, onOpenChange])

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
            {stats.map((stat, index) => (
                <Card
                    isPressable
                    key={index}
                    className={`${stat.accent} cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300 ${stat.bg}`}
                    onClick={() => handleClick(stat.estado, stat.label)}
                >
                    <CardHeader className="pb-0 pt-4 px-5 items-center flex justify-between text-center">
                        <p className="text-tiny uppercase font-bold text-default-600 tracking-wider">
                            {stat.label}
                        </p>
                    </CardHeader>

                    <CardBody className="py-4 px-5 flex flex-row items-center justify-between overflow-visible">
                        <p className="font-black text-4xl text-default-800">
                            {stat.count}
                        </p>

                        {/* Contenedor del Icono Estilo "Neon" del prototipo */}
                        <div className={`${stat.accent} flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-[0_0_15px_rgba(var(--tw-shadow-color),0.4)]`}>
                            <i className={`${stat.icon} text-lg`}></i>
                        </div>
                    </CardBody>

                    <CardFooter className="px-5 pb-5">
                        <div className="flex flex-col w-full gap-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-default-600 uppercase">
                                <span>Avance</span>
                                <span>{Math.round(calcularPorcentaje(stat.count))}%</span>
                            </div>
                            <Progress
                                aria-label={`Progreso ${stat.label}`}
                                color={stat.color}
                                size="sm"
                                value={calcularPorcentaje(stat.count)}
                                className="max-w-md"
                            />
                        </div>
                    </CardFooter>
                </Card>
            ))}

            <FiltroMateriasModal
                estado={seleccionada}
                materias={materias}
                progreso={progreso}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                titulo={titulo}
                isDetailOpen={isDetailOpen}
                onDetailOpen={onDetailOpen}
                onDetailOpenChange={onDetailOpenChange}
                onDetailClose={onDetailClose}
            />
        </div>
    )
}

export default MateriasProgreso