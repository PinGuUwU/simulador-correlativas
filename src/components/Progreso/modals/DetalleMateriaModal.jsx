import {
    Card, CardHeader, Chip, Divider,
    Drawer, DrawerBody, DrawerContent,
    Button, Input, Select, SelectItem
} from "@heroui/react";
import materiasUtils from "../../../utils/Progreso/materiasUtils";
import regularidadUtils from "../../../utils/Progreso/regularidadUtils";
import ConsejoMateria from "./ConsejoMateria";
import useDetalleMateria from "../../../hooks/Progreso/useDetalleMateria";
import { useState } from "react";

const ESTADOS_CON_HISTORIAL = ['Regular', 'Libre', 'Aprobado'];

function DetalleMateriaModal({ isOpen, infoMateria, materias, progreso, progresoDetalles, setProgresoDetalles, plan, onOpenChange, cambioDeEstado }) {

    const estadoActual = infoMateria ? progreso[infoMateria.codigo] : null;
    const [showHistorial, setShowHistorial] = useState(false);

    // Lógica de negocio extraída al hook
    const {
        showNotaForm, setShowNotaForm,
        notaVal, setNotaVal,
        estadoVal, setEstadoVal,
        fechaIntento, setFechaIntento,
        notaError,
        editingHistorialIndex, setEditingHistorialIndex,
        editingIntentoIndex, setEditingIntentoIndex,
        handleCambioAnio,
        handleCambioNotaCursada,
        handleGuardarIntento,
        handleEliminarIntento,
        handleUpdateIntento,
        handleUpdateCursadaHistorial,
        handleEliminarCursadaHistorial
    } = useDetalleMateria(
        infoMateria,
        progresoDetalles,
        setProgresoDetalles,
        plan,
        progreso,
        cambioDeEstado,
        estadoActual
    );

    if (!infoMateria) return null;

    const estiloEstado = (estado) => {
        switch (estado) {
            case "Aprobado": return "success"
            case "Promocionado": return "secondary"
            case "Cursando": return "secondary"
            case "Disponible": return "primary"
            case "Regular": return "warning"
            case "Libre": return "danger"
            case "Bloqueado": default: return "default"
        }
    }

    const detallesLocales = progresoDetalles?.[infoMateria.codigo] || {};
    const statusPlanFallback = { cuatrimestresRestantes: 5, intentosRestantes: 5 };
    let statusPlan = statusPlanFallback;
    try {
        statusPlan = regularidadUtils.obtenerPlanificacionInstancias(detallesLocales.fechaRegularidad, detallesLocales.intentosFinal) ?? statusPlanFallback;
    } catch (_) { /* datos inválidos */ }

    const mostrarModuloRegularidad = ESTADOS_CON_HISTORIAL.includes(estadoActual);
    const intentosFinal = detallesLocales.intentosFinal || [];
    const anioActualReg = detallesLocales.fechaRegularidad?.anio || "";
    const cuatriAsignado = infoMateria?.cuatrimestre ? (Number(infoMateria.cuatrimestre) % 2 === 0 ? 2 : 1) : 1;

    return (
        <Drawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement={typeof window !== 'undefined' && window.innerWidth < 1024 ? "bottom" : "right"}
            size={typeof window !== 'undefined' && window.innerWidth < 1024 ? "full" : "xl"}
            hideCloseButton
            classNames={{
                wrapper: "z-[200]",
                base: "max-lg:h-screen"
            }}
        >
            <DrawerContent className="bg-background">
                {(onClose) => (
                    <div className="flex flex-col h-full relative overflow-hidden">
                        {/* Indicador móvil */}
                        <div className="lg:hidden w-full flex justify-center py-3 shrink-0">
                            <div className="w-12 h-1.5 bg-default-300 rounded-full opacity-50" />
                        </div>

                        {/* Botón cerrar */}
                        <div className="absolute top-2 right-4 z-50">
                            <Button
                                isIconOnly
                                variant="light"
                                radius="full"
                                onPress={onClose}
                                className="text-default-500 hover:bg-default-100"
                            >
                                <i className="fa-solid fa-xmark text-xl" />
                            </Button>
                        </div>

                        <DrawerBody className="flex-1 px-4 sm:px-6 pb-12 gap-0 overflow-y-auto">
                            <div className="flex flex-col gap-1 pt-4 pb-1">
                                <h3 className="text-xl font-medium text-foreground px-1">Detalle de Materia</h3>
                                <Divider className="my-1" />

                                <div className="flex flex-col px-1 pt-3">
                                    <div className="flex items-center gap-2 text-foreground/80 mb-1">
                                        <i className="fa-solid fa-book-open text-base" />
                                        <span className="text-sm font-medium tracking-wide">{infoMateria.mostrarCodigo === false ? '---' : infoMateria.codigo}</span>
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight leading-tight">
                                        {infoMateria.nombre}
                                    </h2>

                                    <div className="flex flex-col m-2">
                                        <div className="flex items-center gap-3 text-sm text-default-600 mb-5 justify-center flex-wrap">
                                            <Chip size="sm" color={estiloEstado(estadoActual)} variant="flat" className="capitalize font-medium">
                                                {estadoActual}
                                            </Chip>
                                            <Chip variant="dot" size="sm">{infoMateria.anio}° Año</Chip>
                                            <Chip variant="dot" size="sm">Cuatri {infoMateria.cuatrimestre}</Chip>
                                        </div>
                                        <div className="flex flex-row gap-4 justify-center items-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] uppercase font-bold text-default-400">Horas semanales</span>
                                                <span className="text-sm font-bold">{infoMateria.horas_semanales}h</span>
                                            </div>
                                            <Divider orientation="vertical" className="h-4" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] uppercase font-bold text-default-400">Horas Totales</span>
                                                <span className="text-sm font-bold">{infoMateria.horas_totales}h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 mt-6">
                                {mostrarModuloRegularidad && (
                                    <Card className="bg-default-50 border border-default-200 shadow-sm p-4 overflow-visible">
                                        <h4 className="font-bold text-foreground mb-4 text-base flex items-center gap-2">
                                            <i className="fa-solid fa-graduation-cap text-primary" />
                                            Historial Académico
                                        </h4>
                                        <div className="flex flex-col gap-5">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-default-500 uppercase tracking-wide">Año de Regularización</label>
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        type="number" variant="faded" color="warning" size="sm" className="flex-1"
                                                        value={String(anioActualReg)} onChange={handleCambioAnio}
                                                    />
                                                    <Chip size="sm" variant="flat" color="default">{cuatriAsignado}° Cuatri</Chip>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-default-500 uppercase tracking-wide">Nota de Cursada</label>
                                                <Input
                                                    type="number" placeholder="0 - 10" variant="faded" color="warning" size="sm"
                                                    value={detallesLocales.notaRegularizacion != null ? String(detallesLocales.notaRegularizacion) : ""}
                                                    onValueChange={handleCambioNotaCursada}
                                                />
                                            </div>

                                            <Divider />

                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-xs font-semibold text-default-500 uppercase tracking-wide block">Intentos de Examen Final</span>
                                                        <span className={`text-xs font-bold ${statusPlan.intentosRestantes > 1 ? "text-success" : "text-danger"}`}>
                                                            {statusPlan.intentosRestantes} intento{statusPlan.intentosRestantes !== 1 ? 's' : ''} restante{statusPlan.intentosRestantes !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    {intentosFinal.length < 5 && !intentosFinal.some(i => i.estado === 'aprobado') && (
                                                        <Button size="sm" color="primary" variant="flat" onPress={() => setShowNotaForm(!showNotaForm)}>
                                                            {showNotaForm ? 'Cancelar' : '+ Agregar'}
                                                        </Button>
                                                    )}
                                                </div>

                                                {showNotaForm && (
                                                    <div className="flex flex-col gap-3 p-4 bg-default-100/50 rounded-xl border border-default-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <Input type="date" label="Fecha" labelPlacement="outside" value={fechaIntento} onChange={(e) => setFechaIntento(e.target.value)} />
                                                            <div className="flex gap-2 items-end">
                                                                <Select label="Estado" labelPlacement="outside" selectedKeys={[estadoVal]} onChange={(e) => setEstadoVal(e.target.value)} className="flex-2">
                                                                    <SelectItem key="rendido">Rindió</SelectItem>
                                                                    <SelectItem key="ausente">Ausente</SelectItem>
                                                                </Select>
                                                                {estadoVal === 'rendido' && <Input type="number" label="Nota" labelPlacement="outside" placeholder="0-10" value={notaVal} onValueChange={setNotaVal} isInvalid={!!notaError} errorMessage={notaError} className="flex-1" />}
                                                            </div>
                                                        </div>
                                                        <Button size="md" color="secondary" className="w-full font-bold" onPress={handleGuardarIntento}>Registrar</Button>
                                                    </div>
                                                )}

                                                <div className="flex gap-1.5 w-full">
                                                    {[0, 1, 2, 3, 4].map(i => (
                                                        <div key={i} className={`flex-1 h-4 rounded-full ${intentosFinal[i] ? (intentosFinal[i].estado === 'aprobado' ? "bg-success" : (intentosFinal[i].estado === 'ausente' ? "bg-warning" : "bg-danger")) : "bg-default-200"}`} />
                                                    ))}
                                                </div>
                                                <div className="flex justify-between text-[10px] text-default-400 font-bold px-0.5">
                                                    <span>1°</span><span>2°</span><span>3°</span><span>4°</span><span>5°</span>
                                                </div>

                                                <div className="flex flex-col gap-1.5 mt-2">
                                                    {intentosFinal.map((intento, i) => (
                                                        <div key={i} className="flex items-center justify-between text-xs text-default-600 bg-default-100/50 rounded-lg pl-3 pr-1 py-1 group">
                                                            {editingIntentoIndex === i ? (
                                                                <div className="flex-1 flex flex-col gap-2 w-full py-1">
                                                                    <div className="flex gap-2 items-center w-full">
                                                                        <Input type="date" size="sm" defaultValue={intento.fecha} id={`edit-fecha-${i}`} className="flex-3" aria-label="Fecha del intento" />
                                                                        <Select size="sm" defaultSelectedKeys={[intento.estado === 'ausente' ? 'ausente' : 'rendido']} id={`edit-estado-${i}`} className="flex-3 min-w-[110px]" aria-label="Estado del examen">
                                                                            <SelectItem key="rendido">Rindió</SelectItem>
                                                                            <SelectItem key="ausente">Ausente</SelectItem>
                                                                        </Select>
                                                                        <Input type="number" size="sm" defaultValue={intento.nota != null ? String(intento.nota) : ""} placeholder="Nota" id={`edit-nota-${i}`} className="flex-1 w-14" aria-label="Nota del examen" />
                                                                    </div>
                                                                    <div className="flex justify-end gap-2 w-full">
                                                                        <Button size="sm" color="success" variant="flat" onPress={() => {
                                                                            const eFecha = document.getElementById(`edit-fecha-${i}`).value;
                                                                            const eEstadoVisual = document.getElementById(`edit-estado-${i}`).value;
                                                                            const eNota = document.getElementById(`edit-nota-${i}`).value;
                                                                            const finalNota = eEstadoVisual === 'ausente' ? null : Number(eNota);
                                                                            const finalEstado = eEstadoVisual === 'ausente' ? 'ausente' : (finalNota >= 4 ? 'aprobado' : 'reprobado');
                                                                            handleUpdateIntento(i, { fecha: eFecha, estado: finalEstado, nota: finalNota });
                                                                        }}>
                                                                            <i className="fa-solid fa-check mr-1" /> Guardar
                                                                        </Button>
                                                                        <Button size="sm" color="default" variant="flat" onPress={() => setEditingIntentoIndex(null)}>
                                                                            Cancelar
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex-1 flex justify-between mr-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold">{i + 1}° intento</span>
                                                                            <span className="text-[10px] text-default-400">{intento.fecha || 'Sin fecha'}</span>
                                                                        </div>
                                                                        <span className={intento.estado === 'aprobado' ? "text-success font-black" : (intento.estado === 'reprobado' ? "text-danger font-black" : "text-warning font-black")}>
                                                                            {intento.estado === 'ausente' ? 'Ausente (Nota: -)' : `Nota: ${intento.nota}`}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                                        <Button isIconOnly size="sm" variant="light" color="secondary" className="h-7 w-7" onPress={() => setEditingIntentoIndex(i)}>
                                                                            <i className="fa-solid fa-pen text-[10px]" />
                                                                        </Button>
                                                                        <Button isIconOnly size="sm" variant="light" color="danger" className="h-7 w-7" onPress={() => handleEliminarIntento(i)}>
                                                                            <i className="fa-solid fa-trash-can text-[10px]" />
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {estadoActual === 'Aprobado' && detallesLocales.notaFinal != null && (
                                                <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-xl px-4 py-3">
                                                    <span className="text-sm font-bold text-success-700">Nota Final</span>
                                                    <Chip color="success" variant="flat" size="lg" className="font-black text-lg">{detallesLocales.notaFinal}</Chip>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )}

                                {detallesLocales.historial && detallesLocales.historial.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <Button variant="flat" size="sm" className="justify-between px-3 h-10 font-bold text-default-600" onPress={() => setShowHistorial(!showHistorial)} endContent={<i className={`fa-solid fa-chevron-${showHistorial ? 'up' : 'down'} text-xs`} />}>
                                            <div className="flex items-center gap-2">
                                                <i className="fa-solid fa-clock-rotate-left text-primary" />
                                                <span className="text-xs uppercase tracking-wider">Historial de Cursadas ({detallesLocales.historial.length})</span>
                                            </div>
                                        </Button>
                                        {showHistorial && (
                                            <div className="flex flex-col gap-3">
                                                {[...detallesLocales.historial].reverse().map((cursada, idx) => {
                                                    const actualIdx = detallesLocales.historial.length - 1 - idx;
                                                    return (
                                                        <Card key={idx} className="bg-default-50 border border-default-200 shadow-none p-4 relative group">
                                                            {editingHistorialIndex === actualIdx ? (
                                                                <div className="flex flex-col gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Editando Cursada #{detallesLocales.historial.length - idx}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <Input 
                                                                            label="Año" 
                                                                            size="sm" 
                                                                            variant="faded" 
                                                                            type="number"
                                                                            defaultValue={cursada.fechaRegularidad?.anio || ""} 
                                                                            id={`edit-hist-anio-${actualIdx}`}
                                                                        />
                                                                        <Input 
                                                                            label="Nota Cursada" 
                                                                            size="sm" 
                                                                            variant="faded" 
                                                                            type="number"
                                                                            defaultValue={cursada.notaRegularizacion || ""} 
                                                                            id={`edit-hist-nota-${actualIdx}`}
                                                                        />
                                                                    </div>
                                                                    {cursada.notaFinal && (
                                                                        <Input 
                                                                            label="Nota Final" 
                                                                            size="sm" 
                                                                            variant="faded" 
                                                                            type="number"
                                                                            defaultValue={cursada.notaFinal} 
                                                                            id={`edit-hist-final-${actualIdx}`}
                                                                        />
                                                                    )}
                                                                    <div className="flex justify-end gap-2 mt-2">
                                                                        <Button size="sm" color="success" variant="flat" onPress={() => {
                                                                            const eAnio = document.getElementById(`edit-hist-anio-${actualIdx}`).value;
                                                                            const eNota = document.getElementById(`edit-hist-nota-${actualIdx}`).value;
                                                                            const eFinal = document.getElementById(`edit-hist-final-${actualIdx}`)?.value;
                                                                            
                                                                            handleUpdateCursadaHistorial(actualIdx, {
                                                                                ...cursada,
                                                                                fechaRegularidad: {
                                                                                    ...cursada.fechaRegularidad,
                                                                                    anio: Number(eAnio)
                                                                                },
                                                                                notaRegularizacion: eNota !== "" ? Number(eNota) : null,
                                                                                ...(eFinal !== undefined && { notaFinal: eFinal !== "" ? Number(eFinal) : null })
                                                                            });
                                                                        }}>
                                                                            Guardar
                                                                        </Button>
                                                                        <Button size="sm" variant="flat" onPress={() => setEditingHistorialIndex(null)}>
                                                                            Cancelar
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button isIconOnly size="sm" variant="flat" className="h-6 w-6" onPress={() => setEditingHistorialIndex(actualIdx)}><i className="fa-solid fa-pen text-[10px]" /></Button>
                                                                        <Button isIconOnly size="sm" variant="flat" color="danger" className="h-6 w-6" onPress={() => handleEliminarCursadaHistorial(actualIdx)}><i className="fa-solid fa-trash-can text-[10px]" /></Button>
                                                                    </div>
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Cursada #{detallesLocales.historial.length - idx}</span>
                                                                            <span className="text-xs font-bold text-foreground/70">{cursada.fechaRegularidad?.anio || 'Año N/A'} • {cursada.fechaRegularidad?.cuatrimestre}° Cuatri</span>
                                                                        </div>
                                                                        <Chip size="sm" color={estiloEstado(cursada.estadoFinal)} variant="flat" className="h-6 font-bold text-[10px]">Finalizó: {cursada.estadoFinal}</Chip>
                                                                    </div>
                                                                    <div className="flex justify-between items-center bg-default-100/50 rounded-lg px-3 py-2 border border-default-100">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[9px] text-default-400 font-bold uppercase">Nota Cursada</span>
                                                                            <span className="text-sm font-bold text-default-700">{cursada.notaRegularizacion || '-'}</span>
                                                                        </div>
                                                                        {cursada.notaFinal && (
                                                                            <div className="flex flex-col items-end">
                                                                                <span className="text-[9px] text-success-500 font-bold uppercase">Nota Final</span>
                                                                                <span className="text-sm font-black text-success-700">{cursada.notaFinal}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </Card>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <p className="font-bold mb-2 text-sm text-default-500 uppercase tracking-wide">Materias Correlativas</p>
                                    <div className='py-1'>
                                        {materiasUtils.buscarMateriasCorrelativas(infoMateria.correlativas, materias, progreso).length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                {materiasUtils.buscarMateriasCorrelativas(infoMateria.correlativas, materias, progreso).map((m, index) => (
                                                    <Card className='border border-default-200 shadow-none' key={index}>
                                                        <CardHeader className="py-2 flex justify-between items-center w-full">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-default-700 text-sm">{m.nombre}</span>
                                                                <span className="text-xs text-default-400 font-bold uppercase">{m.codigo}</span>
                                                            </div>
                                                            <Chip size="sm" color={estiloEstado(progreso[m.codigo])} variant="flat">{progreso[m.codigo]}</Chip>
                                                        </CardHeader>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className='text-foreground/70 italic bg-default-100 px-3 py-2 rounded-lg text-sm'>
                                                <i className="fa-solid fa-circle-check text-success mr-2" />
                                                No requiere correlativas previas
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <ConsejoMateria estadoActual={estadoActual} statusPlan={statusPlan} detallesLocales={detallesLocales} infoMateria={infoMateria} />
                            </div>
                        </DrawerBody>
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-background to-transparent pointer-events-none z-20" />
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
}

export default DetalleMateriaModal;