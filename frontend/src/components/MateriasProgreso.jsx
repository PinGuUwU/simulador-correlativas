import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Progress } from '@heroui/react'
import React from 'react'

function MateriasProgreso({ progreso, materias }) {
    // 1. Cálculos de datos (Lógica optimizada)
    const materiasTotales = materias.length
    const stats = [
        {
            label: "Aprobadas",
            count: materias.filter(m => progreso[m.codigo] === "Aprobado").length,
            color: "success",
            icon: "fa-check-double",
            accent: "green",
            bg: "bg-green-50/50"
        },
        {
            label: "Disponibles",
            count: materias.filter(m => progreso[m.codigo] === "Disponible").length,
            color: "primary",
            icon: "fa-unlock",
            accent: "cyan",
            bg: "bg-blue-50/50"
        },
        {
            label: "Regulares",
            count: materias.filter(m => progreso[m.codigo] === "Regular").length,
            color: "warning",
            icon: "fa-clock",
            accent: "amber",
            bg: "bg-amber-50/50"
        },
        {
            label: "Bloqueadas",
            count: materias.filter(m => progreso[m.codigo] === "Bloqueado").length,
            color: "default",
            icon: "fa-lock",
            accent: "slate",
            bg: "bg-slate-50/50"
        }
    ]

    const calcularPorcentaje = (cant) => (materiasTotales > 0 ? (cant * 100) / materiasTotales : 0)

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
            {stats.map((stat, index) => (
                <Card
                    key={index}
                    className={`border-none shadow-sm hover:shadow-md transition-shadow duration-300 ${stat.bg}`}
                >
                    <CardHeader className="pb-0 pt-4 px-5 flex-col items-start">
                        <p className="text-tiny uppercase font-bold text-slate-400 tracking-wider">
                            {stat.label}
                        </p>
                    </CardHeader>

                    <CardBody className="py-4 px-5 flex flex-row items-center justify-between overflow-visible">
                        <h4 className="font-black text-4xl text-slate-800">
                            {stat.count}
                        </h4>

                        {/* Contenedor del Icono Estilo "Neon" del prototipo */}
                        <div className={`
              flex items-center justify-center
              w-12 h-12 rounded-full border-2 bg-slate-900
              border-${stat.accent}-400/50 
              shadow-[0_0_15px_rgba(var(--tw-shadow-color),0.4)]
              shadow-${stat.accent}-400/30
            `}>
                            <i className={`fa-solid ${stat.icon} text-${stat.accent}-400 text-lg`}></i>
                        </div>
                    </CardBody>

                    <CardFooter className="px-5 pb-5">
                        <div className="flex flex-col w-full gap-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
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
        </div>
    )
}

export default MateriasProgreso