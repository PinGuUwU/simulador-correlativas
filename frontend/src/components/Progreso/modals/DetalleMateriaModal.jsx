import {
    Card, CardFooter, CardHeader, Chip, Divider,
    Drawer, DrawerBody, DrawerContent, DrawerHeader,
    Button, Input, Select, SelectItem
} from "@heroui/react";
import materiasUtils from "../../../utils/Progreso/materiasUtils";
import { useState } from "react";
import regularidadUtils from "../../../utils/Progreso/regularidadUtils";
import { useAuth } from "../../../context/AuthContext";

const ESTADOS_CON_HISTORIAL = ['Regular', 'Libre', 'Aprobado'];

function DetalleMateriaModal({ isOpen, infoMateria, materias, progreso, progresoDetalles, setProgresoDetalles, plan, onOpenChange, cambioDeEstado }) {
    const { updateAuthProgreso } = useAuth();
    const [showNotaForm, setShowNotaForm] = useState(false);
    const [notaVal, setNotaVal] = useState("");
    const [estadoVal, setEstadoVal] = useState("rendido");
    const [notaError, setNotaError] = useState("");

    const estiloEstado = (estado) => {
        switch (estado) {
            case "Aprobado": return "success"
            case "Disponible": return "primary"
            case "Regular": return "warning"
            case "Libre": return "danger"
            case "Bloqueado": default: return "default"
        }
    }

    const guardarDetalles = (nuevosDetalles) => {
        const payload = { ...progresoDetalles, [infoMateria.codigo]: nuevosDetalles };
        setProgresoDetalles(payload);
        updateAuthProgreso(plan, progreso, payload);
    }

    const handleCambioAnio = (e) => {
        const currentData = progresoDetalles[infoMateria?.codigo] || { intentosFinal: [] };
        const anioN = Number(e.target.value);
        const cuatriAuto = infoMateria?.cuatrimestre ? (Number(infoMateria.cuatrimestre) % 2 === 0 ? 2 : 1) : 1;
        guardarDetalles({
            ...currentData,
            fechaRegularidad: { anio: anioN, cuatrimestre: cuatriAuto }
        });
    }

    const handleCambioNotaCursada = (val) => {
        const currentData = progresoDetalles[infoMateria?.codigo] || { intentosFinal: [] };
        guardarDetalles({ ...currentData, notaRegularizacion: val === "" ? null : Number(val) });
    }

    const handleGuardarIntento = () => {
        setNotaError("");
        if (estadoVal === 'rendido') {
            const n = Number(notaVal);
            if (notaVal === "" || isNaN(n) || n < 0 || n > 10) {
                setNotaError("La nota debe estar entre 0 y 10");
                return;
            }
        }

        let notaParsed = estadoVal === 'rendido' ? parseInt(notaVal) : null;
        let status = estadoVal === 'rendido'
            ? (notaParsed >= 4 ? 'aprobado' : 'reprobado')
            : 'ausente';

        const currentData = progresoDetalles[infoMateria?.codigo] || { intentosFinal: [] };
        const maxIntentos = 5;
        const intentosActuales = currentData.intentosFinal || [];

        if (intentosActuales.length >= maxIntentos) return; // Ya llegó al límite

        const newIntentos = [...intentosActuales, {
            nota: notaParsed,
            estado: status,
            fecha: new Date().toISOString()
        }];

        // Guardar el intento + actualizar notaFinal si es aprobatorio
        const updatedData = {
            ...currentData,
            intentosFinal: newIntentos,
            ...(status === 'aprobado' && { notaFinal: notaParsed })
        };
        guardarDetalles(updatedData);

        setShowNotaForm(false);
        setNotaVal("");
        setEstadoVal("rendido");

        // Evaluar cambio de estado automático
        if (status === 'aprobado') {
            cambioDeEstado(infoMateria.codigo, 'Aprobado');
        } else {
            const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
                "Regular",
                currentData.fechaRegularidad,
                newIntentos
            );
            if (estadoActualizado === 'Libre') {
                cambioDeEstado(infoMateria.codigo, 'Libre');
            }
        }
    }

    // Datos calculados
    const estadoActual = infoMateria ? progreso[infoMateria.codigo] : null;
    const detallesLocales = infoMateria ? (progresoDetalles?.[infoMateria.codigo] || {}) : {};
    const statusPlan = infoMateria
        ? regularidadUtils.obtenerPlanificacionInstancias(detallesLocales.fechaRegularidad, detallesLocales.intentosFinal)
        : { cuatrimestresRestantes: 5, intentosRestantes: 5 };

    const mostrarHistorial = ESTADOS_CON_HISTORIAL.includes(estadoActual);
    const intentosFinal = detallesLocales.intentosFinal || [];
    const arr5 = [0, 1, 2, 3, 4];

    // Parsear año para el Input
    const anioActualReg = detallesLocales.fechaRegularidad?.anio || "";
    const cuatriAsignado = infoMateria?.cuatrimestre ? (Number(infoMateria.cuatrimestre) % 2 === 0 ? 2 : 1) : 1;

    return (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="pb-4">
                {() => (
                    <>
                        {infoMateria ? (
                            <>
                                {/* ── HEADER ─────────────────────────────── */}
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

                                        <h2 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">
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

                                {/* ── BODY ───────────────────────────────── */}
                                <DrawerBody className="gap-6 mt-2">

                                    {/* ── MÓDULO REGULARIDAD (visible siempre que tenga datos o sea Regular/Libre/Aprobado) */}
                                    {mostrarHistorial && (
                                        <Card className="bg-default-50 border border-default-200 shadow-sm overflow-visible p-4">
                                            <h4 className="font-bold text-foreground mb-4 text-base flex items-center gap-2">
                                                <i className="fa-solid fa-graduation-cap text-primary" />
                                                Historial Académico
                                            </h4>

                                            <div className="flex flex-col gap-5">

                                                {/* Año de regularización */}
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-semibold text-default-500 uppercase tracking-wide">Año de Regularización</label>
                                                    <div className="flex items-center gap-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="ej: 2024"
                                                            variant="faded"
                                                            color="warning"
                                                            size="sm"
                                                            className="flex-1"
                                                            value={String(anioActualReg)}
                                                            onChange={handleCambioAnio}
                                                            min="2000"
                                                            max="2100"
                                                        />
                                                        <Chip size="sm" variant="flat" color="default">
                                                            {cuatriAsignado}° Cuatri
                                                        </Chip>
                                                    </div>
                                                    {estadoActual === 'Regular' && detallesLocales.fechaRegularidad && (
                                                        <div className="text-xs text-default-500 mt-1">
                                                            Vencimiento: <span className={statusPlan.cuatrimestresRestantes > 1 ? "text-success font-bold" : "text-danger font-bold"}>
                                                                {statusPlan.cuatrimestresRestantes} cuatri. restantes
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Nota de cursada */}
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-semibold text-default-500 uppercase tracking-wide">Nota de Cursada</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0 - 10"
                                                        variant="faded"
                                                        color="warning"
                                                        size="sm"
                                                        value={detallesLocales.notaRegularizacion != null ? String(detallesLocales.notaRegularizacion) : ""}
                                                        onValueChange={handleCambioNotaCursada}
                                                        min="0"
                                                        max="10"
                                                    />
                                                </div>

                                                <Divider />

                                                {/* Intentos de examen final */}
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="text-xs font-semibold text-default-500 uppercase tracking-wide block">
                                                                Intentos de Examen Final
                                                            </span>
                                                            <span className={`text-xs font-bold ${statusPlan.intentosRestantes > 1 ? "text-success" : "text-danger"}`}>
                                                                {statusPlan.intentosRestantes} intento{statusPlan.intentosRestantes !== 1 ? 's' : ''} restante{statusPlan.intentosRestantes !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        {intentosFinal.length < 5 && (
                                                            <Button size="sm" color="primary" variant="flat" onPress={() => { setShowNotaForm(!showNotaForm); setNotaError(""); }}>
                                                                {showNotaForm ? 'Cancelar' : '+ Agregar'}
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Formulario agregar intento */}
                                                    {showNotaForm && (
                                                        <div className="flex flex-col gap-2 p-3 bg-default-100/50 rounded-xl border border-default-200 animate-in fade-in slide-in-from-top-2">
                                                            <div className="flex gap-2">
                                                                <Select
                                                                    aria-label="Estado del examen"
                                                                    size="sm"
                                                                    selectedKeys={[estadoVal]}
                                                                    onChange={(e) => setEstadoVal(e.target.value)}
                                                                >
                                                                    <SelectItem key="rendido" value="rendido">Rindió examen</SelectItem>
                                                                    <SelectItem key="ausente" value="ausente">Estuvo Ausente</SelectItem>
                                                                </Select>
                                                                {estadoVal === 'rendido' && (
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Nota (0-10)"
                                                                        size="sm"
                                                                        value={notaVal}
                                                                        onValueChange={setNotaVal}
                                                                        isInvalid={!!notaError}
                                                                        errorMessage={notaError}
                                                                        min="0"
                                                                        max="10"
                                                                    />
                                                                )}
                                                            </div>
                                                            <Button size="sm" color="secondary" className="w-full font-bold" onPress={handleGuardarIntento}>
                                                                Registrar Intento
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Barras visualizadoras */}
                                                    <div className="flex gap-1.5 w-full">
                                                        {arr5.map(i => {
                                                            const intento = intentosFinal[i];
                                                            let bgClass = "bg-default-200";
                                                            if (intento) {
                                                                if (intento.estado === 'aprobado') bgClass = "bg-success";
                                                                else if (intento.estado === 'reprobado') bgClass = "bg-danger";
                                                                else if (intento.estado === 'ausente') bgClass = "bg-warning";
                                                            }
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`flex-1 h-4 rounded-full ${bgClass} transition-colors`}
                                                                    title={intento
                                                                        ? `${i + 1}° intento — Nota: ${intento.nota ?? '-'}, ${intento.estado}`
                                                                        : `${i + 1}° intento disponible`
                                                                    }
                                                                />
                                                            )
                                                        })}
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-default-400 font-bold px-0.5">
                                                        {arr5.map(i => (
                                                            <span key={i}>{i + 1}°</span>
                                                        ))}
                                                    </div>

                                                    {/* Legenda de notas */}
                                                    {intentosFinal.length > 0 && (
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            {intentosFinal.map((intento, i) => (
                                                                <div key={i} className="flex items-center justify-between text-xs text-default-600 bg-default-100 rounded-lg px-3 py-1.5">
                                                                    <span className="font-medium">{i + 1}° intento</span>
                                                                    <span className={
                                                                        intento.estado === 'aprobado' ? "text-success font-bold" :
                                                                            intento.estado === 'reprobado' ? "text-danger font-bold" :
                                                                                "text-warning font-bold"
                                                                    }>
                                                                        {intento.estado === 'ausente' ? 'Ausente' : `Nota: ${intento.nota}`}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Nota final resumida si está aprobado */}
                                                {estadoActual === 'Aprobado' && detallesLocales.notaFinal != null && (
                                                    <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-xl px-4 py-3">
                                                        <span className="text-sm font-bold text-success-700">Nota Final</span>
                                                        <Chip color="success" variant="flat" size="lg" className="font-black text-lg">
                                                            {detallesLocales.notaFinal}
                                                        </Chip>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    )}

                                    {/* ── MÓDULO CORRELATIVAS ─────────────── */}
                                    <div>
                                        <p className="font-bold mb-2 text-sm text-default-500 uppercase tracking-wide">Materias Correlativas</p>
                                        <div className='py-1'>
                                            {infoMateria && (() => {
                                                const materiasCorrelativas = materiasUtils.buscarMateriasCorrelativas(infoMateria.correlativas, materias, progreso)
                                                if (materiasCorrelativas.length > 0) {
                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            {materiasCorrelativas.map((m, index) => {
                                                                const estilo = materiasUtils.obtenerEstiloPorEstado(progreso[m.codigo])
                                                                return (
                                                                    <Card className='border border-default-200 shadow-none' key={index}>
                                                                        <CardHeader className="py-2">
                                                                            <div className='flex justify-between items-center w-full'>
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-semibold text-default-700 text-sm">{m.nombre}</span>
                                                                                    <span className="text-xs text-default-400 font-bold uppercase">{m.codigo}</span>
                                                                                </div>
                                                                                <Chip size="sm" color={estiloEstado(progreso[m.codigo])} variant="flat">
                                                                                    <i className={`fa-solid ${estilo.icon} text-xs mr-1`} />
                                                                                    {progreso[m.codigo]}
                                                                                </Chip>
                                                                            </div>
                                                                        </CardHeader>
                                                                    </Card>
                                                                )
                                                            })}
                                                        </div>
                                                    )
                                                } else {
                                                    return (
                                                        <div className='text-foreground/70 italic mt-2 bg-default-100 px-3 py-2 rounded-lg text-sm'>
                                                            <i className="fa-solid fa-circle-check text-success mr-2" />
                                                            No requiere correlativas previas
                                                        </div>
                                                    )
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </DrawerBody>
                            </>
                        ) : <DrawerBody>Cargando contenido...</DrawerBody>}
                    </>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default DetalleMateriaModal