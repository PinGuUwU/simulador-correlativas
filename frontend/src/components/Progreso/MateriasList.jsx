import { useEffect, useRef, useState } from 'react'
import MateriaCard from './MateriaCard.jsx'
import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, Tab, Tabs, useDisclosure } from '@heroui/react'
import DetalleMateriaModal from './modals/DetalleMateriaModal.jsx'
import ConfirmarCambioModal from './modals/ConfirmarCambioModal.jsx'
import { useNavigate } from 'react-router-dom'
import materiasUtils from '../../utils/Progreso/materiasUtils.js'
import useProgresoMaterias from '../../hooks/Progreso/useProgresoMaterias.jsx'

function MateriasList({ progreso, setProgreso, materias, isProgressSticky, plan }) {
    const [modo, setModo] = useState(false) //Para saber si se está editando el estado o no
    const [infoMateria, setInfoMateria] = useState()
    const topSwitchRef = useRef(null)
    const [mostrarSwitchFlotante, setMostrarSwitchFlotante] = useState(false)
    const { cambioDeEstado } = useProgresoMaterias(progreso, setProgreso, materias)
    const [confirmacion, setConfirmacion] = useState(false)
    const [mostrar, setMostrar] = useState(true)
    //Logica para mostrar u ocultar las materias de un año
    const [isAnioOpen, setIsAnioOpen] = useState([])
    const navigate = useNavigate()
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

    //Abrir la info de una materia con Drawer de HeroUI
    const abrirInfo = (materia) => {
        setInfoMateria(materia)
        onDetailOpen()

        window.history.pushState({ modalOpen: true }, "")
    }
    //Manejo el evento de que en celu haga para atrás, que cierre el modal y no se saque la página
    useEffect(() => {
        const handlePopState = () => {
            // Si el usuario vuelve atrás, cerramos el modal
            // (Asegúrate de tener acceso a la función que lo cierra aquí)
            onDetailClose()
        }

        // Solo activamos el "escuchador" si el modal está abierto
        if (isDetailOpen) {
            window.addEventListener("popstate", handlePopState)
        }

        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [isDetailOpen, onDetailClose])

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
            // Aplicamos la misma lógica del inicio: 
            // Si no tiene correlativas, queda 'Disponible'. Si tiene, 'Bloqueado'.
            progresoInicial[m.codigo] = (m.correlativas.length > 0 ? 'Bloqueado' : 'Disponible')
        })

        // Actualizo el progreso
        setProgreso(progresoInicial)
        onResetClose()
    }
    //Abrir el modal de confirmar el reestablecer progreso
    const handleBorrado = () => {
        onResetOpen()
    }

    //Manejar el cambio de estado
    const handleCambioDeEstado = (codigo) => {
        if (progreso[codigo] === materiasUtils.bloquear && mostrar) {
            onConfirmationOpen()
            setCodigoMateria(codigo)
        } else {
            cambioDeEstado(codigo, plan)
        }
    }
    const [codigoMateria, setCodigoMateria] = useState()

    useEffect(() => {
        if (confirmacion === true) {
            cambioDeEstado(codigoMateria, plan)
            setConfirmacion(false)
        }

    }, [onConfirmationClose, isConfirmationOpen])

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
                backdrop="blur"
                placement="center"
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

            {/* Sección de botones */}
            <div ref={topSwitchRef} className="grid grid-cols-2 sm:flex sm:justify-between mb-8 gap-2">
                {/* Botón de Reestablecer - Solo visible en modo edición */}
                <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="font-bold rounded-xl animate-in fade-in zoom-in duration-300"
                    startContent={<i className="fa-solid fa-trash-can"></i>}
                    onPress={() => handleBorrado()}
                >
                    Reestablecer
                </Button>

                <Button
                    size='sm'
                    variant="flat"
                    color="success"
                    className="font-bold rounded-xl animate-in fade-in zoom-in duration-300 text-success-800"
                    onPress={() => navigate("/simulador")}
                >Simular Avance</Button>

                {/* Ocular o mostrar todos los años */}
                <Button
                    size='sm'
                    variant="flat"
                    color="warning"
                    className="font-bold rounded-xl animate-in fade-in zoom-in duration-300 text-warning-800"
                    onPress={() => handleMostrarTodo()}
                >
                    {isAnioOpen.length > 0 ? "Mostrar todos" : "Ocultar todos"}
                </Button>

                {/* Switch para intercambiar el modo edición */}
                <Switch

                    isSelected={modo}
                    color="success"
                    onChange={() => setModo(!modo)}
                    endContent={<span className="text-xs">off</span>}
                    startContent={<span className="text-xs">on</span>}
                    size={currentSize}
                    classNames={{
                        label: "text-default-600 font-medium"
                    }}
                >
                    Modo Edición
                </Switch>
            </div>
            {/* Switch Flotante en la parte inferior derecha */}
            {mostrarSwitchFlotante && isProgressSticky && (
                <div className="fixed top-30 right-4 z-50 bg-background/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-default-200">
                    <Switch
                        color="success"
                        isSelected={modo}
                        onChange={() => setModo(!modo)}
                        endContent={<span className="text-xs">OFF</span>}
                        startContent={<span className="text-xs">ON</span>}
                        size={currentSize}
                        classNames={{
                            label: "text-foreground font-bold"
                        }}
                    >
                        Modo Edición
                    </Switch>
                </div>
            )}


            {/* Sección materias */}
            <div >

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
                                                <div className='flex items-center gap-3 border-b border-default-200 pb-2'>
                                                    <div className="w-1.5 h-8 bg-primary rounded-full shadow-sm"></div>
                                                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                                        {valor === "taller" ? "Talleres" : `${valor}° Año`}
                                                    </h2>
                                                </div>
                                                <Button onPress={() => handleMostrar(valor)}>{isAnioOpen.includes(valor) ? "Mostrar más" : "Mostrar menos"}</Button>
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
                                                            <div className="flex items-center justify-between bg-default-50 border border-default-200 rounded-lg px-4 py-3 shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-1 h-5 bg-default-400 rounded-full"></div>
                                                                    <h3 className="text-lg font-semibold text-default-700">
                                                                        {cuatri}° Cuatrimestre
                                                                    </h3>
                                                                </div>
                                                                <Chip size="sm" variant="flat" className="bg-background border border-default-200 text-default-600 font-medium shadow-sm">
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
                                                                        actualizarEstados={() => handleCambioDeEstado(materia.codigo)}
                                                                        modo={modo}
                                                                        abrirInfo={() => abrirInfo(materia)}
                                                                    />
                                                                ))}
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


            {/* Drawer de info de las materiasd */}
            <DetalleMateriaModal
                isOpen={isDetailOpen}
                infoMateria={infoMateria}
                materias={materias}
                progreso={progreso}
                onOpenChange={onDetailOpenChange}
            />

            {/* Modal para confirmar el cambio de estado de una materia bloqueada */}
            <ConfirmarCambioModal
                setConfirmacion={setConfirmacion}
                setMostrar={setMostrar}
                isOpen={isConfirmationOpen}
                onOpenChange={onConfirmationOpenChange}
                onClose={onConfirmationClose}
            />

        </div >
    )
}

export default MateriasList