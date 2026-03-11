import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Button, Popover, PopoverContent, PopoverTrigger, Progress } from '@heroui/react'
import React from 'react'

function MateriasProgreso({ progreso, materias }) {
    // 1. Cálculos de datos (Lógica optimizada)
    const materiasTotales = materias.length
    const stats = [
        {
            label: "Disponibles",
            count: materias.filter(m => progreso[m.codigo] === "Disponible").length,
            color: "primary",
            icon: "fa-solid fa-unlock",
            accent: "bg-primary-300 border-primary-400/50 shadow-primary",
            tittle: "Materias disponibles",
            text: "Son las materias que podes cursar en el cuatrimestre correspondiente",
            bg: "bg-blue-50/50"
        },
        {
            label: "Regulares",
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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
            {stats.map((stat, index) => (
                <Card
                    key={index}
                    className={`${stat.accent} shadow-sm hover:shadow-md transition-shadow duration-300 ${stat.bg}`}
                >
                    <CardHeader className="pb-0 pt-4 px-5 items-center flex justify-between text-center">
                        <p className="text-tiny uppercase font-bold text-default-400 tracking-wider">
                            {stat.label}
                        </p>
                        <Popover placement='bottom' showArrow={true} >
                            <PopoverTrigger>
                                <Button className={`rounded-4xl ${stat.accent} h-min min-w-min`}>?</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className="px-1 py-2">
                                    <div className="text-small font-bold">{stat.tittle}</div>
                                    <div className="text-tiny">{stat.text}</div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </CardHeader>

                    <CardBody className="py-4 px-5 flex flex-row items-center justify-between overflow-visible">
                        <h4 className="font-black text-4xl text-default-800">
                            {stat.count}
                        </h4>

                        {/* Contenedor del Icono Estilo "Neon" del prototipo */}
                        <div className={`${stat.accent} flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-[0_0_15px_rgba(var(--tw-shadow-color),0.4)]`}>
                            <i className={`${stat.icon} text-lg`}></i>
                        </div>
                    </CardBody>

                    <CardFooter className="px-5 pb-5">
                        <div className="flex flex-col w-full gap-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-default-400 uppercase">
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