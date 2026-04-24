import React from 'react'
import { Button, Accordion, AccordionItem, Card, CardBody, Chip } from '@heroui/react'
import tituloIntermedioUtils from '../../utils/Progreso/tituloIntermedioUtils'

/**
 * Muestra el historial de semestres completados como una línea de tiempo con acordeones.
 */
function HistorialAcademico({ historialSemestres, openedAccordions, setOpenedAccordions, descargandoPDF, plan, materias }) {
    if (historialSemestres.length === 0) return null

    const tituloIntermedioNombre = tituloIntermedioUtils.getTituloIntermedioNombre(plan);
    const materiasIntermedio = tituloIntermedioUtils.getMateriasIntermedio(plan, materias);

    // Encontrar en qué índice de historial se alcanza el título intermedio
    let indiceIntermedio = -1;
    if (materiasIntermedio.length > 0) {
        for (let i = 0; i < historialSemestres.length; i++) {
            const snap = historialSemestres[i].progresoSnapshot;
            // Convertimos el progreso del simulador (Cursado/No Cursado) al formato esperado por la utilidad (Aprobado/Promocionado)
            // O adaptamos la utilidad para que acepte un mapeo de estados.
            // En el simulador usamos 'Cursado'.
            const mappedProgreso = {};
            Object.keys(snap).forEach(key => {
                if (snap[key] === 'Cursado') mappedProgreso[key] = 'Aprobado';
            });

            const { completadas, totales } = tituloIntermedioUtils.calcularProgresoIntermedio(materiasIntermedio, mappedProgreso);
            if (completadas === totales) {
                indiceIntermedio = i;
                break;
            }
        }
    }

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
                                className={`absolute -left-[27px] top-6 ${idx === indiceIntermedio ? 'bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--heroui-primary-500),0.5)]' : 'bg-success'} text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm ring-4 ring-background z-10`}
                                data-html2canvas-ignore
                            >
                                <i className={`fa-solid ${idx === indiceIntermedio ? 'fa-graduation-cap' : 'fa-check'}`} />
                            </div>

                            {/* Aviso de Título Intermedio */}
                            {idx === indiceIntermedio && (
                                <div className="absolute -left-[40px] -top-10 z-20 w-full flex justify-start pointer-events-none">
                                    <div className="bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-left-4 duration-500 pointer-events-auto">
                                        <i className="fa-solid fa-graduation-cap" />
                                        <span>¡Alcanzaste el {tituloIntermedioNombre}!</span>
                                    </div>
                                </div>
                            )}

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
                                                {item.esImportado && (
                                                    <Chip 
                                                        size="sm" 
                                                        variant="flat" 
                                                        color="secondary" 
                                                        className="h-5 text-[9px] font-black uppercase tracking-tighter"
                                                        startContent={<i className="fa-solid fa-cloud-arrow-down mr-1" />}
                                                    >
                                                        Importado
                                                    </Chip>
                                                )}
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
                                    <div className={`grid ${descargandoPDF ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-3 px-2 pb-6`}>
                                        {item.materiasDelSemestre.map(materia => {
                                            const isCursado = item.progresoSnapshot[materia.codigo] === 'Cursado';
                                            return (
                                                <Card
                                                    key={materia.codigo}
                                                    className={`relative overflow-hidden border-none shadow-sm transition-all duration-300 hover:shadow-md ${isCursado ? 'bg-success/10' : 'bg-warning/10'}`}
                                                >
                                                    {/* Barra de acento lateral */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCursado ? 'bg-success' : 'bg-warning'}`} />

                                                    <CardBody className="p-2.5 pl-4 sm:pl-5 flex flex-row items-center gap-3 sm:gap-4 overflow-hidden">
                                                        <div className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center shrink-0 ${isCursado ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`} data-html2canvas-ignore>
                                                            <i className={`fa-regular  ${isCursado ? 'fa-circle-check' : 'fa-clock'} text-lg`} />
                                                        </div>

                                                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                            <div className="flex justify-between items-center w-full">
                                                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-none whitespace-nowrap">
                                                                    {materia.mostrarCodigo === false ? '---' : materia.codigo}
                                                                </span>
                                                                <div className='sm:hidden' data-html2canvas-ignore>
                                                                    <i className={`fa-regular ${isCursado ? 'fa-circle-check text-success' : 'fa-clock text-warning'} text-[10px]`} />
                                                                </div>
                                                            </div>
                                                            <h4 className="text-xs sm:text-sm font-bold text-foreground/80 leading-tight">
                                                                {materia.nombre}
                                                            </h4>
                                                            <div className="flex gap-3 mt-0.5 text-[9px] sm:text-[10px] font-medium text-foreground/50">
                                                                {materia.horas_totales > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        <i data-html2canvas-ignore className="fa-regular fa-clock" /> {materia.horas_totales}h tot.
                                                                    </span>
                                                                )}
                                                                {materia.horas_semanales > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        <i data-html2canvas-ignore className="fa-solid fa-calendar-week" /> {materia.horas_semanales}h/sem
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            );
                                        })}
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
