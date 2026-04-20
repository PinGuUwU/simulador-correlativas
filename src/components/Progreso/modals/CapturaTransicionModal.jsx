import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Chip } from "@heroui/react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Modal que intercepta el cambio de estado antes de aplicarlo.
 *
 * Tipos soportados:
 *   'hacia_cursando'              → Pide año de inicio de cursada (cuatri auto)
 *   'hacia_regular'               → Pide año + nota de cursada (cuatri auto)
 *   'desde_cursando_hacia_reg'    → Pide nota de cursada (año ya registrado)
 *   'hacia_aprobado_desde_reg'    → Pide solo nota final
 *   'hacia_aprobado_directo'      → Pide nota cursada + nota final
 */
function CapturaTransicionModal({ isOpen, onOpenChange, tipo, materia, onConfirm }) {
    const [anio, setAnio] = useState(String(new Date().getFullYear()));
    const [notaCursada, setNotaCursada] = useState("");
    const [notaFinal, setNotaFinal] = useState("");
    const [fechaFinal, setFechaFinal] = useState("");
    const [errors, setErrors] = useState({});
    // Estado de sugerencia cuando nota cursada < 4
    const [sugerenciaLibre, setSugerenciaLibre] = useState(false);

    useEffect(() => {
        setAnio(String(new Date().getFullYear()));
        setNotaCursada("");
        setNotaFinal("");
        setFechaFinal(new Date().toISOString().split("T")[0]);
        setErrors({});
        setSugerenciaLibre(false);
    }, [isOpen]);

    // Detectar si la nota de cursada es reprobatoria para mostrar alerta
    useEffect(() => {
        if (notaCursada !== "" && !isNaN(Number(notaCursada))) {
            setSugerenciaLibre(Number(notaCursada) < 4);
        } else {
            setSugerenciaLibre(false);
        }
    }, [notaCursada]);

    const cuatrimestreAuto = materia?.cuatrimestre
        ? (Number(materia.cuatrimestre) % 2 === 0 ? 2 : 1)
        : 1;

    const validarNota = (val, campo) => {
        const n = Number(val);
        if (val === "" || val === null) return null;
        if (isNaN(n) || n < 0 || n > 10) return `${campo} debe estar entre 0 y 10`;
        return null;
    };

    const handleConfirmar = () => {
        const newErrors = {};

        // Validar año (cuando se pide)
        if (['hacia_regular', 'hacia_aprobado_desde_reg', 'hacia_aprobado_directo'].includes(tipo)) {
            if (anio !== "") {
                const anioN = Number(anio);
                if (isNaN(anioN) || anioN < 2000 || anioN > 2100) {
                    newErrors.anio = "Ingresá un año válido (ej: 2024)";
                }
            }
        }

        // Validar nota cursada (cuando se pide)
        if (['hacia_regular', 'desde_cursando_hacia_reg', 'hacia_aprobado_directo'].includes(tipo)) {
            if (notaCursada !== "") {
                const err = validarNota(notaCursada, "Nota de cursada");
                if (err) newErrors.notaCursada = err;
            }
        }

        // Validar nota final (cuando se pide)
        if (['hacia_aprobado_desde_reg', 'hacia_aprobado_directo'].includes(tipo)) {
            if (notaFinal !== "") {
                let err = validarNota(notaFinal, "Nota final");
                if (!err && Number(notaFinal) < 4) {
                    err = "Para probar(aprobar) la nota debe ser de 4 para arriba.";
                }
                if (err) newErrors.notaFinal = err;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = {};

        if (tipo === 'hacia_regular' && anio !== "") {
            payload.fechaInicioCursada = {
                anio: Number(anio),
                cuatrimestre: cuatrimestreAuto
            };
            payload.fechaRegularidad = {
                anio: Number(anio),
                cuatrimestre: cuatrimestreAuto
            };
        }

        if (['hacia_regular', 'desde_cursando_hacia_reg', 'hacia_aprobado_directo'].includes(tipo) && notaCursada !== "") {
            payload.notaRegularizacion = Number(notaCursada);
        }

        if (['hacia_aprobado_desde_reg', 'hacia_aprobado_directo'].includes(tipo)) {
            if (notaFinal !== "") payload.notaFinal = Number(notaFinal);
            if (fechaFinal !== "") payload.fechaFinal = fechaFinal;
            if (anio !== "") payload.anioExamen = Number(anio);
        }

        if (tipo === 'hacia_aprobado_directo' && anio !== "") {
            payload.fechaRegularidad = {
                anio: Number(anio),
                cuatrimestre: cuatrimestreAuto
            };
        }

        onConfirm(payload);
    };

    const handleRellenarDespues = () => {
        onConfirm(null);
    };

    const handleSugerirLibre = () => {
        // Confirmar con la nota parcial y marcar como sugerencia libre
        onConfirm({ notaRegularizacion: Number(notaCursada), _sugerirLibre: true });
    };

    const TITULOS = {
        'hacia_regular': 'Registrar Regularización',
        'desde_cursando_hacia_reg': 'Registrar Regularización',
        'hacia_aprobado_desde_reg': 'Registrar Aprobación',
        'hacia_aprobado_directo': 'Registrar Aprobación',
    };

    const ICONOS = {
        'hacia_regular': 'fa-clock',
        'desde_cursando_hacia_reg': 'fa-clock',
        'hacia_aprobado_desde_reg': 'fa-circle-check',
        'hacia_aprobado_directo': 'fa-circle-check',
    };

    const titulo = TITULOS[tipo] || 'Registrar Datos';
    const icono = ICONOS[tipo] || 'fa-graduation-cap';

    const necesitaAnio = ['hacia_regular', 'hacia_aprobado_desde_reg', 'hacia_aprobado_directo'].includes(tipo);
    const necesitaNotaCursada = ['hacia_regular', 'desde_cursando_hacia_reg', 'hacia_aprobado_directo'].includes(tipo);
    const necesitaNotaFinal = ['hacia_aprobado_desde_reg', 'hacia_aprobado_directo'].includes(tipo);

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange} 
            placement="center" 
            backdrop="opaque"
            classNames={{
                backdrop: "bg-black/50"
            }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <i className={`fa-solid ${icono} text-primary`} />
                                <span>{titulo}</span>
                            </div>
                            {materia && (
                                <p className="text-sm font-normal text-default-500 truncate">
                                    {materia.nombre}
                                </p>
                            )}
                            <p className="text-xs text-default-400 mt-1">
                                Puedes rellenar estos campos más tarde en los detalles de la materia
                            </p>
                        </ModalHeader>

                        <ModalBody className="gap-4">
                            {/* Año de inicio/regularización/aprobación */}
                            {necesitaAnio && (
                                <div className="flex flex-col gap-2">
                                    <Input
                                        label={['hacia_aprobado_desde_reg', 'hacia_aprobado_directo'].includes(tipo) ? 'Año de aprobación' : 'Año de regularización'}
                                        placeholder="ej: 2024"
                                        type="number"
                                        variant="faded"
                                        color={['hacia_aprobado_desde_reg', 'hacia_aprobado_directo'].includes(tipo) ? 'success' : 'warning'}
                                        value={anio}
                                        onValueChange={setAnio}
                                        isInvalid={!!errors.anio}
                                        errorMessage={errors.anio}
                                        min="2000"
                                        max="2100"
                                        fullWidth
                                    />
                                    <div className="text-xs text-default-400 bg-default-50 px-3 py-2 rounded-lg border border-default-200">
                                        <i className="fa-solid fa-circle-info mr-1 text-primary" />
                                        Cuatrimestre asignado: <strong>{cuatrimestreAuto}°</strong> (según configuración de la materia)
                                    </div>
                                </div>
                            )}

                            {/* Nota de cursada */}
                            {necesitaNotaCursada && (
                                <div className="flex flex-col gap-2">
                                    <Input
                                        label="Nota de cursada (promedio de parciales)"
                                        placeholder="0 - 10"
                                        type="number"
                                        variant="faded"
                                        color="warning"
                                        value={notaCursada}
                                        onValueChange={setNotaCursada}
                                        isInvalid={!!errors.notaCursada}
                                        errorMessage={errors.notaCursada}
                                        min="0"
                                        max="10"
                                        fullWidth
                                    />

                                    {/* Alerta: nota reprobatoria */}
                                    {sugerenciaLibre && (
                                        <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-danger text-sm font-bold">
                                                <i className="fa-solid fa-triangle-exclamation" />
                                                Nota reprobatoria ({notaCursada}/10)
                                            </div>
                                            <p className="text-xs text-default-600">
                                                Con una nota menor a 4 la materia no puede regularizarse. Podés marcarla como <strong>Libre</strong> (recursar) o continuar con <em>"Rellenar más tarde"</em>.
                                            </p>
                                            <Button
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                className="font-bold w-full"
                                                onPress={handleSugerirLibre}
                                            >
                                                <i className="fa-solid fa-user-slash mr-1" />
                                                Marcar como Libre (recursar)
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Nota final */}
                            {necesitaNotaFinal && (
                                <div className="flex flex-col gap-2">
                                    <Input
                                        label="Fecha del examen final"
                                        type="date"
                                        variant="faded"
                                        color="success"
                                        value={fechaFinal}
                                        onChange={(e) => setFechaFinal(e.target.value)}
                                        fullWidth
                                    />
                                    <Input
                                        label="Nota del examen final"
                                        placeholder="0 - 10"
                                        type="number"
                                        variant="faded"
                                        color="success"
                                        value={notaFinal}
                                        onValueChange={setNotaFinal}
                                        isInvalid={!!errors.notaFinal}
                                        errorMessage={errors.notaFinal}
                                        min="0"
                                        max="10"
                                        fullWidth
                                    />
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter className="flex-col gap-2">
                            <Button
                                color="primary"
                                className="w-full font-bold"
                                onPress={handleConfirmar}
                                isDisabled={sugerenciaLibre && necesitaNotaCursada && !necesitaNotaFinal}
                            >
                                Confirmar y Guardar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

CapturaTransicionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    tipo: PropTypes.oneOf([
        'hacia_regular',
        'desde_cursando_hacia_reg',
        'hacia_aprobado_desde_reg',
        'hacia_aprobado_directo'
    ]),
    materia: PropTypes.object,
    onConfirm: PropTypes.func.isRequired,
};

export default CapturaTransicionModal;
