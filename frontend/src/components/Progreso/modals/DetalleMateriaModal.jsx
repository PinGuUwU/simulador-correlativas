import {
    Card, CardHeader, Chip, Divider,
    Drawer, DrawerBody, DrawerContent, DrawerHeader,
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
        handleCambioAnio,
        handleCambioNotaCursada,
        handleGuardarIntento,
        handleEliminarIntento,
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

    const estiloEstado = (estado) => {
        switch (estado) {
            case "Aprobado": return "success"
            case "Disponible": return "primary"
            case "Regular": return "warning"
            case "Libre": return "danger"
            case "Bloqueado": default: return "default"
        }
    }

    if (!infoMateria) return null;

    const detallesLocales = progresoDetalles?.[infoMateria.codigo] || {};
    const statusPlanFallback = { cuatrimestresRestantes: 5, intentosRestantes: 5 };
    let statusPlan = statusPlanFallback;
    try {
        statusPlan = regularidadUtils.obtenerPlanificacionInstancias(detallesLocales.fechaRegularidad, detallesLocales.intentosFinal) ?? statusPlanFallback;
    } catch (_) { /* datos de regularidad inválidos */ }
    const mostrarMóduloRegularidad = ESTADOS_CON_HISTORIAL.includes(estadoActual);
    const intentosFinal = detallesLocales.intentosFinal || [];
    const arr5 = [0, 1, 2, 3, 4];
    const anioActualReg = detallesLocales.fechaRegularidad?.anio || "";
    const cuatriAsignado = infoMateria?.cuatrimestre ? (Number(infoMateria.cuatrimestre) % 2 === 0 ? 2 : 1) : 1;

    return (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="bottom" size="5xl">
            <DrawerContent className="pb-4 max-h-[92dvh] overflow-hidden">
                {() => (
                    <>
                        <DrawerHeader className="flex flex-col gap-1 pb-1">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-medium text-foreground px-1">Detalle de Materia</h3>
                                <Divider className="my-1" />
                            </div>

                            <div className="flex flex-col px-1 pt-3">
                                <div className="flex items-center gap-2 text-foreground/80 mb-1">
                                    <i className="fa-solid fa-book-open text-base" />
                                    <span className="text-sm font-medium tracking-wide">{infoMateria.codigo}</span>
                                </div>

                                <h2 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight leading-tight">
                                    {infoMateria.nombre}
                                </h2>

                                <div className="flex flex-col m-2">
                                    <div className="flex items-center gap-4 text-sm text-default-600 mb-5 justify-center flex-wrap">
                                        <Chip size="sm" color={estiloEstado(estadoActual)} variant="flat" className="capitalize font-medium">
                                            {estadoActual}
                                        </Chip>
                                        <span>{infoMateria.anio}° Año</span>
                                        <span>Cuatrimestre {infoMateria.cuatrimestre}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 min-[768px]:flex-row md:gap-4 justify-center items-center">
                                        <Chip>Horas semanales: {infoMateria.horas_semanales}</Chip>
                                        <Chip>Horas Totales: {infoMateria.horas_totales}</Chip>
                                    </div>
                                </div>
                            </div>
                        </DrawerHeader>

                        <DrawerBody className="gap-6 mt-2 overflow-y-auto">
                            {mostrarMóduloRegularidad && (
                                <Card className="bg-default-50 border border-default-200 shadow-sm overflow-visible p-4">
                                    <h4 className="font-bold text-foreground mb-4 text-base flex items-center gap-2">
                                        <i className="fa-solid fa-graduation-cap text-primary" />
                                        Historial Académico
                                    </h4>

                                    <div className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-default-500 uppercase tracking-wide">Año de Regularización</label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="number"
                                                    variant="faded" color="warning" size="sm" className="flex-1"
                                                    value={String(anioActualReg)}
                                                    onChange={handleCambioAnio}
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
                                                            <Select label="Estado" labelPlacement="outside" selectedKeys={[estadoVal]} onChange={(e) => setEstadoVal(e.target.value)} className="flex-[2]">
                                                                <SelectItem key="rendido" value="rendido">Rindió</SelectItem>
                                                                <SelectItem key="ausente" value="ausente">Ausente</SelectItem>
                                                            </Select>
                                                            {estadoVal === 'rendido' && <Input type="number" label="Nota" labelPlacement="outside" placeholder="0-10" value={notaVal} onValueChange={setNotaVal} isInvalid={!!notaError} errorMessage={notaError} className="flex-1" />}
                                                        </div>
                                                    </div>
                                                    <Button size="md" color="secondary" className="w-full font-bold" onPress={handleGuardarIntento}>Registrar</Button>
                                                </div>
                                            )}

                                            <div className="flex gap-1.5 w-full">
                                                {arr5.map(i => (
                                                    <div key={i} className={`flex-1 h-4 rounded-full ${intentosFinal[i] ? (intentosFinal[i].estado === 'aprobado' ? "bg-success" : (intentosFinal[i].estado === 'ausente' ? "bg-warning" : "bg-danger")) : "bg-default-200"}`} />
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-[10px] text-default-400 font-bold px-0.5">
                                                {arr5.map(i => <span key={i}>{i + 1}°</span>)}
                                            </div>

                                            <div className="flex flex-col gap-1.5 mt-2">
                                                {intentosFinal.map((intento, i) => (
                                                    <div key={i} className="flex items-center justify-between text-xs text-default-600 bg-default-100/50 rounded-lg pl-3 pr-1 py-1 group">
                                                        <div className="flex-1 flex justify-between mr-2">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold">{i + 1}° intento</span>
                                                                <span className="text-[10px] text-default-400">{intento.fecha || 'Sin fecha'}</span>
                                                            </div>
                                                            <span className={intento.estado === 'aprobado' ? "text-success font-black" : (intento.estado === 'reprobado' ? "text-danger font-black" : "text-warning font-black")}>
                                                                {intento.estado === 'ausente' ? 'Ausente' : `Nota: ${intento.nota}`}
                                                            </span>
                                                        </div>
                                                        <Button isIconOnly size="sm" variant="light" color="danger" className="h-7 w-7 opacity-20 group-hover:opacity-100" onPress={() => handleEliminarIntento(i)}>
                                                            <i className="fa-solid fa-trash-can text-[10px]" />
                                                        </Button>
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

                            {/* Historial de Cursadas */}
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
                                                const isEditing = editingHistorialIndex === actualIdx;
                                                return (
                                                    <Card key={idx} className="bg-default-50 border border-default-200 shadow-none p-4 relative group">
                                                        {!isEditing && (
                                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button isIconOnly size="sm" variant="flat" className="h-6 w-6" onPress={() => setEditingHistorialIndex(actualIdx)}>
                                                                    <i className="fa-solid fa-pen text-[10px]" />
                                                                </Button>
                                                                <Button isIconOnly size="sm" variant="flat" color="danger" className="h-6 w-6" onPress={() => handleEliminarCursadaHistorial(actualIdx)}>
                                                                    <i className="fa-solid fa-trash-can text-[10px]" />
                                                                </Button>
                                                            </div>
                                                        )}
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
                                    {(() => {
                                        const materiasCorrelativas = materiasUtils.buscarMateriasCorrelativas(infoMateria.correlativas, materias, progreso)
                                        return materiasCorrelativas.length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                {materiasCorrelativas.map((m, index) => (
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
                                            <div className='text-foreground/70 italic mt-2 bg-default-100 px-3 py-2 rounded-lg text-sm'>
                                                <i className="fa-solid fa-circle-check text-success mr-2" />
                                                No requiere correlativas previas
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>

                            <ConsejoMateria estadoActual={estadoActual} statusPlan={statusPlan} detallesLocales={detallesLocales} infoMateria={infoMateria} />
                        </DrawerBody>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default DetalleMateriaModal;