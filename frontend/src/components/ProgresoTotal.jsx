import { Progress } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'

function ProgresoTotal({ carrera, progress, isSticky, headerRef, setIsSticky }) {

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
        <header ref={headerRef} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 md:p-8 flex flex-col gap-6 transition-all hover:shadow-md">
            {/* Sección Superior: Logo y Títulos */}
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-start">
                {/* Icono/Logo Estilizado */}
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0 lg:hidden">
                    <i className="fa-solid fa-graduation-cap text-white text-3xl"></i>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 justify-center md:justify-normal">
                        <span className="text-blue-600 font-bold text-sm tracking-wider lg:hidden">UNLu</span>
                        <span className="text-slate-300 lg:hidden">|</span>
                        <span className="text-slate-500 font-medium text-sm">{carrera}</span>
                    </div>

                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Simulador de Correlativas
                    </h1>

                    <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
                        Gestioná tu progreso académico de la <span className="text-slate-700 font-medium">Licenciatura en Sistemas de Información</span> y planificá tu carrera con precisión.
                    </p>
                </div>
            </div>

            {/* Sección Inferior: Barra de Progreso */}
            {/* Sección Inferior: Barra de Progreso */}
            {/* Contenedor envolvente para evitar saltos de layout cuando se vuelve fixed */}
            <div className={`${isSticky ? "h-[80px]" : "pt-6 border-t border-slate-50"}`}>
                <div className={
                    isSticky
                        ? "fixed lg:flex-1 top-0 lg:right-0 left-0 w-full lg:w-[85%] xl:w-[90%] xl:ml-[12%] lg:ml-[15%] bg-white/90 backdrop-blur-md z-30 p-4 md:px-12 shadow-md border-b border-slate-200 animate-in slide-in-from-top duration-300"
                        : "w-full"
                }>
                    <div className={`${isSticky ? "max-w-7xl mx-auto" : ""}`}>
                        <div className="flex justify-between items-end mb-3">
                            <div className="space-y-1">
                                <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Estado Actual</span>
                                <p className="text-slate-700 font-semibold">Progreso de la carrera</p>
                            </div>
                            <div className="text-right pr-[8%]">
                                <span className="text-2xl font-black text-secondary pr-[20%] sm:p-0">{progress}%</span>
                                <span className="text-slate-400 text-sm ml-1 font-medium hidden sm:flex">completado</span>
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