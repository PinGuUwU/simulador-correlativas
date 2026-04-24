import React, { useState } from 'react'
import { Button, Spinner, useDisclosure, Card, CardBody, Modal, ModalContent, ModalBody, ButtonGroup } from '@heroui/react'
import { Link } from 'react-router-dom'

import HeaderSimulador from '../components/Simulador/HeaderSimulador'
import MateriasSimulador from '../components/Simulador/MateriasSimulador'
import HistorialAcademico from '../components/Simulador/HistorialAcademico'
import SimulandoAhora from '../components/Simulador/SimulandoAhora'
import CarreraFinalizada from '../components/Simulador/CarreraFinalizada'
import ConfiguracionSimulador from '../components/Simulador/modals/ConfiguracionSimulador'
import GuardarSimulacion from '../components/Simulador/modals/GuardarSimulacion'
import MateriasGrafo from '../components/Progreso/MateriasGrafo'

import useSimuladorEstado from '../hooks/Simulador/useSimuladorEstado'
import useSimuladorMaterias from '../hooks/Simulador/useSimuladorMaterias'
import useSimuladorPDF from '../hooks/Simulador/useSimuladorPDF'
import { LayoutGrid, Network } from 'lucide-react'
import { calculateProjection } from '../utils/Simulador/projectionUtils'

