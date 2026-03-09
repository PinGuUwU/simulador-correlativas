import { Progress } from '@heroui/react'

function ProgresoTotal({ carrera, progress }) {
    return (
        <header className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 md:p-8 flex flex-col gap-6 transition-all hover:shadow-md">
            {/* Sección Superior: Logo y Títulos */}
            <div className="flex flex-col md:flex-row md:items-center gap-5">
                {/* Icono/Logo Estilizado */}
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                    <i className="fa-solid fa-graduation-cap text-white text-3xl"></i>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-bold text-sm tracking-wider">UNLu</span>
                        <span className="text-slate-300">|</span>
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
            <div className="w-full pt-6 border-t border-slate-50">
                <div className="flex justify-between items-end mb-3">
                    <div className="space-y-1">
                        <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Estado Actual</span>
                        <p className="text-slate-700 font-semibold">Progreso de la carrera</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-secondary">{progress}%</span>
                        <span className="text-slate-400 text-sm ml-1 font-medium">completado</span>
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
        </header>
    )
}

export default ProgresoTotal