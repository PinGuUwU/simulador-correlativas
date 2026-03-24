import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Button, Chip, Popover, PopoverContent, PopoverTrigger, Progress, useDisclosure } from '@heroui/react'
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
            horas_semanales: materias.filter(m => progreso[m.codigo] === "Disponible")
                .reduce((acumulador, materia) => {
                    const horas = Number(materia.horas_semanales) || 0
                    return acumulador + horas
                }, 0),
            horas_totales: materias.filter(m => progreso[m.codigo] === "Disponible")
                .reduce((acumulador, materia) => {
                    const horas = Number(materia.horas_totales) || 0
                    return acumulador + horas
                }, 0),
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
            horas_semanales: materias.filter(m => progreso[m.codigo] === "Regular")
                .reduce((acumulador, materia) => {
                    const horas = Number(materia.horas_semanales) || 0
                    return acumulador + horas
                }, 0),
            horas_totales: materias.filter(m => progreso[m.codigo] === "Regular")
                .reduce((acumulador, materia) => {
                    const horas = Number(materia.horas_totales) || 0
                    return acumulador + horas
                }, 0),
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
            horas_semanales: materias.filter(m => progreso[m.codigo] === "Aprobado")
                .reduce((acumulador, materia) => {
                    const horas = Number(materia.horas_semanales) || 0
                    return acumulador + horas
                }, 0),
            horas_totales: materias.filter(m => progreso[m.codigo] === "Aprobado")
                .reduce((acumulador, materia) => {
                    const horas = Number(materia.horas_totales) || 0
                    return acumulador + horas
                }, 0),
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
            horas_semanales: materias.filter(m => progreso[m.codigo] === "Bloqueado")
                .reduce((acumulador, materia) => {
                    const horas = Number(materia.horas_semanales) || 0
                    return acumulador + horas
                }, 0),
            horas_totales: materias.filter(m => progreso[m.codigo] === "Bloqueado")
                .reduce((acumulador, materia) => {
                    const horas = Number(materia.horas_totales) || 0
                    return acumulador + horas
                }, 0),
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
            // Si el modal de detalle está abierto, no cerrarmos el filtro (lo maneja su propio listener)
            if (!isDetailOpen) {
                onOpenChange(false)
            }
        }

        // Solo activamos el "escuchador" si el modal está abierto
        if (isOpen) {
            window.addEventListener("popstate", handlePopState)
        }

        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [isOpen, onOpenChange, isDetailOpen])

    return (
        <div className="grid grid-cols-1 min-[768px]:grid-cols-2 xl:grid-cols-4 gap-6 my-8">
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
                        <div className="flex flex-col md:text-start max-[768px]:text-center max-[768px]:w-full">
                            <p className="font-black  md:text-4xl text-default-800">
                                {stat.count}
                            </p>

                            <div className='text-center'>
                                <Chip
                                    color={`${stat.color}`}
                                    variant={`flat`}
                                >
                                    Horas totales: {stat.horas_totales}
                                </Chip>
                            </div>
                        </div>

                        {/* Contenedor del Icono Estilo "Neon" del prototipo */}
                        <div className={`${stat.accent}  hidden min-[768px]:flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 shadow-[0_0_15px_rgba(var(--tw-shadow-color),0.4)]`}>
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