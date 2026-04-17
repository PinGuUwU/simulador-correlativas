import { Card, CardBody } from '@heroui/card'
import { CircularProgress, useDisclosure } from '@heroui/react'
import React, { useEffect, useState } from 'react'
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

    const horasTotalesCarrera = materias.reduce((acc, m) => acc + (Number(m.horas_totales) || 0), 0)
    const horasConsumidas = materias.reduce((acc, m) => {
        const estado = progreso[m.codigo];
        if (["Aprobado", "Regular", "Cursando"].includes(estado)) {
            return acc + (Number(m.horas_totales) || 0);
        }
        return acc;
    }, 0);

    const resumenStats = [
        {
            label: "Total Materias",
            value: materiasTotales,
            sublabel: "asignaturas",
            icon: "fa-solid fa-book-bookmark",
            color: "secondary"
        },
        {
            label: "Carga Horaria",
            value: horasConsumidas,
            sublabel: `/ ${horasTotalesCarrera} hs`,
            icon: "fa-solid fa-clock-rotate-left",
            color: "danger"
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

        window.history.pushState({ modalOpen: true }, "")
    }

    useEffect(() => {
        const handlePopState = () => {
            if (!isDetailOpen) {
                onOpenChange(false)
            }
        }
        if (isOpen) {
            window.addEventListener("popstate", handlePopState)
        }
        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [isOpen, onOpenChange, isDetailOpen])

    return (
        <div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mt-2 mb-6 uppercase tracking-wider">
            {stats.map((stat, index) => {
                const porcentaje = Math.round(calcularPorcentaje(stat.count))
                const textColors = {
                    primary: "text-primary",
                    warning: "text-warning",
                    success: "text-success",
                    default: "text-default-500"
                }
                const glowColors = {
                    primary: "shadow-primary/20",
                    warning: "shadow-warning/20",
                    success: "shadow-success/20",
                    default: "shadow-default-300/20"
                }
                const textColorClass = textColors[stat.color] || "text-default-500"
                const glowClass = glowColors[stat.color] || "shadow-default-300/20"

                return (
                    <Card
                        isPressable
                        key={index}
                        className={`bg-background/70 backdrop-blur-sm border border-default-200/60 hover:border-default-300/80 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${glowClass} w-full group`}
                        onPress={() => handleClick(stat.estado, stat.label)}
                    >
                        <CardBody className="py-2.5 px-3 sm:py-3 sm:px-4 flex flex-row items-center gap-3 sm:gap-4 overflow-visible">
                            <CircularProgress
                                value={porcentaje}
                                size="md"
                                color={stat.color}
                                showValueLabel={false}
                                aria-label={`Progreso circular ${stat.label}`}
                                classNames={{
                                    svg: "w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-200",
                                    track: "stroke-default-200/50",
                                }}
                            />

                            <div className="flex flex-col text-left">
                                <span className="text-[9px] sm:text-xs font-bold text-foreground/60 leading-tight">{stat.label}</span>
                                <span className={`text-xs sm:text-base font-black ${textColorClass} tabular-nums`}>
                                    {porcentaje}%
                                </span>
                                <span className="text-[8px] sm:text-[9px] font-bold text-foreground/40 tabular-nums">{stat.count} mat.</span>
                            </div>
                        </CardBody>
                    </Card>
                )
            })}

            {/* Tarjetas de Resumen (Horas y Materias) */}
            {resumenStats.map((resumen, index) => {
                const colorMap = {
                    secondary: {
                        bg: "bg-secondary/10",
                        border: "border-secondary/25",
                        text: "text-secondary",
                        value: "text-secondary",
                        glow: "shadow-secondary/15"
                    },
                    danger: {
                        bg: "bg-danger/10",
                        border: "border-danger/25",
                        text: "text-danger",
                        value: "text-danger",
                        glow: "shadow-danger/15"
                    }
                }
                const styles = colorMap[resumen.color] || colorMap.secondary

                return (
                    <Card
                        key={`resumen-${index}`}
                        className={`bg-background/70 backdrop-blur-sm border border-default-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${styles.glow} transition-all duration-200 w-full`}
                    >
                        <CardBody className="py-2.5 px-3 sm:py-3 sm:px-4 flex flex-row items-center gap-3 sm:gap-4 overflow-visible">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${styles.bg} border ${styles.border} ${styles.text} shadow-sm`}>
                                <i className={`${resumen.icon} text-xs sm:text-base`}></i>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] sm:text-xs font-bold text-foreground/60 leading-tight">{resumen.label}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-xs sm:text-base font-black ${styles.value} tabular-nums whitespace-nowrap`}>
                                        {resumen.value}
                                    </span>
                                    <span className="text-[8px] sm:text-[9px] font-bold text-foreground/40">{resumen.sublabel}</span>
                                </div>
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