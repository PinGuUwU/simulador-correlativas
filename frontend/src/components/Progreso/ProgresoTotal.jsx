import { Progress } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import MateriasProgreso from './MateriasProgreso'

function ProgresoTotal({ carrera, progress, progreso, materias, isSticky, headerRef, setIsSticky }) {

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
    }, [])

    return (
        <header ref={headerRef} className="bg-background border border-default-100 shadow-sm rounded-2xl p-6 md:p-8 flex flex-col gap-6 transition-all hover:shadow-md">
            {/* Sección Superior: Logo y Títulos */}
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-start">
                {/* Icono/Logo Estilizado */}
                <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 2xl:hidden">
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

                    <p className="text-foreground font-medium text-base max-w-2xl leading-relaxed">
                        Gestioná tu progreso académico de la <span className="text-default-900 font-bold underline decoration-primary/30">Licenciatura en Sistemas de Información</span> llevando el control de tus materias aprobadas y regulares.
                    </p>
                </div>
            </div>
            {/* Materias Progreso (Cards) */}
            <div className="pt-4">
                <p className="text-default-500 text-xs uppercase tracking-widest font-black mb-1">Distribución por estado</p>
                <div className="mt-4 mb-4">
                    <MateriasProgreso progreso={progreso} materias={materias} />
                </div>
            </div>
            {/* Sección Inferior: Barra de Progreso */}
            {/* Contenedor envolvente para evitar saltos de layout cuando se vuelve fixed */}
            <div className={isSticky ? "" : "pt-6 border-t"}>
                <div id="progreso-total" className={
                    isSticky
                        ? "fixed top-0 right-0 z-30 backdrop-blur-md p-4 bg-background/95 shadow-md border-b border-default-200 animate-in slide-in-from-top duration-300 left-0 "
                        : "w-full"
                }>
                    <div className={isSticky ? "max-w-7xl mx-auto 2xl:pl-64" : ""}>
                        <div className="flex px-10 sm:p-0 justify-between items-end mb-3">
                            <div className="space-y-1">
                                <span className="text-default-900 text-xs uppercase tracking-widest font-black">Estado Actual</span>
                                <p className="text-foreground font-bold">Progreso de la carrera</p>
                            </div>
                            <div className="text-right">
                                {/* Eliminé los pr-[8%] y pr-[20%] manuales para usar un layout más fluido */}
                                <span className="text-2xl font-black text-secondary">{progress}%</span>
                                <span className="text-foreground font-bold text-sm ml-1 hidden sm:inline-block">completado</span>
                            </div>
                        </div>

                        <Progress
                            value={progress}
                            aria-label="Progreso total de la carrera"
                            color="secondary"
                            className="h-3 shadow-sm"
                            showValueLabel={false}
                        />
                    </div>
                </div>
            </div>



        </header>
    )
}

export default ProgresoTotal