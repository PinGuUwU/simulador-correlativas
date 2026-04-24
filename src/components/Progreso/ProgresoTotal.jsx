import { Progress, Button, Tooltip, Chip, Divider } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MateriasProgreso from './MateriasProgreso'
import regularidadUtils from '../../utils/Progreso/regularidadUtils'
import tituloIntermedioUtils from '../../utils/Progreso/tituloIntermedioUtils'

function ProgresoTotal({ carrera, plan, progress, progreso, progresoDetalles, materias, isSticky, headerRef, setIsSticky }) {
    const [isStatsExpanded, setIsStatsExpanded] = useState(false);

    const promedios = regularidadUtils.calcularPromedioGeneral(progresoDetalles, progreso);

    // Lógica Título Intermedio
    const tituloIntermedioNombre = tituloIntermedioUtils.getTituloIntermedioNombre(plan);
    const materiasIntermedio = tituloIntermedioUtils.getMateriasIntermedio(plan, materias);
    const progresoIntermedio = tituloIntermedioUtils.calcularProgresoIntermedio(materiasIntermedio, progreso);
    
    // Calcular en qué porcentaje de la carrera total se encuentra el título intermedio
    const markerPosition = materias.length > 0 && materiasIntermedio.length > 0
        ? (materiasIntermedio.length / materias.length) * 100
        : 0;

    const isIntermedioCompletado = progresoIntermedio.totales > 0 && progresoIntermedio.completadas === progresoIntermedio.totales;

    // Calcular carga horaria de progreso (Regular, Aprobado, Promocionado)
    const totalHorasProgreso = materias.reduce((acc, m) => {
        const estado = progreso[m.codigo];
        if (estado === 'Aprobado' || estado === 'Promocionado' || estado === 'Regular') {
            return acc + (Number(m.horas_totales) || 0);
        }
        return acc;
    }, 0);

    const totalMateriasFinalizadas = materias.filter(m =>
        progreso[m.codigo] === 'Aprobado' || progreso[m.codigo] === 'Promocionado'
    ).length;

    const totalMateriasCarrera = materias.length;
    const totalHorasCarrera = materias.reduce((acc, m) => acc + (Number(m.horas_totales) || 0), 0);

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
                {/* Sección Superior: Pantalla completa centrada en móvil, horizontal en desktop */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-10">

                    {/* Contenedor de Icono: Más grande en móvil, estándar en desktop */}
                    <div className="relative group shrink-0">
                        <div className="absolute -inset-1 bg-linear-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-primary w-20 h-20 md:w-16 md:h-16 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
                            <i className="fa-solid fa-graduation-cap text-white text-4xl md:text-3xl lg:text-5xl"></i>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        {/* Migas de pan / Ubicación */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-black text-[10px] uppercase tracking-tighter shrink-0">UNLu</span>
                            <span className="text-secondary font-bold text-xs lg:text-sm tracking-wide uppercase">{carrera}</span>
                            <Divider orientation="vertical" className="h-4 bg-default-300 hidden sm:block" />
                            <Link to="/config" className="hover:opacity-80 transition-opacity" title="Cambiar Plan de Estudios">
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    color="warning"
                                    className="font-bold text-[10px] h-5 border border-warning/20 cursor-pointer"
                                    startContent={<i className="fa-solid fa-scroll text-[9px] mr-1" />}
                                >
                                    Plan {plan || '---'}
                                </Chip>
                            </Link>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-none mb-3">
                            Mi Progreso <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Académico</span>
                        </h1>

                        <p className="text-foreground/70 font-medium text-sm sm:text-base lg:text-lg max-w-3xl leading-relaxed mb-6">
                            Gestioná tu avance <strong>real y oficial</strong> en la <span className="text-foreground font-bold">Licenciatura en Sistemas de Información</span>.<br />
                            Los cambios aquí realizados representan tu avance definitivo. <span className="text-sm border border-primary/30 bg-primary/10 px-2 py-1 ml-1 rounded-md mb-1 inline-block">Si solo querés planificar cómo sería tu cursada, usá el <Link to="/simulador" className="font-bold underline text-primary hover:text-primary-600">Simulador</Link>.</span>
                        </p>

                        {/* Sección Estadísticas: Grilla en móvil, flex en desktop */}
                        <div className="grid grid-cols-2 lg:flex gap-3 w-full sm:w-auto">
                            <Tooltip content="Promedio de exámenes finales aprobados." placement="bottom">
                                <div className="flex items-center gap-3 p-3 lg:px-4 lg:py-2 bg-success/10 border border-success/20 rounded-xl transition-all hover:bg-success/20">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-success/20 flex items-center justify-center text-success shrink-0">
                                        <i className="fa-solid fa-chart-line text-sm" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] text-success-700 font-bold uppercase tracking-wider leading-none mb-1">Sin Aplazos</span>
                                        <span className="text-lg font-black text-success-800 leading-none">{promedios.promedioSinAplazos || '--'}</span>
                                    </div>
                                </div>
                            </Tooltip>

                            <Tooltip content="Promedio de todos los intentos registrados." placement="bottom">
                                <div className="flex items-center gap-3 p-3 lg:px-4 lg:py-2 bg-danger/10 border border-danger/30 rounded-xl transition-all hover:bg-danger/20">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-danger/20 flex items-center justify-center text-danger shrink-0">
                                        <i className="fa-solid fa-chart-area text-sm" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] text-danger-700 font-bold uppercase tracking-wider leading-none mb-1">Con Aplazos</span>
                                        <span className="text-lg font-black text-danger-800 leading-none">{promedios.promedioConAplazos || '--'}</span>
                                    </div>
                                </div>
                            </Tooltip>

                            <Tooltip content="Materias finalizadas respecto al total de la carrera." placement="bottom">
                                <div className="flex items-center gap-3 p-3 lg:px-4 lg:py-2 bg-primary/10 border border-primary/20 rounded-xl transition-all hover:bg-primary/20">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <i className="fa-solid fa-book-bookmark text-sm" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] text-primary-700 font-bold uppercase tracking-wider leading-none mb-1">Total Materias</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-primary-800 leading-none">{totalMateriasFinalizadas}</span>
                                            <span className="text-[10px] font-bold text-primary-600/70">/ {totalMateriasCarrera}</span>
                                        </div>
                                    </div>
                                </div>
                            </Tooltip>

                            <Tooltip content="Horas de materias regulares, aprobadas y promocionadas respecto al total." placement="bottom">
                                <div className="flex items-center gap-3 p-3 lg:px-4 lg:py-2 bg-secondary/10 border border-secondary/20 rounded-xl transition-all hover:bg-secondary/20">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                                        <i className="fa-solid fa-clock text-sm" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] text-secondary-700 font-bold uppercase tracking-wider leading-none mb-1">Carga Horaria</span>
                                        <div className="sm:flex items-baseline gap-1">
                                            <span className="text-lg font-black text-secondary-800 leading-none">{totalHorasProgreso}</span>
                                            <span className="text-[10px] font-bold text-secondary-600/70">/ {totalHorasCarrera} hs</span>
                                        </div>
                                    </div>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* Materias Progreso (Cards) */}
                <div className="pt-4">
                    <div className="flex items-start sm:items-center justify-between mb-1 gap-2">
                        <div className="flex flex-col">
                            <p className="text-default-500 text-xs sm:text-sm uppercase tracking-widest font-black">Progresos generales</p>
                            <p className="text-[10px] sm:text-xs text-primary-500/80 font-medium italic mt-0.5 flex items-center gap-1">
                                <i className="fa-regular fa-hand-pointer text-[9px] sm:hidden" /> 
                                <i className="fa-solid fa-mouse-pointer text-[9px] hidden sm:block" /> 
                                Tocá una tarjeta para ver más info
                            </p>
                        </div>
                        {/* Toggle exclusivo para celular */}
                        <Button
                            size="sm"
                            variant="flat"
                            className="md:hidden font-bold h-7 px-3 rounded-lg"
                            onPress={() => setIsStatsExpanded(!isStatsExpanded)}
                            endContent={<i className={`fa-solid fa-chevron-down transition-transform duration-300 ${isStatsExpanded ? 'rotate-180' : ''}`}></i>}
                        >
                            {isStatsExpanded ? 'Ocultar' : 'Mostrar'}
                        </Button>
                    </div>

                    <div className={`mt-4 flex ${isStatsExpanded ? 'block animate-in fade-in slide-in-from-top-2' : 'hidden md:block'}`}>
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
                            ? "fixed top-0 left-0 right-0 z-30 p-4 bg-background shadow-lg border-b border-default-200/60 animate-in slide-in-from-top duration-300"
                            : "w-full"
                    }
                >
                    <div className={isSticky ? "max-w-7xl mx-auto lg:pl-64 transition-all duration-300" : ""}>
                        <div className="flex sm:px-10 pr-10 sm:p-0 justify-between items-end mb-3 ">
                            <div className="space-y-0.5 flex flex-col items-start">
                                <span className="text-default-500 text-xs uppercase tracking-widest font-black">Estado Actual</span>
                                <div className="flex items-center gap-2">
                                    <p className="text-foreground font-bold ">Progreso de la carrera</p>
                                    {isIntermedioCompletado && (
                                        <Tooltip content={`¡Felicidades! Completaste el ${tituloIntermedioNombre}`}>
                                            <Chip
                                                size="sm"
                                                color="success"
                                                variant="flat"
                                                className="h-5 font-bold animate-pulse"
                                                startContent={<i className="fa-solid fa-graduation-cap text-[10px] mr-1" />}
                                            >
                                                Analista
                                            </Chip>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-secondary tabular-nums">{progress}%</span>
                                <span className="text-foreground/60 font-bold text-sm ml-1 hidden sm:inline-block">completado</span>
                            </div>
                        </div>

                        <div className="relative w-full">
                            <Progress
                                value={progress}
                                aria-label="Progreso total de la carrera"
                                color="secondary"
                                className="h-2.5"
                                showValueLabel={false}
                                classNames={{
                                    track: "bg-default-200/60 ",
                                    indicator: "bg-gradient-to-r from-secondary to-primary"
                                }}
                            />
                            {markerPosition > 0 && markerPosition < 100 && (
                                <Tooltip 
                                    content={
                                        <div className="px-1 py-1">
                                            <p className="font-bold text-tiny">{tituloIntermedioNombre}</p>
                                            <p className="text-tiny text-default-500">{progresoIntermedio.completadas}/{progresoIntermedio.totales} materias ({progresoIntermedio.porcentaje}%)</p>
                                        </div>
                                    }
                                >
                                    <div 
                                        className="absolute top-0 bottom-0 w-1 bg-white/50 backdrop-blur-xs z-10 shadow-[0_0_8px_rgba(255,255,255,0.5)] cursor-help group"
                                        style={{ left: `${markerPosition}%`, height: '10px', top: '0px' }}
                                    >
                                        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center transition-opacity duration-300 ${isIntermedioCompletado ? 'text-success' : 'text-default-400 group-hover:text-primary'}`}>
                                            <i className="fa-solid fa-graduation-cap text-[10px]"></i>
                                            <div className="w-0.5 h-2 bg-current mt-0.5"></div>
                                        </div>
                                    </div>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default ProgresoTotal