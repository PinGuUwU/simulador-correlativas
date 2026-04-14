import { Progress, Button, Tooltip, Chip } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import MateriasProgreso from './MateriasProgreso'
import regularidadUtils from '../../utils/Progreso/regularidadUtils'

function ProgresoTotal({ carrera, progress, progreso, progresoDetalles, materias, isSticky, headerRef, setIsSticky }) {
    const [isStatsExpanded, setIsStatsExpanded] = useState(false);

    const promedios = regularidadUtils.calcularPromedioGeneral(progresoDetalles, progreso);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting)
            }, {
            threshold: 0,
            rootMargin: "-80px 0px 0px 0px"
        }
        )
        if (headerRef.current) {
            observer.observe(headerRef.current)
        }
        return () => observer.disconnect()
    }, [setIsSticky, headerRef])

    const barRef = useRef(null)
    const [barHeight, setBarHeight] = useState(0)

    // Medir la altura de la barra para evitar saltos de layout
    useEffect(() => {
        if (barRef.current && !isSticky) {
            setBarHeight(barRef.current.offsetHeight)
        }
    }, [isSticky, progreso])

    return (
        <header ref={headerRef} className="bg-transparent border border-default-200/60 shadow-sm hover:shadow-md rounded-2xl flex flex-col transition-all duration-300">
            {/* Contenedor con blur para la parte superior (No afecta al fixed de abajo) */}
            <div className="bg-background/80 backdrop-blur-md p-6 md:p-8 pb-3 flex flex-col gap-6 rounded-t-2xl w-full">
                {/* Sección Superior: Logo y Títulos */}
                <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-start">
                    {/* Icono/Logo Estilizado */}
                    <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0 2xl:hidden ring-2 ring-primary/15">
                        <i className="fa-solid fa-graduation-cap text-white text-3xl"></i>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 justify-center md:justify-normal">
                            <span className="text-primary font-bold text-sm tracking-wider 2xl:hidden">UNLu</span>
                            <span className="text-default-400 2xl:hidden">|</span>
                            <span className="text-foreground font-semibold text-sm">{carrera}</span>
                        </div>

                        <h1 className="text-3xl font-black text-foreground tracking-tight">
                            Mi Progreso Académico
                        </h1>

                        <p className="text-foreground/70 font-medium text-base max-w-2xl leading-relaxed mb-4">
                            Gestioná tu progreso académico de la <span className="text-foreground font-bold underline decoration-primary/40 decoration-2">Licenciatura en Sistemas de Información</span> llevando el control de tus materias aprobadas y regulares.
                        </p>

                        {/* Sección Promedios */}
                        <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start pt-2">
                            <Tooltip content="Promedio de notas de exámenes finales aprobados unicamente." placement="top">
                                <Chip
                                    color="success"
                                    variant="flat"
                                    size="md"
                                    className="font-bold border border-success/30"
                                    startContent={<i className="fa-solid fa-chart-line ml-1" />}
                                >
                                    Promedio (Sin Aplazos): {promedios.promedioSinAplazos || '-'}
                                </Chip>
                            </Tooltip>

                            <Tooltip content="Promedio de notas de todos los intentos de exámenes finales (aprobados y reprobados)." placement="top">
                                <Chip
                                    color="danger"
                                    variant="flat"
                                    size="md"
                                    className="font-bold border border-danger/30"
                                    startContent={<i className="fa-solid fa-chart-area ml-1" />}
                                >
                                    Promedio (Con Aplazos): {promedios.promedioConAplazos || '-'}
                                </Chip>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* Materias Progreso (Cards) */}
                <div className="pt-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-default-500 text-xs uppercase tracking-widest font-black">Progresos generales</p>
                        {/* Toggle exclusivo para celular */}
                        <Button
                            size="sm"
                            variant="flat"
                            className="md:hidden font-bold h-7 px-3 rounded-lg"
                            onPress={() => setIsStatsExpanded(!isStatsExpanded)}
                            endContent={<i className={`fa-solid fa-chevron-down transition-transform duration-300 ${isStatsExpanded ? 'rotate-180' : ''}`}></i>}
                        >
                            {isStatsExpanded ? 'Ocultar' : 'Ver más'}
                        </Button>
                    </div>

                    <div className={`mt-4 mb-4 ${isStatsExpanded ? 'block animate-in fade-in slide-in-from-top-2' : 'hidden md:block'}`}>
                        <MateriasProgreso progreso={progreso} materias={materias} />
                    </div>
                </div>
            </div>

            {/* Sección Inferior: Barra de Progreso (Fuera del blur superior para que el fixed funcione) */}
            <div
                className={`transition-all duration-300 ${!isSticky ? "bg-background/80 backdrop-blur-md p-6 md:p-8 pt-3 rounded-b-2xl border-t border-default-200/50" : ""}`}
                style={{ minHeight: isSticky ? `${barHeight}px` : "auto" }}
            >
                <div
                    id="progreso-total"
                    ref={barRef}
                    className={
                        isSticky
                            ? "fixed top-0 right-0 z-30 backdrop-blur-xl p-4 bg-background/90 shadow-md border-b border-default-200/60 animate-in slide-in-from-top duration-300 left-0"
                            : "w-full"
                    }
                >
                    <div className={isSticky ? "max-w-7xl mx-auto 2xl:pl-64" : ""}>
                        <div className="flex px-10 sm:p-0 justify-between items-end mb-3">
                            <div className="space-y-0.5">
                                <span className="text-default-500 text-xs uppercase tracking-widest font-black">Estado Actual</span>
                                <p className="text-foreground font-bold">Progreso de la carrera</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-secondary tabular-nums">{progress}%</span>
                                <span className="text-foreground/60 font-bold text-sm ml-1 hidden sm:inline-block">completado</span>
                            </div>
                        </div>

                        <Progress
                            value={progress}
                            aria-label="Progreso total de la carrera"
                            color="secondary"
                            className="h-2.5"
                            showValueLabel={false}
                            classNames={{
                                track: "bg-default-200/60",
                                indicator: "bg-gradient-to-r from-secondary to-primary"
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default ProgresoTotal