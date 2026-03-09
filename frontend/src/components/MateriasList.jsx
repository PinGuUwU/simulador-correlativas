import { useEffect, useRef, useState } from 'react'
import MateriaCard from './MateriaCard'
import { Chip, Switch, useDisclosure } from '@heroui/react'
import DetalleMateriaModal from './modals/DetalleMateriaModal.jsx'
import useProgresoMaterias from '../hooks/useProgresoMaterias.jsx'

function MateriasList({ progreso, setProgreso, materias }) {
    const [modo, setModo] = useState(false) //Para saber si se está editando el estado o no
    const [infoMateria, setInfoMateria] = useState()
    const topSwitchRef = useRef(null)
    const [mostrarSwitchFlotante, setMostrarSwitchFlotante] = useState(false)
    const { cambioDeEstado } = useProgresoMaterias(progreso, setProgreso, materias)

    // Observador para saber si el switch principal se ve
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Si el elemento ya no está en pantalla, isIntersecting es false
                setMostrarSwitchFlotante(!entry.isIntersecting)
            },
            { threshold: 0 } // Se dispara apenas el elemento sale completamente de la vista
        )

        if (topSwitchRef.current) {
            observer.observe(topSwitchRef.current)
        }

        return () => {
            if (topSwitchRef.current) observer.unobserve(topSwitchRef.current)
        }
    }, [])

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
    //Abrir la info de una materia con Drawer de HeroUI
    const abrirInfo = (materia) => {
        setInfoMateria(materia)
        onOpen()
    }
    //Para cambiar el tamaño de la barra de progreso
    const getProgressBar = () => {
        const sizeProgressBar = window.innerWidth
        if (sizeProgressBar < 640) { return "sm" }
        else if (sizeProgressBar < 768) { return "md" }
        else if (sizeProgressBar < 1024) { return "lg" }
    }
    const currentSize = getProgressBar()

    //Ordeno las materias dentro del array cuatrimestres, para poder mostrarlas en orden y separarlas por cuatrimestre
    const anios = [...new Set(materias.map((m) => Number(m.anio)))].sort((a, b) => a - b)
    return (
        <div>
            <div ref={topSwitchRef} className="flex justify-end mb-8 px-4">
                <Switch
                    isSelected={modo}
                    color="success"
                    onChange={() => setModo(!modo)}
                    endContent={<span className="text-xs">OFF</span>}
                    startContent={<span className="text-xs">ON</span>}
                    size={currentSize}
                    classNames={{
                        label: "text-slate-600 font-medium"
                    }}
                >
                    Modo Edición
                </Switch>
            </div>
            {/* Switch Flotante en la parte inferior derecha */}
            {mostrarSwitchFlotante && (
                <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200">
                    <Switch
                        color="success"
                        onChange={() => setModo(!modo)}
                        endContent={<span className="text-xs">OFF</span>}
                        startContent={<span className="text-xs">ON</span>}
                        size={currentSize}
                        classNames={{
                            label: "text-slate-800 font-bold"
                        }}
                    >
                        Modo Edición
                    </Switch>
                </div>
            )}

            <div className="space-y-12">
                {anios.map((anio) => {
                    // Me quedo con las materias de este año
                    const materiasAnio = materias.filter((m) => Number(m.anio) === anio);

                    // Si no hay materias en este año, podríamos evitar renderizarlo (opcional)
                    if (materiasAnio.length === 0) return null;

                    return (
                        <section key={anio} className="flex flex-col gap-6">
                            {/* Cabecera del Año */}
                            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                                <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-sm"></div>
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    {anio}° Año
                                </h2>
                            </div>

                            {/* Contenedor de Cuatrimestres */}
                            <div className="flex flex-col gap-8 pl-2 sm:pl-4">
                                {[1, 2].map((cuatri) => {
                                    // Me quedo con las materias de este cuatrimestre
                                    const materiasCuatri = materiasAnio.filter(
                                        (m) => (Number(m.cuatrimestre) % 2 === 0 ? 2 : 1) === cuatri
                                    );

                                    if (materiasCuatri.length === 0) return null;

                                    return (
                                        <div key={cuatri} className="flex flex-col gap-4">
                                            {/* Cabecera del Cuatrimestre */}
                                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-5 bg-slate-400 rounded-full"></div>
                                                    <h3 className="text-lg font-semibold text-slate-700">
                                                        {cuatri}° Cuatrimestre
                                                    </h3>
                                                </div>
                                                <Chip size="sm" variant="flat" className="bg-white border border-slate-200 text-slate-600 font-medium shadow-sm">
                                                    {materiasCuatri.length} {materiasCuatri.length === 1 ? 'Materia' : 'Materias'}
                                                </Chip>
                                            </div>

                                            {/* Grilla de Materias */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                {materiasCuatri.map((materia, index) => (
                                                    <MateriaCard
                                                        key={materia.codigo !== "N/A" ? materia.codigo : `${materia.codigo}-${index}`}
                                                        materia={materia}
                                                        estado={progreso[materia.codigo]}
                                                        actualizarEstados={cambioDeEstado}
                                                        modo={modo}
                                                        abrirInfo={() => abrirInfo(materia)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Drawer de info de las materiasd */}
            <DetalleMateriaModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                infoMateria={infoMateria}
                materias={materias}
                progreso={progreso}
            />

        </div >
    )
}

export default MateriasList