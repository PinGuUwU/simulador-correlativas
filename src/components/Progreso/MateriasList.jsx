import { useEffect, useRef, useState } from 'react'
import MateriaCard from './MateriaCard.jsx'
import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, Tab, Tabs, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import DetalleMateriaModal from './modals/DetalleMateriaModal.jsx'
import ConfirmarCambioModal from './modals/ConfirmarCambioModal.jsx'
import CapturaTransicionModal from './modals/CapturaTransicionModal.jsx'
import { useNavigate } from 'react-router-dom'
import materiasUtils from '../../utils/Progreso/materiasUtils.js'
import useProgresoMaterias from '../../hooks/Progreso/useProgresoMaterias.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import regularidadUtils from '../../utils/Progreso/regularidadUtils.js'
import { Search } from 'lucide-react'
import SyncCloud from './SyncCloud';

function MateriasList({ progreso, setProgreso, progresoDetalles, setProgresoDetalles, materias, isProgressSticky, plan, busqueda = "", filtros = [] }) {
    const { updateAuthProgreso } = useAuth();
    const [infoMateria, setInfoMateria] = useState()
    const { cambioDeEstado, cambioDeEstadoMultiple } = useProgresoMaterias(progreso, setProgreso, materias, plan, updateAuthProgreso)

    // Lógica de filtrado
    const isSearching = busqueda.trim().length > 0 || filtros.length > 0;

    const materiasFiltradas = materias.filter(m => {
        // Función para quitar acentos
        const normalize = (text) =>
            text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const searchNormalized = normalize(busqueda);

        const matchBusqueda = busqueda === "" ||
            normalize(m.nombre).includes(searchNormalized) ||
            normalize(m.codigo).includes(searchNormalized);

        const matchFiltros = filtros.length === 0 || filtros.includes(progreso[m.codigo]);

        return matchBusqueda && matchFiltros;
    });

    // Efecto para verificar vencimientos pasivos al cargar
    useEffect(() => {
        if (!progreso || !progresoDetalles) return;

        let huboCambios = false;
        const nuevoProgreso = { ...progreso };

        Object.entries(progreso).forEach(([codigo, estado]) => {
            if (estado === 'Regular') {
                const detalles = progresoDetalles[codigo];
                if (detalles?.fechaRegularidad) {
                    const estadoActualizado = regularidadUtils.calcularEstadoConsolidado(
                        "Regular",
                        detalles.fechaRegularidad,
                        detalles.intentosFinal
                    );
                    if (estadoActualizado === 'Libre') {
                        nuevoProgreso[codigo] = 'Libre';
                        huboCambios = true;
                    }
                }
            }
        });

        if (huboCambios) {
            setProgreso(nuevoProgreso);
            updateAuthProgreso(plan, nuevoProgreso, progresoDetalles);
        }
    }, []);
    const [confirmacion, setConfirmacion] = useState(false)
    const [mostrar, setMostrar] = useState(true)
    //Logica para mostrar u ocultar las materias de un año
    const [isAnioOpen, setIsAnioOpen] = useState(() => {
        const guardado = localStorage.getItem('materias_isAnioOpen');
        if (guardado) {
            try { return JSON.parse(guardado); } catch (e) { return []; }
        }
        return [];
    });

    const [vista, setVista] = useState(() => localStorage.getItem('materias_vista_preferida') || 'grid');

    useEffect(() => {
        localStorage.setItem('materias_vista_preferida', vista);
    }, [vista]);

    useEffect(() => {
        localStorage.setItem('materias_isAnioOpen', JSON.stringify(isAnioOpen));
    }, [isAnioOpen]);
    const navigate = useNavigate()

    // Para el Drawer/Info de la materia
    const {
        isOpen: isDetailOpen,
        onOpen: onDetailOpen,
        onClose: onDetailClose,
        onOpenChange: onDetailOpenChange
    } = useDisclosure()

    // Para el Modal de confirmación de borrado
    const {
        isOpen: isResetOpen,
        onOpen: onResetOpen,
        onOpenChange: onResetOpenChange,
        onClose: onResetClose
    } = useDisclosure()

    //Para el modal de Confirmar regular una materia bloqueada
    const {
        isOpen: isConfirmationOpen,
        onOpen: onConfirmationOpen,
        onOpenChange: onConfirmationOpenChange,
        onClose: onConfirmationClose
    } = useDisclosure()

    // Para el modal de captura de datos por transición de estado
    const {
        isOpen: isCapturaOpen,
        onOpen: onCapturaOpen,
        onOpenChange: onCapturaOpenChange,
        onClose: onCapturaClose
    } = useDisclosure()
    const [capturaConfig, setCapturaConfig] = useState({ tipo: null, materia: null, pendingState: null })

    // Para el Modal de Aprobar Año
    const [anioAAprobar, setAnioAAprobar] = useState(null)
    const {
        isOpen: isAprobarAnioOpen,
        onOpen: onAprobarAnioOpen,
        onOpenChange: onAprobarAnioOpenChange,
        onClose: onAprobarAnioClose
    } = useDisclosure()

    //Abrir la info de una materia con Drawer de HeroUI
    const abrirInfo = (materia) => {
        setInfoMateria(materia)
        onDetailOpen()

        window.history.pushState({ modalOpen: true }, "")
    }
    //Manejo el evento de que en celu haga para atrás, que cierre el modal y no se saque la página
    useEffect(() => {
        const handlePopState = () => onDetailClose()
        if (isDetailOpen) window.addEventListener("popstate", handlePopState)
        return () => window.removeEventListener("popstate", handlePopState)
    }, [isDetailOpen, onDetailClose])

    // Manejo de historial para modal de reset
    useEffect(() => {
        const handlePopState = () => onResetClose()
        if (isResetOpen) window.addEventListener("popstate", handlePopState)
        return () => window.removeEventListener("popstate", handlePopState)
    }, [isResetOpen, onResetClose])

    // Manejo de historial para modal de confirmación
    useEffect(() => {
        const handlePopState = () => onConfirmationClose()
        if (isConfirmationOpen) window.addEventListener("popstate", handlePopState)
        return () => window.removeEventListener("popstate", handlePopState)
    }, [isConfirmationOpen, onConfirmationClose])

    // Manejo de historial para modal de aprobar año
    useEffect(() => {
        const handlePopState = () => onAprobarAnioClose()
        if (isAprobarAnioOpen) window.addEventListener("popstate", handlePopState)
        return () => window.removeEventListener("popstate", handlePopState)
    }, [isAprobarAnioOpen, onAprobarAnioClose])

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
    const talleres = materias.filter(m => m.taller === true)
    // Para poder filtrar las materias
    const tabs = [
        {
            id: "todas",
            label: "Todas",
            content: anios
        },
        ...(talleres.length > 0 ? [{
            id: "talleres",
            label: "Talleres",
            content: ["taller"]
        }] : []),
        ...anios.map(anio => ({
            id: anio.toString(),
            label: `${anio}° Año`,
            content: [anio]
        }))
    ]

    //Para poder reestablecer el progreso
    const reestablecerProgreso = () => {
        const progresoInicial = {}

        // Usamos la lista de materias que ya tenemos en el estado
        materias.forEach(m => {
            if (m.tesis) {
                progresoInicial[m.codigo] = materiasUtils.bloquear
            } else {
                progresoInicial[m.codigo] = (m.correlativas.length > 0 ? materiasUtils.bloquear : materiasUtils.estadosPosibles[0])
            }
        })

        updateAuthProgreso(plan, progresoInicial, {});
        // Actualizo el progreso
        setProgreso(progresoInicial)
        if (setProgresoDetalles) setProgresoDetalles({})
        onResetClose()
    }
    //Abrir el modal de confirmar el reestablecer progreso
    const handleBorrado = () => {
        onResetOpen()
        window.history.pushState({ modalOpen: true }, "")
    }

    //Manejar el cambio de estado con Popover Menu
    const [codigoMateria, setCodigoMateria] = useState()
    const [targetStateModal, setTargetStateModal] = useState(null)

    const handleCambioDeEstado = (codigo, targetState) => {
        const mappedState = targetState;
        const materia = materias.find(m => m.codigo === codigo);
        const estadoActual = progreso[codigo];

        if (mappedState === "Reiniciar") {
            const ESTADOS_VALIDOS = [materiasUtils.estadosPosibles[1], materiasUtils.estadosPosibles[2], materiasUtils.estadosPosibles[4], 'Cursando'];
            const todasBien = !materia?.correlativas?.length || materia.correlativas.every(c => ESTADOS_VALIDOS.includes(progreso[c]));
            const baseState = todasBien ? materiasUtils.estadosPosibles[0] : materiasUtils.bloquear;
            cambioDeEstado(codigo, baseState);
            return;
        }

        // Si es "Cursando", no preguntamos nada y tomamos el año actual automáticamente
        if (mappedState === "Cursando") {
            const cuatrimestreAuto = materia?.cuatrimestre
                ? (Number(materia.cuatrimestre) % 2 === 0 ? 2 : 1)
                : 1;

            const payload = {
                fechaInicioCursada: {
                    anio: new Date().getFullYear(),
                    cuatrimestre: cuatrimestreAuto
                }
            };

            ejecutarCambioConDatos(codigo, { tipo: 'hacia_cursando', materia, pendingState: mappedState }, payload);
            return;
        }

        // Determinar tipo de captura según la transición
        let tipoCaptura = null;

        if (mappedState === "Regular") {
            tipoCaptura = estadoActual === 'Cursando' ? 'desde_cursando_hacia_reg' : 'hacia_regular';
        } else if (mappedState === "Aprobado" || mappedState === "Promocionado") {
            if (estadoActual === 'Regular' || estadoActual === 'Cursando') {
                tipoCaptura = 'hacia_aprobado_desde_reg';
            } else {
                tipoCaptura = 'hacia_aprobado_directo';
            }
        }

        if (tipoCaptura) {
            setCapturaConfig({ tipo: tipoCaptura, materia, pendingState: mappedState });
            setCodigoMateria(codigo);
            onCapturaOpen();
            return;
        }

        // Estados sin formulario (Libre directo, etc.)
        cambioDeEstado(codigo, mappedState);
    }

    const ejecutarCambioConDatos = (codigo, config, payload) => {
        if (payload && codigo) {
            const detallesActuales = progresoDetalles?.[codigo] || {};
            const estadoActual = progreso[codigo];

            // ¿Es una recursada? (viniendo de Libre, Aprobado o Promocionado y queriendo regularizar/cursar de nuevo)
            const viniendoDeEstadoFinal = ['Libre', 'Aprobado', 'Promocionado'].includes(estadoActual);
            const yendoAEstadoActivo = ['Cursando', 'Regular', 'Aprobado', 'Promocionado'].includes(config.pendingState);
            const esRecursada = viniendoDeEstadoFinal && yendoAEstadoActivo;

            let nuevosDetallesBase = { ...detallesActuales };

            if (esRecursada) {
                // Archivar la cursada actual en el historial
                const { historial, ...datosAArchivar } = detallesActuales;

                // Solo archivar si realmente hay algo significativo (intentos o fecha de regularidad)
                if ((datosAArchivar.intentosFinal && datosAArchivar.intentosFinal.length > 0) || datosAArchivar.fechaRegularidad) {
                    nuevosDetallesBase = {
                        historial: [
                            ...(historial || []),
                            {
                                ...datosAArchivar,
                                estadoFinal: estadoActual, // Guardamos que terminó como Libre, Aprobado o Promocionado
                                fechaFin: new Date().toISOString()
                            }
                        ],
                        // Limpiamos los datos actuales para la nueva cursada
                        intentosFinal: [],
                        fechaRegularidad: null,
                        notaRegularizacion: null,
                        fechaInicioCursada: null,
                        notaFinal: null
                    };
                }
            }

            const nuevosDetalles = {
                ...nuevosDetallesBase,
                ...(payload.fechaRegularidad !== undefined && { fechaRegularidad: payload.fechaRegularidad }),
                ...(payload.fechaInicioCursada !== undefined && { fechaInicioCursada: payload.fechaInicioCursada }),
                ...(payload.notaFinal !== undefined && { notaFinal: payload.notaFinal }),
                ...(payload.notaRegularizacion !== undefined && { notaRegularizacion: payload.notaRegularizacion }),
            };

            // Si transición 'desde_cursando_hacia_reg', copiar fechaInicioCursada como fechaRegularidad si no la tiene
            if (config.tipo === 'desde_cursando_hacia_reg' && !nuevosDetalles.fechaRegularidad && nuevosDetallesBase.fechaInicioCursada) {
                nuevosDetalles.fechaRegularidad = nuevosDetallesBase.fechaInicioCursada;
            }

            if (payload.notaFinal != null && (config.pendingState === 'Aprobado' || config.pendingState === 'Promocionado')) {
                const fechaExamen = payload.anioExamen
                    ? new Date(payload.anioExamen, 11, 31).toISOString()
                    : new Date().toISOString();

                const nuevoIntento = {
                    nota: payload.notaFinal,
                    estado: payload.notaFinal >= 4 ? 'aprobado' : 'reprobado',
                    fecha: payload.fechaFinal || fechaExamen.split("T")[0]
                };
                nuevosDetalles.intentosFinal = [
                    ...(nuevosDetallesBase.intentosFinal || []),
                    nuevoIntento
                ];
            }

            const updatedDetalles = { ...progresoDetalles, [codigo]: nuevosDetalles };
            if (setProgresoDetalles) setProgresoDetalles(updatedDetalles);
            updateAuthProgreso(plan, progreso, updatedDetalles);
        }

        // Aplicar el cambio de estado siempre si hay un estado pendiente
        if (config.pendingState) {
            cambioDeEstado(codigo, config.pendingState);
        }
    }

    const handleCapturaConfirm = (payload) => {
        // _sugerirLibre: el usuario eligio "Marcar como Libre" desde la alerta de nota reprobatoria
        if (payload?._sugerirLibre) {
            if (codigoMateria) {
                const detallesActuales = progresoDetalles?.[codigoMateria] || {};
                const updatedDetalles = {
                    ...progresoDetalles,
                    [codigoMateria]: { ...detallesActuales, notaRegularizacion: payload.notaRegularizacion }
                };
                if (setProgresoDetalles) setProgresoDetalles(updatedDetalles);
                updateAuthProgreso(plan, progreso, updatedDetalles);
            }
            onCapturaClose();
            cambioDeEstado(codigoMateria, 'Libre');
            return;
        }

        ejecutarCambioConDatos(codigoMateria, capturaConfig, payload);
        onCapturaClose();
    }

    useEffect(() => {
        if (confirmacion === true) {
            cambioDeEstado(codigoMateria, targetStateModal)
            setConfirmacion(false)
        }
    }, [onConfirmationClose, confirmacion])

    //Manejo los años para saber si están o no mostrandose
    const handleMostrar = (id) => {
        if (isAnioOpen.includes(id)) {
            //Solo guardo todas las id que no sean la que acaba de cambiar de estado
            setIsAnioOpen(isAnioOpen.filter(a => a !== id))
        } else {
            //Guardo lo mismo más el id que acaba de cambiar de estado
            setIsAnioOpen([...isAnioOpen, id])
        }
    }

    const handleMostrarTodo = () => {
        // Si ya hay algo abierto, cerramos todo (vaciamos el array)
        if (isAnioOpen.length > 0) {
            setIsAnioOpen([]);
        } else {
            // IMPORTANTE: Creamos un nuevo array con todos los años de una
            // Usamos .map() para extraer solo los identificadores o el objeto año
            const todosLosAnios = anios.map(anio => anio);
            setIsAnioOpen(todosLosAnios);
        }
    };

    return (
        <div className='pb-50'>
            {/* Modal para confirmar reset */}
            <Modal
                isOpen={isResetOpen}
                onOpenChange={onResetOpenChange}
                backdrop="opaque"
                placement="center"
                classNames={{
                    backdrop: "bg-black/50"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-danger">
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    Confirmar Acción
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-default-600">
                                    ¿Estás seguro de que quieres <b>reestablecer todo tu progreso</b>?
                                </p>
                                <p className="text-sm text-foreground/80 italic">
                                    Esta acción volverá todas las materias a su estado inicial (Disponible/Bloqueado) y no se puede deshacer.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onResetClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    color="danger"
                                    className="font-bold"
                                    onPress={reestablecerProgreso}
                                >
                                    Reestablecer
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal para confirmar Aprobar Año */}
            <Modal
                isOpen={isAprobarAnioOpen}
                onOpenChange={onAprobarAnioOpenChange}
                backdrop="opaque"
                placement="center"
                classNames={{
                    backdrop: "bg-black/50"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-success">
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-check-double"></i>
                                    Aprobar {anioAAprobar?.valor === "taller" ? "Talleres" : `${anioAAprobar?.valor}° Año`}
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-default-600">
                                    ¿Estás seguro de que quieres <b>aprobar todas las materias</b> de {anioAAprobar?.valor === "taller" ? "Talleres" : `este año`}?
                                </p>
                                <p className="text-sm text-foreground/80 italic">
                                    Esta acción actualizará en cadena todas las correlativas dependientes al estado Aprobado. Podrás modificar los detalles (como notas de cursada y final) más adelante.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onAprobarAnioClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    color="success"
                                    className="font-bold"
                                    onPress={() => {
                                        if (anioAAprobar) {
                                            const codigos = anioAAprobar.materias.map(m => m.codigo);
                                            cambioDeEstadoMultiple(codigos, materiasUtils.estadosPosibles[2]);
                                        }
                                        onAprobarAnioClose();
                                    }}
                                >
                                    Confirmar y Aprobar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Sección de botones */}
            <div className="sm:flex flex-wrap items-center sm:justify-between gap-3 mb-8">
                {/* Grupo de Acciones Principales */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        className="font-bold rounded-xl"
                        startContent={<i className="fa-solid fa-trash-can"></i>}
                        onPress={() => handleBorrado()}
                    >
                        Reestablecer
                    </Button>
                    <Button
                        size='sm'
                        variant="flat"
                        color="success"
                        className="font-bold rounded-xl text-success-800"
                        onPress={() => navigate("/simulador")}
                    >
                        Simular Avance
                    </Button>
                </div>

                {/* Herramientas de Sincronización y Vista */}
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="flat"
                        color="default"
                        className="font-bold rounded-xl max-sm:hidden"
                        startContent={<i className={`fa-solid ${isAnioOpen.length > 0 ? 'fa-eye' : 'fa-eye-slash'}`}></i>}
                        onPress={handleMostrarTodo}
                    >
                        {isAnioOpen.length > 0 ? "Mostrar todo" : "Ocultar todo"}
                    </Button>

                    <SyncCloud plan={plan} />

                    <div id="wrapper-view-selector" className="max-md:hidden">
                        <Tabs
                            size="sm"
                            variant="bordered"
                            selectedKey={vista}
                            onSelectionChange={setVista}
                            classNames={{
                                tabList: "rounded-xl border-default-200 bg-default-100 p-1",
                                cursor: "rounded-lg bg-background shadow-sm",
                                tab: "px-3"
                            }}
                        >
                            <Tab key="grid" title={<div className="flex items-center gap-2"><i className="fa-solid fa-table-cells-large"></i></div>} />
                            <Tab key="list" title={<div className="flex items-center gap-2"><i className="fa-solid fa-list-ul"></i></div>} />
                        </Tabs>
                    </div>
                </div>
            </div>
            {/* Sección materias o Resultados de búsqueda */}
            {isSearching ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between border-b border-default-200 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-secondary rounded-full"></div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">
                                Resultados de búsqueda
                            </h2>
                        </div>
                        <Chip variant="flat" color="secondary" className="font-bold">
                            {materiasFiltradas.length} encontrados
                        </Chip>
                    </div>

                    {materiasFiltradas.length > 0 ? (
                        <div className={vista === 'grid'
                            ? "grid grid-cols-1 min-[768px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                            : "flex flex-col gap-3"
                        }>
                            {materiasFiltradas.map((materia) => (
                                <div key={materia.codigo}>
                                    <MateriaCard
                                        materia={materia}
                                        estado={progreso[materia.codigo]}
                                        detalles={progresoDetalles?.[materia.codigo]}
                                        actualizarEstados={(target) => handleCambioDeEstado(materia.codigo, target)}
                                        abrirInfo={() => abrirInfo(materia)}
                                        vista={vista}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-default-50 rounded-[2.5rem] border-2 border-dashed border-default-200">
                            <div className="w-16 h-16 bg-default-100 rounded-2xl flex items-center justify-center text-default-400">
                                <Search size={32} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-foreground">No encontramos materias</p>
                                <p className="text-default-500">Probá con otros términos o filtros</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div id="tabs-filtro-anio" className="relative animate-in fade-in duration-500">
                    <Tabs aria-label="Filtos por año" items={tabs} className=' w-full mask-[linear-gradient(to_right,black_85%,transparent_100%)] pl-[3%] md:mask-none'>
                        {(item) => (
                            <Tab key={item.id} title={item.label} className=''>
                                <div className="space-y-12 ">
                                    {item.content.map((valor) => {
                                        let materiasParaMostrar
                                        //Si el valor es taller
                                        if (valor === "taller") {
                                            materiasParaMostrar = talleres
                                        } else {
                                            // Me quedo con las materias de este año
                                            materiasParaMostrar = materias.filter((m) => Number(m.anio) === valor)
                                        }

                                        // Si no hay materias en este año, podríamos evitar renderizarlo (opcional)
                                        if (materiasParaMostrar.length === 0) return null

                                        return (
                                            <section key={valor} className={`flex flex-col gap-6`}>
                                                {/* Cabecera del Año */}
                                                <div className="flex justify-between ">
                                                    <div className='flex items-center gap-3 border-b border-default-200 pb-2 grow'>
                                                        <div className="w-1.5 h-8 bg-primary rounded-full shadow-sm"></div>
                                                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                                            {valor === "taller" ? "Talleres" : `${valor}° Año`}
                                                        </h2>
                                                    </div>
                                                    <div className="flex items-center gap-1 ml-2">
                                                        <Button size="sm" variant="flat" className="font-medium" onPress={() => handleMostrar(valor)}>{isAnioOpen.includes(valor) ? "Mostrar" : "Ocultar"}</Button>
                                                        <Dropdown>
                                                            <DropdownTrigger>
                                                                <Button isIconOnly variant="flat" size="sm">
                                                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                                                </Button>
                                                            </DropdownTrigger>
                                                            <DropdownMenu aria-label="Acciones de año">
                                                                <DropdownItem
                                                                    key="aprobar"
                                                                    color="success"
                                                                    startContent={<i className="fa-solid fa-check-double" />}
                                                                    onPress={() => {
                                                                        setAnioAAprobar({ valor, materias: materiasParaMostrar });
                                                                        onAprobarAnioOpen();
                                                                    }}
                                                                >
                                                                    Aprobar materias
                                                                </DropdownItem>
                                                            </DropdownMenu>
                                                        </Dropdown>
                                                    </div>
                                                </div>

                                                {/* Contenedor de Cuatrimestres */}
                                                <div className={`flex flex-col gap-8 pl-2 sm:pl-4 ${isAnioOpen.includes(valor) ? " hidden" : ""}`}>
                                                    {[1, 2].map((cuatri) => {
                                                        // Me quedo con las materias de este cuatrimestre
                                                        const materiasCuatri = materiasParaMostrar.filter(
                                                            (m) => (Number(m.cuatrimestre) % 2 === 0 ? 2 : 1) === cuatri
                                                        )

                                                        if (materiasCuatri.length === 0) return null

                                                        return (
                                                            <div key={cuatri} className="flex flex-col gap-4">
                                                                {/* Cabecera del Cuatrimestre */}
                                                                <div className="sm:flex items-center sm:justify-between bg-default-50 border border-default-200 rounded-lg px-4 py-3 shadow-sm">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-1 h-5 bg-default-400 rounded-full"></div>
                                                                        <h3 className="text-lg font-semibold text-default-700">
                                                                            {cuatri}° Cuatrimestre
                                                                        </h3>
                                                                    </div>
                                                                    <Chip size="sm" variant="flat" className="bg-background border border-default-200 text-default-600 shadow-sm" startContent={<i className="fa-solid fa-book ml-1 text-default-400"></i>}>
                                                                        <span className="font-bold ml-1">{materiasCuatri.length}</span> <span className="hidden sm:inline font-medium">{materiasCuatri.length === 1 ? 'materia' : 'materias'}</span>
                                                                    </Chip>
                                                                </div>

                                                                <div className={vista === 'grid'
                                                                    ? "grid grid-cols-1 min-[768px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                                                                    : "flex flex-col gap-3"
                                                                }>
                                                                    {materiasCuatri.map((materia, index) => {
                                                                        const esElPrimero = materia.codigo === materias[0]?.codigo;
                                                                        return (
                                                                            <div key={materia.codigo !== "N/A" ? materia.codigo : `${materia.codigo}-${index}`} id={esElPrimero ? 'materia-card-ejemplo' : undefined}>
                                                                                <MateriaCard
                                                                                    materia={materia}
                                                                                    estado={progreso[materia.codigo]}
                                                                                    detalles={progresoDetalles?.[materia.codigo]}
                                                                                    actualizarEstados={(target) => handleCambioDeEstado(materia.codigo, target)}
                                                                                    abrirInfo={() => abrirInfo(materia)}
                                                                                    vista={vista}
                                                                                />
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </section>
                                        )
                                    })}
                                </div>
                            </Tab>
                        )}
                    </Tabs>
                </div>
            )}


            {/* Drawer de info de las materiasd */}
            <DetalleMateriaModal
                isOpen={isDetailOpen}
                infoMateria={infoMateria}
                materias={materias}
                progreso={progreso}
                progresoDetalles={progresoDetalles}
                setProgresoDetalles={setProgresoDetalles}
                cambioDeEstado={cambioDeEstado}
                plan={plan}
                onOpenChange={onDetailOpenChange}
            />

            {/* Modal para confirmar el cambio de estado de una materia bloqueada */}
            <ConfirmarCambioModal
                setConfirmacion={setConfirmacion}
                setMostrar={setMostrar}
                isOpen={isConfirmationOpen}
                onOpenChange={onConfirmationOpenChange}
                onClose={onConfirmationClose}
                targetState={targetStateModal}
            />

            {/* Modal de captura de datos por transición */}
            <CapturaTransicionModal
                isOpen={isCapturaOpen}
                onOpenChange={onCapturaOpenChange}
                tipo={capturaConfig.tipo}
                materia={capturaConfig.materia}
                onConfirm={handleCapturaConfirm}
            />

        </div >
    )
}

export default MateriasList