function Simulador({ plan: initialPlan, setPlan: setGlobalPlan }) {
    // ─── Configuración (viene del modal, no cambia durante la simulación) ────
    const [plan, setPlan] = useState()
    const [anioInicio, setAnioInicio] = useState()
    const [cuatriInicio, setCuatriInicio] = useState()

    // ─── UI state ────────────────────────────────────────────────────────────
    const [openedAccordions, setOpenedAccordions] = useState(new Set())
    const [descargandoPDF, setDescargandoPDF] = useState(false)
    const [viewMode, setViewMode] = useState('grafo') // 'grafo' o 'lista'

    // ─── Modales ─────────────────────────────────────────────────────────────
    const { isOpen: isConfigOpen, onClose: onConfigClose, onOpenChange: onConfigOpenChange, onOpen: onConfigOpen } = useDisclosure()
    const { isOpen: isGuardarOpen, onClose: onGuardarClose, onOpenChange: onGuardarOpenChange, onOpen: onConfigOpenGuardar } = useDisclosure()

    // ─── Estado central de la simulación ─────────────────────────────────────
    const {
        materias,
        cargando,
        progresoSimulado, setProgresoSimulado,
        progresoBase, setProgresoBase,
        cuatri,
        anioActual,
        historialSemestres, setHistorialSemestres,
        semestreActualPlan,
        estadoAnterior,
        estadoSiguiente,
        simulacionTerminada, setSimulacionTerminada,
        handleAnterior,
        handleSiguiente
    } = useSimuladorEstado({ plan, anioInicio, cuatriInicio })

    // ─── Materias disponibles para el cuatrimestre actual ────────────────────
    const { cambioDeEstado, materiasCursables, materiasBloqueadas } = useSimuladorMaterias(
        materias,
        progresoSimulado || {},
        cuatri,
        setProgresoSimulado,
        progresoBase || {},
        anioActual,
        semestreActualPlan
    )

    // ─── Proyección Dinámica (para el grafo) ─────────────────────────────────
    const projection = React.useMemo(() => {
        if (!materias.length || !progresoSimulado) return null;
        return calculateProjection({
            materias,
            historialSemestres,
            progresoSimulado,
            cuatriActual: cuatri,
            anioActual
        });
    }, [materias, historialSemestres, progresoSimulado, cuatri, anioActual]);

    // Función para manejar clicks en el grafo - Envuelto en useCallback para estabilidad
    const handleNodeClick = React.useCallback((codigo) => {
        // Solo permitimos interactuar si la materia es parte del presente (columna actual)
        const item = projection?.[codigo];
        if (item && (item.estado === 'Seleccionada' || item.estado === 'Disponible')) {
            cambioDeEstado(codigo);
        }
    }, [projection, cambioDeEstado]);

    // ─── PDF ─────────────────────────────────────────────────────────────────
    const { handleDownloadPDF } = useSimuladorPDF({
        historialSemestres,
        plan,
        openedAccordions,
        setOpenedAccordions,
        setDescargandoPDF
    })

    // ─── Marcar / desmarcar todas las materias visibles ──────────────────────
    const marcarTodasEnPantalla = (estado) => {
        if (!materiasCursables.length) return
        const nuevo = { ...progresoSimulado }
        materiasCursables.forEach(m => { nuevo[m.codigo] = estado })
        setProgresoSimulado(nuevo)
    }

    // Abrir configuración si aún no hay plan elegido
    React.useEffect(() => {
        if (!plan) onConfigOpen()
    }, [plan])

    return (
        <div className="flex flex-col gap-12 py-12 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">

            {/* ── Modales ── */}
            <ConfiguracionSimulador
                isOpen={isConfigOpen}
                onOpenChange={onConfigOpenChange}
                onClose={onConfigClose}
                setAnio={setAnioInicio}
                setCuatri={setCuatriInicio}
                setPlan={setPlan}
                initialPlan={initialPlan}
            />
            <GuardarSimulacion
                isOpen={isGuardarOpen}
                onOpenChange={onGuardarOpenChange}
                onClose={onGuardarClose}
                plan={plan}
                historialSemestres={historialSemestres}
                progresoSimulado={progresoSimulado}
                progresoBase={progresoBase}
                anioActual={anioActual}
                cuatri={cuatri}
                simulacionTerminada={simulacionTerminada}
            />

            {/* Modal que muestra el estado de descarga de PDF sin afectar el render base */}
            <Modal isOpen={descargandoPDF} hideCloseButton isDismissable={false} backdrop="blur" placement="center">
                <ModalContent>
                    <ModalBody className="py-8 flex flex-col items-center justify-center text-center gap-4">
                        <Spinner size="lg" color="primary" />
                        <div>
                            <h3 className="text-xl font-black text-foreground">Generando Reporte</h3>
                            <p className="text-sm text-foreground/60 mt-1">
                                Preparando tu historial académico y procesando el documento...
                            </p>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* ── Estado: sin plan configurado ── */}
            {!plan && !cargando && (
                <div className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-in fade-in duration-500">
                    <div className="bg-primary/10 p-6 rounded-full">
                        <i className="fa-solid fa-gear text-5xl text-primary animate-spin-slow" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Configuración Requerida</h2>
                        <p className="text-foreground/80 max-w-sm">Para comenzar la simulación, primero debemos definir los parámetros iniciales.</p>
                    </div>
                    <Button color="primary" size="lg" variant="shadow" className="font-bold rounded-2xl px-12" onPress={onConfigOpen}>
                        Configurar Ahora
                    </Button>
                </div>
            )}

            {/* ── Contenido principal ── */}
            {plan && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header + botón de reconfigurar */}
                    <div className="flex justify-between items-center mb-0">
                        <HeaderSimulador plan={plan} />
                        <Button isIconOnly variant="flat" color="primary" onPress={onConfigOpen} className="rounded-xl">
                            <i className="fa-solid fa-sliders" />
                        </Button>
                    </div>

                    {/* Disclaimer Simulador vs Progreso */}
                    <div className="flex flex-col md:flex-row gap-4 mt-6 mb-2 items-stretch md:items-start">
                        <div className="flex-1 flex bg-warning-50/50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/30 text-warning-800 dark:text-warning-300 rounded-xl p-4 items-start gap-3 shadow-sm">
                            <i className="fa-solid fa-circle-info text-xl mt-0.5 text-warning-500" />
                            <div className="flex-1">
                                <h4 className="font-bold text-sm md:text-base text-warning-900 dark:text-warning-400">Modo de Prueba (Simulador)</h4>
                                <p className="text-xs md:text-sm mt-1 opacity-90">
                                    Aquí puedes experimentar diferentes escenarios. <strong>Tus selecciones en esta pantalla no se guardan como tu avance real.</strong> Si quieres actualizar las materias que ya aprobaste o regularizaste, hazlo desde la sección <Link to="/progreso" className="underline font-bold hover:text-warning-700 dark:hover:text-warning-200">Mi Progreso</Link>.
                                </p>
                            </div>
                        </div>

                        {/* Selector de Vista */}
                        <div className="flex flex-col gap-2 p-1 bg-default-100 rounded-2xl border border-default-200 h-fit self-center">
                            <ButtonGroup size="lg" variant="flat">
                                <Button
                                    onPress={() => setViewMode('grafo')}
                                    color={viewMode === 'grafo' ? 'primary' : 'default'}
                                    className={`font-bold transition-all ${viewMode === 'grafo' ? 'shadow-md' : 'bg-transparent text-foreground/50'}`}
                                    startContent={<Network size={20} />}
                                >
                                    Grafo
                                </Button>
                                <Button
                                    onPress={() => setViewMode('lista')}
                                    color={viewMode === 'lista' ? 'primary' : 'default'}
                                    className={`font-bold transition-all ${viewMode === 'lista' ? 'shadow-md' : 'bg-transparent text-foreground/50'}`}
                                    startContent={<LayoutGrid size={20} />}
                                >
                                    Lista
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>

                    {cargando ? (
                        <div className="flex justify-center py-20">
                            <Spinner size="lg" label="Preparando simulación..." color="primary" labelColor="primary" />
                        </div>
                    ) : (
                        <div className="mt-8 flex flex-col pt-4 relative">

                            {/* ── Historial ── */}
                            <HistorialAcademico
                                historialSemestres={historialSemestres}
                                openedAccordions={openedAccordions}
                                setOpenedAccordions={setOpenedAccordions}
                                descargandoPDF={descargandoPDF}
                                plan={plan}
                            />

                            {/* ── Estado actual o finalizado ── */}
                            <div>
                                {simulacionTerminada ? (
                                    <CarreraFinalizada
                                        anioActual={anioActual}
                                        plan={plan}
                                        historialSemestres={historialSemestres}
                                        progresoSimulado={progresoSimulado}
                                        progresoBase={progresoBase}
                                        cuatri={cuatri}
                                        simulacionTerminada={simulacionTerminada}
                                        onGuardarOpen={onGuardarOpen}
                                        handleDownloadPDF={handleDownloadPDF}
                                        descargandoPDF={descargandoPDF}
                                    />
                                ) : (
                                    <>
                                        {/* Card "Simulando Ahora" */}
                                        <SimulandoAhora cuatri={cuatri} anioActual={anioActual} />

                                        {viewMode === 'lista' ? (
                                            <>
                                                {/* Botones de marcar/desmarcar */}
                                                <div className="flex flex-col sm:flex-row gap-2 justify-end mb-4">
                                                    <Button
                                                        variant="flat" color="success" size="sm" className="font-medium"
                                                        onPress={() => marcarTodasEnPantalla('Cursado')}
                                                        startContent={<i className="fa-solid fa-check-double" />}
                                                        isDisabled={materiasCursables.length === 0}
                                                    >
                                                        Seleccionar Todas
                                                    </Button>
                                                    <Button
                                                        variant="flat" color="danger" size="sm" className="font-medium"
                                                        onPress={() => marcarTodasEnPantalla('No Cursado')}
                                                        startContent={<i className="fa-solid fa-rotate-left" />}
                                                        isDisabled={materiasCursables.length === 0}
                                                    >
                                                        Quitar Todas
                                                    </Button>                                                </div>

                                                {/* Grilla de materias */}
                                                {materiasCursables.length === 0 && materiasBloqueadas.length === 0 ? (
                                                    <div className="p-8 text-center text-foreground/80 bg-default-50 rounded-2xl border-2 border-dashed border-default-200">
                                                        <i className="fa-regular fa-folder-open text-4xl mb-3 text-default-300" />
                                                        <p>No tienes materias disponibles para este cuatrimestre.</p>
                                                        <p className="text-xs mt-1">Sigue avanzando para desbloquear nuevas asignaturas.</p>
                                                    </div>
                                                ) : (
                                                    <MateriasSimulador
                                                        materiasCursables={materiasCursables}
                                                        materiasBloqueadas={materiasBloqueadas}
                                                        cambioDeEstado={cambioDeEstado}
                                                        progreso={progresoSimulado}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            /* Vista de Grafo */
                                            <div className="animate-in fade-in zoom-in-95 duration-500 relative">
                                                {/* Botones de navegación flotantes para el grafo */}
                                                <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-3">
                                                    <Button
                                                        onPress={handleAnterior}
                                                        isDisabled={!estadoAnterior}
                                                        color="primary" variant="flat" size="lg" isIconOnly
                                                        className="shadow-xl backdrop-blur-md rounded-2xl w-14 h-14 border border-primary/20"
                                                        title="Paso Anterior"
                                                    >
                                                        <i className="fa-solid fa-chevron-left text-xl" />
                                                    </Button>
                                                    <Button
                                                        onPress={() => handleSiguiente(materiasCursables)}
                                                        isDisabled={!estadoSiguiente}
                                                        color="primary" variant="shadow" size="lg" isIconOnly
                                                        className="shadow-xl rounded-2xl w-14 h-14 transition-transform hover:scale-110 active:scale-95"
                                                        title="Siguiente Paso"
                                                    >
                                                        <i className="fa-solid fa-chevron-right text-xl" />
                                                    </Button>
                                                </div>

                                                <MateriasGrafo
                                                    materias={materias}
                                                    onNodeClick={handleNodeClick}
                                                    projection={projection}
                                                />
                                                <p className="text-xs text-foreground/50 mt-2 italic text-center">
                                                    * Solo puedes marcar materias disponibles en el cuatrimestre actual.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Barra Anterior / Siguiente */}
                                <Card className="mt-8 bg-background/60 backdrop-blur-md border border-default-200 shadow-sm rounded-2xl">
                                    <CardBody className="flex flex-col md:flex-row justify-between items-center p-4 md:p-6 gap-4">
                                        <Button
                                            onPress={handleAnterior}
                                            isDisabled={!estadoAnterior}
                                            variant="flat" color="primary"
                                            startContent={<i className="fa-solid fa-chevron-left" />}
                                            className="w-full md:w-auto font-medium"
                                        >
                                            Anterior
                                        </Button>

                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-xs md:text-sm text-foreground/80 font-medium tracking-wider uppercase mb-1">Progreso</span>
                                            <span className="text-sm md:text-base font-semibold text-foreground">
                                                {simulacionTerminada ? 'Simulación finalizada' : 'Continúa configurando el semestre'}
                                            </span>
                                        </div>

                                        <Button
                                            onPress={() => handleSiguiente(materiasCursables)}
                                            isDisabled={!estadoSiguiente}
                                            variant="shadow" color="primary"
                                            endContent={<i className="fa-solid fa-chevron-right" />}
                                            className="w-full md:w-auto font-bold transition-transform hover:scale-105"
                                            aria-label="Siguiente cuatrimestre"
                                        >
                                            Siguiente
                                        </Button>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Simulador