import React from 'react'
import { Button, Accordion, AccordionItem, Card } from '@heroui/react'

/**
 * Muestra el historial de semestres completados como una línea de tiempo con acordeones.
 */
function HistorialAcademico({ historialSemestres, openedAccordions, setOpenedAccordions, descargandoPDF, plan }) {
    if (historialSemestres.length === 0) return null

    return (
        <div
            id="historial-container"
            className={`flex flex-col mb-8 relative px-6 md:px-10 pb-4 bg-background border border-default-100/50 rounded-3xl m-0 ${descargandoPDF ? 'w-[800px] max-w-none mx-0' : 'w-full max-w-5xl mx-auto'}`}
        >
            {/* Encabezado del PDF (solo visible al capturar) */}
            {descargandoPDF && (
                <div className="w-full text-center py-6 mb-4 border-b-2 border-primary/20">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Registro de Avance Universitario</h1>
                    <h2 className="text-lg font-bold text-primary mt-1 uppercase tracking-widest">
                        Licenciatura en Sistemas — Plan {plan}
                    </h2>
                </div>
            )}

            {/* Línea vertical de la timeline */}
            <div
                className={`absolute top-0 bottom-0 left-[11px] w-[2px] bg-default-200 ${descargandoPDF ? 'top-[150px]' : ''}`}
                data-html2canvas-ignore
            />

            {/* Barra de acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3" data-html2canvas-ignore>
                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-regular fa-clock" /> Historial Académico
                </h3>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        size="sm" variant="flat" color="primary"
                        onPress={() => setOpenedAccordions(new Set(historialSemestres.map((_, i) => String(i))))}
                        className="font-medium flex-1 sm:flex-none"
                    >
                        Mostrar Todos
                    </Button>
                    <Button
                        size="sm" variant="flat" color="danger"
                        onPress={() => setOpenedAccordions(new Set())}
                        className="font-medium flex-1 sm:flex-none"
                    >
                        Ocultar Todos
                    </Button>
                </div>
            </div>

            {/* Lista de semestres */}
            <div className="flex flex-col gap-6">
                {historialSemestres.map((item, idx) => {
                    const materiasCursadasReales = item.materiasDelSemestre.filter(
                        m => item.progresoSnapshot[m.codigo] === 'Cursado' && item.progresoBaseSnapshot[m.codigo] !== 'Cursado'
                    )
                    const totalSemestre = item.materiasDelSemestre.length
                    let horasTotales = 0, horasSemanales = 0
                    materiasCursadasReales.forEach(m => {
                        horasTotales += Number(m.horas_totales) || 0
                        horasSemanales += Number(m.horas_semanales) || 0
                    })

                    return (
                        <div key={idx} className="relative">
                            {/* Nodo de la timeline */}
                            <div
                                className="absolute -left-[27px] top-6 bg-success text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm ring-4 ring-background z-10"
                                data-html2canvas-ignore
                            >
                                <i className="fa-solid fa-check" />
                            </div>

                            <Accordion
                                selectionMode="multiple"
                                selectedKeys={openedAccordions.has(String(idx)) ? [String(idx)] : []}
                                onSelectionChange={(keys) => {
                                    setOpenedAccordions(prev => {
                                        const next = new Set(prev)
                                        if (keys.has(String(idx))) next.add(String(idx))
                                        else next.delete(String(idx))
                                        return next
                                    })
                                }}
                                className="bg-background/80 backdrop-blur-md rounded-2xl border border-default-100 shadow-sm w-full"
                            >
                                <AccordionItem
                                    key={String(idx)}
                                    aria-label={`Completado ${item.cuatri}º Cuatrimestre`}
                                    title={
                                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mr-2 py-0.5 w-full">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground text-sm sm:text-lg tracking-tight">
                                                    {item.cuatri}º Cuatrimestre <span className="text-foreground/30 mx-1">•</span> Año {item.anioActual}
                                                </span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs text-foreground/80 font-bold bg-default-200/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                                {materiasCursadasReales.length} de {totalSemestre}
                                            </span>
                                            {(horasTotales > 0 || horasSemanales > 0) && (
                                                <div className="w-full flex gap-3 text-[11px] sm:text-xs font-medium text-foreground/50 mt-0.5">
                                                    {horasTotales > 0 && (
                                                        <span className="flex items-center gap-1 whitespace-nowrap">
                                                            <i data-html2canvas-ignore className="fa-regular fa-clock" /> {horasTotales}h totales
                                                        </span>
                                                    )}
                                                    {horasSemanales > 0 && (
                                                        <span className="flex items-center gap-1 whitespace-nowrap">
                                                            <i data-html2canvas-ignore className="fa-solid fa-calendar-week" /> {horasSemanales}h/sem
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    }
                                >
                                    <div className={`grid ${descargandoPDF ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-3 px-2 pb-4`}>
                                        {item.materiasDelSemestre.map(materia => (
                                            <Card
                                                key={materia.codigo}
                                                className={`p-3 border ${item.progresoSnapshot[materia.codigo] === 'Cursado' ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'} shadow-none`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <i
                                                        data-html2canvas-ignore
                                                        className={`fa-regular ${item.progresoSnapshot[materia.codigo] === 'Cursado' ? 'fa-circle-check text-success' : 'fa-clock text-warning'} text-lg`}
                                                    />
                                                    <span className="text-sm font-medium text-foreground/80">{materia.nombre}</span>
                                                </div>
                                            </Card>
                                        ))}
                                        {item.materiasDelSemestre.length === 0 && (
                                            <div className="col-span-full text-sm text-foreground/60 p-2">No hubo materias disponibles.</div>
                                        )}
                                    </div>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default HistorialAcademico
