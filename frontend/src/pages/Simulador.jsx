import React, { useEffect, useState } from 'react'
import HeaderSimulador from '../components/Simulador/HeaderSimulador'
import MateriasSimulador from '../components/Simulador/MateriasSimulador'
import ConfiguracionSimulador from '../components/Simulador/modals/ConfiguracionSimulador'
import useSimuladorEstado from '../hooks/Simulador/useSimuladorEstado'
import useSimuladorMaterias from '../hooks/Simulador/useSimuladorMaterias'
import { Button, Spinner, useDisclosure, Card, CardBody, Accordion, AccordionItem, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

function Simulador() {
    const [materias, setMaterias] = useState([])
    const [carreraFinalizada, setCarreraFinalizada] = useState(false)
    const [plan, setPlan] = useState()
    const [progresoSimulado, setProgresoSimulado] = useState(null)
    const [progresoBase, setProgresoBase] = useState(null)
    const [cargando, setCargando] = useState(false)
    // Cuatrimestre y año ACTUALES de la simulación (avanzan con siguiente/anterior)
    const [cuatri, setCuatri] = useState("1")
    const [anioActual, setAnioActual] = useState(new Date().getFullYear())
    // Cuatrimestre y año de INICIO configurados en el modal (no cambian durante la simulación)
    const [anioInicio, setAnioInicio] = useState()
    const [cuatriInicio, setCuatriInicio] = useState()
    const [modo, setModo] = useState()
    const [historialSemestres, setHistorialSemestres] = useState([])
    const [estadoAnterior, setEstadoAnterior] = useState(false)
    const [estadoSiguiente, setEstadoSiguiente] = useState(true)
    const [simulacionTerminada, setSimulacionTerminada] = useState(false)
    const [openedAccordions, setOpenedAccordions] = useState(new Set())
    const [descargandoPDF, setDescargandoPDF] = useState(false)

    const { handleSiguiente, handleAnterior } = useSimuladorEstado()

    const handleDownloadPDF = async () => {
        try {
            setDescargandoPDF(true)

            // Forzar apertura de todos los acordeones del historial para la captura
            const keysDeTodos = new Set(historialSemestres.map((_, i) => String(i)))
            const acordeonesPrevios = new Set(openedAccordions)
            setOpenedAccordions(keysDeTodos)

            // Pequeña pausa para que css/HeroUI terminen de animar el slide-down del acordeón
            await new Promise(r => setTimeout(r, 600))

            const element = document.getElementById('historial-container')
            if (!element) throw new Error("No se encontró el historial")

            // Usamos html-to-image porque soporta métodos CSS modernos (como oklch y oklab que trae HeroUI/Tailwind)
            const filterNodes = (node) => {
                if (node.hasAttribute && node.hasAttribute('data-html2canvas-ignore')) return false;
                return true;
            };

            const isDark = document.documentElement.className.includes('dark');
            const fallbackBg = isDark ? '#000000' : '#ffffff';

            const dataUrl = await toPng(element, {
                pixelRatio: 1.5,
                backgroundColor: fallbackBg,
                width: element.offsetWidth,
                height: element.offsetHeight,
                style: {
                    margin: '0',
                    maxWidth: 'none',
                    width: element.offsetWidth + 'px'
                },
                filter: filterNodes,
                cacheBust: true,
                skipFonts: true // Previene los securityErrors de las fuentes remotas en Chrome
            })

            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => img.onload = resolve);

            const pdf = new jsPDF('p', 'pt', [img.width * 0.75, img.height * 0.75])
            pdf.addImage(dataUrl, 'PNG', 0, 0, img.width * 0.75, img.height * 0.75)
            pdf.save(`Simulacion_${plan}.pdf`)

            try { addToast({ title: "¡PDF Descargado!", description: "Has guardado una copia de tu recorrido", color: "success" }) } catch (e) { }

            // Devolvemos el estado previo
            setOpenedAccordions(acordeonesPrevios)
        } catch (error) {
            console.error(error)
            try { addToast({ title: "Error", description: "Ocurrió un problema generando el documento.", color: "danger" }) } catch (e) { }
        } finally {
            setDescargandoPDF(false)
        }
    }

    const {
        isOpen: isConfiguracionOpen,
        onClose: onConfiguracionClose,
        onOpenChange: onConfiguracionOpenChange,
        onOpen: onConfiguracionOpen
    } = useDisclosure()

    const {
        isOpen: isGuardarOpen,
        onClose: onGuardarClose,
        onOpenChange: onGuardarOpenChange,
        onOpen: onGuardarOpen
    } = useDisclosure()

    // Elevamos el estado y la lógica de materias aquí
    const { cambioDeEstado, materiasCursables } = useSimuladorMaterias(materias, progresoSimulado || {}, cuatri, setProgresoSimulado, progresoBase || {}, anioActual)

    useEffect(() => {
        if (!plan) {
            onConfiguracionOpen()
            return
        }

        const fetchMaterias = async () => {
            setCargando(true)
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/${plan}`)
                if (!response.ok) throw new Error("Error en la respuesta del servidor")

                const data = await response.json()
                setMaterias(data)

                if (modo === "guardado") {
                    const simuData = localStorage.getItem(`simulacion+${plan}`)
                    if (simuData) {
                        const parsed = JSON.parse(simuData)
                        setHistorialSemestres(parsed.historialSemestres)
                        setProgresoSimulado(parsed.progresoSimulado)
                        setProgresoBase(parsed.progresoBase)
                        setAnioActual(parsed.anioActual)
                        setCuatri(parsed.cuatri)
                        setSimulacionTerminada(parsed.simulacionTerminada)
                        setCargando(false)
                        return
                    }
                    // Si no existiera, continúa abajo simulando "nuevo"
                }

                const storageKey = `progreso+${plan}`
                const storageData = localStorage.getItem(storageKey)

                let progresoInicial = storageData ? JSON.parse(storageData) : null
                let nuevoProgreso = {}

                if (modo === "guardado") {
                    const saved = JSON.parse(localStorage.getItem(`simulacion+${plan}`));
                    if (saved) {
                        setHistorialSemestres(saved.historialSemestres || []);
                        setProgresoSimulado(saved.progresoSimulado || {});
                        setProgresoBase(saved.progresoBase || {});
                        setAnioActual(saved.anioActual || 1);
                        setCuatri(saved.cuatri || "1");
                        setSimulacionTerminada(saved.simulacionTerminada || false);
                        setCargando(false);
                        return; // Sale temprano
                    }
                }

                if (modo === "nuevo" || !progresoInicial) {
                    data.forEach(m => {
                        nuevoProgreso[m.codigo] = "No Cursado"
                    })
                    setProgresoSimulado(nuevoProgreso)
                    setProgresoBase(nuevoProgreso)
                    setAnioActual(Number(anioInicio) || new Date().getFullYear())
                    setCuatri(cuatriInicio || "1")
                    setHistorialSemestres([])
                    setSimulacionTerminada(false)
                } else {
                    data.forEach(m => {
                        if (["Regular", "Aprobado"].includes(progresoInicial[m.codigo])) {
                            nuevoProgreso[m.codigo] = "Cursado"
                        } else {
                            nuevoProgreso[m.codigo] = "No Cursado"
                        }
                    })

                    // Si hay progreso, autogeneramos el historial basándonos en los cuatrimestres
                    let maxSemestre = 0;
                    data.forEach(m => {
                        if (nuevoProgreso[m.codigo] === "Cursado") {
                            maxSemestre = Math.max(maxSemestre, Number(m.cuatrimestre));
                        }
                    });

                    let currentY = Number(anioInicio) || new Date().getFullYear();
                    let currentC = Number(cuatriInicio) || 1;

                    let pastDates = [];
                    for (let i = 0; i < maxSemestre; i++) {
                        if (currentC === 1) { currentC = 2; currentY--; }
                        else { currentC = 1; }
                        pastDates.push({ y: currentY, c: currentC });
                    }
                    pastDates.reverse();

                    const fakeHistorial = [];
                    let acumulado = {};
                    data.forEach(m => acumulado[m.codigo] = "No Cursado");

                    for (let i = 1; i <= maxSemestre; i++) {
                        const materiasDelSemestre = data.filter(m => Number(m.cuatrimestre) === i);
                        const progresoBaseSnapshot = { ...acumulado };

                        materiasDelSemestre.forEach(m => {
                            if (nuevoProgreso[m.codigo] === "Cursado") {
                                acumulado[m.codigo] = "Cursado";
                            }
                        });

                        const progresoSnapshot = { ...acumulado };
                        const pd = pastDates[i - 1];

                        fakeHistorial.push({
                            anioActual: pd.y,
                            cuatri: String(pd.c),
                            materiasDelSemestre,
                            progresoSnapshot,
                            progresoBaseSnapshot
                        });
                    }

                    setHistorialSemestres(fakeHistorial);
                    setProgresoSimulado({ ...acumulado });
                    setProgresoBase({ ...acumulado });

                    setAnioActual(Number(anioInicio) || new Date().getFullYear());
                    setCuatri(cuatriInicio || "1");

                    const cursadas = data.filter(m => acumulado[m.codigo] === "Cursado").length;
                    setSimulacionTerminada(cursadas === data.length && data.length > 0);
                }

                setCargando(false)
            } catch (error) {
                console.error("Error al traer las materias:", error)
                setCargando(false)
            }
        }
        fetchMaterias()
    }, [plan, modo, anioInicio, cuatriInicio])

    useEffect(() => {
        if (historialSemestres.length === 0) {
            setEstadoAnterior(false)
        } else {
            setEstadoAnterior(true)
        }

        if (simulacionTerminada) {
            setEstadoSiguiente(false)
        } else {
            setEstadoSiguiente(true)
        }
    }, [anioActual, cuatri, historialSemestres, simulacionTerminada])


    const marcarTodasEnPantalla = (estado) => {
        if (!materiasCursables.length) return;
        const nuevoProgreso = { ...progresoSimulado };
        materiasCursables.forEach(m => {
            nuevoProgreso[m.codigo] = estado;
        });
        setProgresoSimulado(nuevoProgreso);
    }

    return (
        <div className="flex flex-col gap-12 py-12 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">
            <ConfiguracionSimulador
                isOpen={isConfiguracionOpen}
                onOpenChange={onConfiguracionOpenChange}
                onClose={onConfiguracionClose}
                setModo={setModo}
                setAnio={setAnioInicio}
                setCuatri={setCuatriInicio}
                setPlan={setPlan}
            />

            {!plan && !cargando && (
                <div className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-in fade-in duration-500">
                    <div className="bg-primary/10 p-6 rounded-full">
                        <i className="fa-solid fa-gear text-5xl text-primary animate-spin-slow"></i>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Configuración Requerida</h2>
                        <p className="text-foreground/80 max-w-sm">Para comenzar la simulación, primero debemos definir los parámetros iniciales.</p>
                    </div>
                    <Button
                        color="primary"
                        size="lg"
                        variant="shadow"
                        className="font-bold rounded-2xl px-12"
                        onPress={onConfiguracionOpen}
                    >
                        Configurar Ahora
                    </Button>
                </div>
            )}

            {plan && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-center mb-0">
                        <HeaderSimulador />
                        <Button
                            isIconOnly
                            variant="flat"
                            color="primary"
                            onPress={onConfiguracionOpen}
                            className="rounded-xl"
                        >
                            <i className="fa-solid fa-sliders"></i>
                        </Button>
                    </div>

                    {cargando ? (
                        <div className="flex justify-center py-20">
                            <Spinner size="lg" label="Preparando simulación..." color="primary" labelColor="primary" />
                        </div>
                    ) : (
                        <div className="mt-8 flex flex-col pt-4 relative">
                            {/* HISTORIAL ACADÉMICO */}
                            {historialSemestres.length > 0 && (
                                <div id="historial-container" className={`flex flex-col mb-8 relative px-6 md:px-10 pb-4 bg-background border border-default-100/50 rounded-3xl m-0 ${descargandoPDF ? 'w-[800px] max-w-none mx-0' : 'w-full max-w-5xl mx-auto'}`}>
                                    {descargandoPDF && (
                                        <div className="w-full text-center py-6 mb-4 border-b-2 border-primary/20">
                                            <h1 className="text-3xl font-black text-foreground tracking-tight">Registro de Avance Universitario</h1>
                                            <h2 className="text-lg font-bold text-primary mt-1 uppercase tracking-widest">
                                                Licenciatura en Sistemas — Plan {plan}
                                            </h2>
                                        </div>
                                    )}

                                    <div className={`absolute top-0 bottom-0 left-[11px] w-[2px] bg-default-200 ${descargandoPDF ? 'top-[150px]' : ''}`} data-html2canvas-ignore></div>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3" data-html2canvas-ignore>
                                        <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
                                            <i className="fa-regular fa-clock"></i> Historial Académico
                                        </h3>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                onPress={() => setOpenedAccordions(new Set(historialSemestres.map((_, i) => String(i))))}
                                                className="font-medium flex-1 sm:flex-none"
                                            >
                                                Mostrar Todos
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="danger"
                                                onPress={() => setOpenedAccordions(new Set())}
                                                className="font-medium flex-1 sm:flex-none"
                                            >
                                                Ocultar Todos
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        {historialSemestres.map((item, idx) => {
                                            const materiasCursadasReales = item.materiasDelSemestre.filter(m => item.progresoSnapshot[m.codigo] === "Cursado" && item.progresoBaseSnapshot[m.codigo] !== "Cursado")
                                            const totalSemestre = item.materiasDelSemestre.length

                                            let horasTotalesDelSemestre = 0;
                                            let horasSemanalesDelSemestre = 0;
                                            materiasCursadasReales.forEach(m => {
                                                if (m.horas_totales) horasTotalesDelSemestre += Number(m.horas_totales) || 0;
                                                if (m.horas_semanales) horasSemanalesDelSemestre += Number(m.horas_semanales) || 0;
                                            });

                                            return (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[27px] top-6 bg-success text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm ring-4 ring-background z-10" data-html2canvas-ignore>
                                                        <i className="fa-solid fa-check"></i>
                                                    </div>

                                                    <Accordion
                                                        selectionMode="multiple"
                                                        selectedKeys={openedAccordions.has(String(idx)) ? [String(idx)] : []}
                                                        onSelectionChange={(keys) => {
                                                            setOpenedAccordions(prev => {
                                                                const newSet = new Set(prev);
                                                                if (keys.has(String(idx))) newSet.add(String(idx));
                                                                else newSet.delete(String(idx));
                                                                return newSet;
                                                            });
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
                                                                    {(horasTotalesDelSemestre > 0 || horasSemanalesDelSemestre > 0) && (
                                                                        <div className="w-full flex gap-3 text-[11px] sm:text-xs font-medium text-foreground/50 mt-0.5">
                                                                            {horasTotalesDelSemestre > 0 && <span className="flex items-center gap-1 whitespace-nowrap"><i data-html2canvas-ignore className="fa-regular fa-clock"></i> {horasTotalesDelSemestre}h totales</span>}
                                                                            {horasSemanalesDelSemestre > 0 && <span className="flex items-center gap-1 whitespace-nowrap"><i data-html2canvas-ignore className="fa-solid fa-calendar-week"></i> {horasSemanalesDelSemestre}h/sem</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            }
                                                        >
                                                            <div className={`grid ${descargandoPDF ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-3 px-2 pb-4`}>
                                                                {item.materiasDelSemestre.map((materia) => (
                                                                    <Card key={materia.codigo} className={`p-3 border ${item.progresoSnapshot[materia.codigo] === "Cursado" ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"} shadow-none`}>
                                                                        <div className="flex items-center gap-3">
                                                                            <i data-html2canvas-ignore className={`fa-regular ${item.progresoSnapshot[materia.codigo] === "Cursado" ? "fa-circle-check text-success" : "fa-clock text-warning"} text-lg`}></i>
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
                            )}

                            {/* ESTADO ACTUAL O FINALZADO */}
                            <div>
                                {simulacionTerminada ? (
                                    <div className="flex flex-col gap-4 sm:gap-6 w-full mt-4">
                                        <Card className='bg-linear-to-r from-success to-emerald-500 text-white shadow-lg border-none rounded-2xl w-full'>
                                            <CardBody className="p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-2 sm:space-y-4">
                                                <div className="bg-white/20 p-4 sm:p-5 rounded-full backdrop-blur-md">
                                                    <i className="fa-solid fa-graduation-cap text-4xl sm:text-5xl"></i>
                                                </div>
                                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">¡Carrera Finalizada!</h2>
                                                <p className="text-white/90 text-xs sm:text-sm max-w-sm">
                                                    Has completado todas las materias.<br />
                                                    Según esta simulación, <strong>te egresarías en el año {anioActual}</strong>.
                                                </p>
                                            </CardBody>
                                        </Card>

                                        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                                            <Button
                                                color="primary"
                                                variant="shadow"
                                                size="lg"
                                                className="font-bold rounded-xl text-white w-full sm:w-auto flex items-center gap-2"
                                                onPress={() => {
                                                    const existe = localStorage.getItem(`simulacion+${plan}`);
                                                    if (existe) {
                                                        onGuardarOpen();
                                                    } else {
                                                        localStorage.setItem(`simulacion+${plan}`, JSON.stringify({
                                                            historialSemestres, progresoSimulado, progresoBase, anioActual, cuatri, simulacionTerminada
                                                        }));
                                                        try { addToast({ title: "Éxito", description: "Simulación guardada", color: "success" }) } catch (e) { }
                                                    }
                                                }}
                                            >
                                                <i className="fa-solid fa-floppy-disk"></i>
                                                Guardar Simulación
                                            </Button>
                                            <Button
                                                color="success"
                                                variant="flat"
                                                size="lg"
                                                className="font-bold rounded-xl w-full sm:w-auto flex items-center gap-2"
                                                onPress={handleDownloadPDF}
                                                isLoading={descargandoPDF}
                                            >
                                                {!descargandoPDF && <i className="fa-solid fa-file-pdf"></i>}
                                                Descargar en PDF
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Card className='mb-6 bg-primary text-primary-foreground shadow-lg border-none rounded-3xl overflow-hidden relative'>
                                            {/* Decoración abstracta para que no sea un bloque plano */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

                                            <CardBody className="p-5 md:p-8 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm hidden md:block">
                                                        <i className="fa-regular fa-calendar-days text-3xl"></i>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="text-xs text-white/80 font-semibold tracking-wider uppercase mb-1">Simulando Ahora</div>
                                                        <div className="text-xl md:text-3xl font-bold">
                                                            {cuatri}º Cuatrimestre - Año {anioActual}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        <div className="flex flex-col sm:flex-row gap-2 justify-end mb-4">
                                            <Button
                                                variant="flat"
                                                color="success"
                                                size="sm"
                                                className="font-medium"
                                                onPress={() => marcarTodasEnPantalla("Cursado")}
                                                startContent={<i className="fa-solid fa-check-double" />}
                                                isDisabled={materiasCursables.length === 0}
                                            >
                                                Marcar Todas
                                            </Button>
                                            <Button
                                                variant="flat"
                                                color="danger"
                                                size="sm"
                                                className="font-medium"
                                                onPress={() => marcarTodasEnPantalla("No Cursado")}
                                                startContent={<i className="fa-solid fa-rotate-left" />}
                                                isDisabled={materiasCursables.length === 0}
                                            >
                                                Desmarcar Todas
                                            </Button>
                                        </div>

                                        {materiasCursables.length === 0 ? (
                                            <div className="p-8 text-center text-foreground/80 bg-default-50 rounded-2xl border-2 border-dashed border-default-200">
                                                <i className="fa-regular fa-folder-open text-4xl mb-3 text-default-300"></i>
                                                <p>No tienes materias disponibles para este cuatrimestre.</p>
                                                <p className="text-xs mt-1">Sigue avanzando para desbloquear nuevas asignaturas.</p>
                                            </div>
                                        ) : (
                                            <MateriasSimulador
                                                materiasCursables={materiasCursables}
                                                cambioDeEstado={cambioDeEstado}
                                                progreso={progresoSimulado}
                                            />
                                        )}
                                    </>
                                )}

                                <Card className='mt-8 bg-background/60 backdrop-blur-md border border-default-200 shadow-sm rounded-2xl'>
                                    <CardBody className="flex flex-col md:flex-row justify-between items-center p-4 md:p-6 gap-4">
                                        <Button
                                            onPress={() => handleAnterior()}
                                            isDisabled={!estadoAnterior}
                                            variant="flat"
                                            color="primary"
                                            startContent={<i className="fa-solid fa-chevron-left" />}
                                            className="w-full md:w-auto font-medium"
                                        >
                                            Anterior
                                        </Button>

                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-xs md:text-sm text-foreground/80 font-medium tracking-wider uppercase mb-1">
                                                Progreso
                                            </span>
                                            <span className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                                                {simulacionTerminada ? "Simulación finalizada" : "Continúa configurando el semestre"}
                                            </span>
                                        </div>

                                        <Button
                                            onPress={() => handleSiguiente()}
                                            isDisabled={!estadoSiguiente}
                                            variant="shadow"
                                            color="primary"
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
            )
            }

            <Modal isOpen={isGuardarOpen} onOpenChange={onGuardarOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Sobrescribir Simulación</ModalHeader>
                            <ModalBody>
                                <p className="text-foreground/80">
                                    Ya tienes una simulación guardada para este plan. Si guardas ahora, tu simulación anterior será reemplazada permanentemente. ¿Deseas continuar?
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => {
                                    localStorage.setItem(`simulacion+${plan}`, JSON.stringify({
                                        historialSemestres, progresoSimulado, progresoBase, anioActual, cuatri, simulacionTerminada
                                    }));
                                    try { addToast({ title: "Éxito", description: "Simulación sobrescrita exitosamente.", color: "success" }) } catch (e) { }
                                    onGuardarClose();
                                }}>
                                    Sobrescribir
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div >
    )
}

export default Simulador