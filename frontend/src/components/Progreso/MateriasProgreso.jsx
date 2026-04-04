import { Card, CardBody } from '@heroui/card'
import { CircularProgress, useDisclosure } from '@heroui/react'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 mb-6">
            {stats.map((stat, index) => {
                const porcentaje = Math.round(calcularPorcentaje(stat.count))
                // Mapeo estático necesario para Tailwind (evita tree shaking de clases dinámicas)
                const textColors = {
                    primary: "text-primary",
                    warning: "text-warning",
                    success: "text-success",
                    default: "text-default-500"
                }
                const textColorClass = textColors[stat.color] || "text-default-500"
                
                return (
                    <Card
                        isPressable
                        key={index}
                        className="bg-content2/50 border border-default-200/50 hover:border-default-300 transition-colors duration-200 shadow-none w-full"
                        onPress={() => handleClick(stat.estado, stat.label)}
                    >
                        <CardBody className="py-3 px-4 flex flex-row items-center gap-4 overflow-visible">
                            {/* Anillo de progreso visual circular */}
                            <CircularProgress
                                value={porcentaje}
                                size="lg"
                                color={stat.color}
                                showValueLabel={false}
                                aria-label={`Progreso circular ${stat.label}`}
                                classNames={{
                                    svg: "w-10 h-10 drop-shadow-sm",
                                    track: "stroke-default-200/50",
                                }}
                            />

                            <div className="flex flex-col text-left">
                                <span className="text-sm font-bold text-foreground leading-tight tracking-wide">{stat.label}</span>
                                <span className={`text-sm font-black ${textColorClass}`}>
                                    {porcentaje}%
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                )
            })}

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