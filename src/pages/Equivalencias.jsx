import React, { useState, useEffect } from 'react';
import { useEquivalencias } from '../hooks/useEquivalencias';
import HeaderEquivalencias from '../components/Equivalencias/HeaderEquivalencias';
import ListaMaterias from '../components/Equivalencias/ListaMaterias';
import SearchMateria from '../components/Equivalencias/SearchMateria';
import { trackSearch } from '../services/analyticsService';
import { Tabs, Tab, Card, CardBody, Switch, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Progress, Chip, Checkbox } from "@heroui/react";
import { ListFilter, Save, RotateCcw, Download, Info, Edit3, Clock, TrendingDown, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

function Equivalencias() {
    const navigate = useNavigate();
    const {
        planViejo, planNuevo, progresoSimulado, materiasFiltradas, filtro, setFiltro, busqueda, setBusqueda,
        modoEdicion, setModoEdicion, toggleEstado, guardarSimulacion, cargarSimulacion, cargarProgresoReal,
        comparativaHoras, stats
    } = useEquivalencias();

    // Trackear búsquedas con debounce (evitar ruido en analytics)
    useEffect(() => {
        if (!busqueda) return;
        const timer = setTimeout(() => {
            trackSearch({ 
                term: busqueda, 
                resultsCount: materiasFiltradas.length, 
                context: 'equivalencias' 
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [busqueda, materiasFiltradas.length]);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { 
        isOpen: isWarningOpen, 
        onOpen: onWarningOpen, 
        onOpenChange: onWarningOpenChange,
        onClose: onWarningClose 
    } = useDisclosure();

    const [materiaPendiente, setMateriaPendiente] = useState(null);
    const [noMostrarAlerta, setNoMostrarAlerta] = useState(false);

    const handleMateriaClick = (codigo) => {
        if (!modoEdicion) {
            setMateriaPendiente(codigo);
            onOpen();
        } else {
            toggleEstado(codigo);
        }
    };

    const handleSwitchChange = (isSelected) => {
        if (isSelected && !noMostrarAlerta) {
            onWarningOpen();
        } else {
            setModoEdicion(isSelected);
        }
    };

    const confirmarActivacion = () => {
        setModoEdicion(true);
        if (materiaPendiente) toggleEstado(materiaPendiente);
        onWarningClose();
    };

    const handleActivarEdicion = () => {
        if (!noMostrarAlerta) {
            onWarningOpen();
        } else {
            setModoEdicion(true);
            if (materiaPendiente) toggleEstado(materiaPendiente);
        }
        onOpenChange(); // Cierra el modal de modo lectura
    };

    if (!planViejo || !planNuevo) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 pb-24 lg:pb-8">
            <HeaderEquivalencias
                progresoViejo={stats.porcentajeViejo}
                progresoNuevo={stats.porcentajeNuevo}
                totalMaterias={stats.totalNuevas}
                equivalenciasAprobadas={stats.aprobadasNuevas}
            />

            {/* Comparativa de Carga Horaria - Restaurado al formato preferido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <Card className="border border-default-100 shadow-sm overflow-hidden">
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-primary" />
                                <h3 className="font-bold text-sm uppercase tracking-wider">Carga Horaria Restante</h3>
                            </div>
                            <Chip 
                                aria-label="Estado de balance de horas"
                                size="sm" variant="flat" color="primary" className="font-bold">
                                {comparativaHoras?.nuevo.restantes < comparativaHoras?.viejo.restantes ? 'Más Eficiente' : 'Balance'}
                            </Chip>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[11px] font-black uppercase text-default-800 dark:text-default-400 mb-1">
                                    <span>Plan 17.13 (Actual)</span>
                                    <span>{comparativaHoras?.viejo.restantes}h / {comparativaHoras?.viejo.totales}h</span>
                                </div>
                                <Progress 
                                    aria-label="Progreso de horas restantes plan 17.13"
                                    size="sm" 
                                    value={(comparativaHoras?.viejo.restantes * 100) / (comparativaHoras?.viejo.totales || 1)} 
                                    color="default"
                                    className="rotate-180"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-[11px] font-bold uppercase text-primary mb-1">
                                    <span>Plan 17.14 (Nuevo)</span>
                                    <span>{comparativaHoras?.nuevo.restantes}h / {comparativaHoras?.nuevo.totales}h</span>
                                </div>
                                <Progress 
                                    aria-label="Progreso de horas restantes plan 17.14"
                                    size="sm" 
                                    value={(comparativaHoras?.nuevo.restantes * 100) / (comparativaHoras?.nuevo.totales || 1)} 
                                    color="primary"
                                    className="rotate-180"
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-primary border-none shadow-lg shadow-primary/20 text-primary-foreground">
                    <CardBody className="p-4 flex flex-row items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <TrendingDown size={32} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary-foreground/90">Diferencia de cursada</h4>
                            <p className="text-2xl font-black text-primary-foreground">
                                {Math.abs(comparativaHoras?.viejo.restantes - comparativaHoras?.nuevo.restantes)} horas
                            </p>
                            <p className="text-[10px] font-bold text-primary-foreground/95 mt-1 italic">
                                {comparativaHoras?.nuevo.restantes < comparativaHoras?.viejo.restantes 
                                    ? '* El plan nuevo reduce tu carga horaria total restante.' 
                                    : '* El plan nuevo mantiene o incrementa levemente tu carga horaria.'}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Switch de Modo Edición */}
            <div className="sticky top-4 z-40 my-6 lg:static">
                <Card className="bg-background/80 backdrop-blur-md border border-primary/20 shadow-lg lg:shadow-none">
                    <CardBody className="p-3 flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${modoEdicion ? 'bg-primary text-white' : 'bg-default-100 text-default-500'}`}>
                                <Edit3 size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-wider text-foreground">Modo Simulación</p>
                                <p className="text-[10px] text-default-800 dark:text-default-400 leading-none font-bold">Edita estados para proyectar tu avance</p>
                            </div>
                        </div>
                        <Switch 
                            aria-label="Activar modo edición"
                            isSelected={modoEdicion} 
                            onValueChange={handleSwitchChange} 
                            color="primary" 
                            size="md" 
                        />
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside className="lg:col-span-1 space-y-6">
                    <Card className="shadow-sm border border-default-100">
                        <CardBody className="p-4 gap-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ListFilter size={18} className="text-primary" />
                                <h3 className="font-extrabold text-sm uppercase tracking-wider text-foreground">Filtros</h3>
                            </div>
                            <SearchMateria busqueda={busqueda} setBusqueda={setBusqueda} />
                            <Tabs 
                                aria-label="Filtros de estado de materias" 
                                color="primary" 
                                variant="bordered" 
                                fullWidth 
                                selectedKey={filtro} 
                                onSelectionChange={setFiltro}
                                classNames={{ 
                                    tabList: "flex-wrap", 
                                    tabContent: "text-xs font-bold w-full text-center truncate" 
                                }}
                            >
                                <Tab key="todas" title="Todas" />
                                <Tab key="aprobadas" title="Aprobadas" />
                                <Tab key="pendientes" title="Pendientes" />
                            </Tabs>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm border border-default-100">
                        <CardBody className="p-4 gap-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Save size={18} className="text-primary" />
                                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground/70">Simulación</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Button 
                                    aria-label="Guardar cambios de simulación"
                                    size="sm" variant="flat" color="primary" startContent={<Save size={14}/>} onPress={guardarSimulacion} className="font-bold uppercase text-[10px]">Guardar Cambios</Button>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        aria-label="Cargar simulación guardada"
                                        size="sm" variant="bordered" startContent={<Download size={14}/>} onPress={cargarSimulacion} className="font-bold uppercase text-[10px]">Cargar</Button>
                                    <Button 
                                        aria-label="Reiniciar simulación al progreso real"
                                        size="sm" variant="bordered" color="danger" startContent={<RotateCcw size={14}/>} onPress={cargarProgresoReal} className="font-bold uppercase text-[10px]">Reiniciar</Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </aside>

                <main className="lg:col-span-3">
                    <ListaMaterias
                        materiasFiltradas={materiasFiltradas}
                        progresoSimulado={progresoSimulado}
                        onToggleEstado={handleMateriaClick}
                    />
                </main>
            </div>

            {/* Modal de Advertencia de Modo Simulación */}
            <Modal isOpen={isWarningOpen} onOpenChange={onWarningOpenChange} backdrop="blur" size="md">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 items-center pt-8">
                                <div className="w-14 h-14 bg-warning-100 rounded-full flex items-center justify-center text-warning-600 mb-2">
                                    <AlertTriangle size={30} />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Atención: Modo Simulación</h3>
                            </ModalHeader>
                            <ModalBody className="text-center space-y-4">
                                <p className="text-sm text-default-600 leading-relaxed">
                                    Esta herramienta es <b>meramente visual</b>. Los cambios que realices aquí no se actualizarán en cascada (correlativas).
                                </p>
                                <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100">
                                    <p className="text-[13px] text-primary-700 font-medium">
                                        Si buscas proyectar tu avance completo con validación de correlativas, te recomendamos usar nuestro simulador especializado.
                                    </p>
                                </div>
                                <Checkbox 
                                    isSelected={noMostrarAlerta} 
                                    onValueChange={setNoMostrarAlerta}
                                    size="sm"
                                    classNames={{ label: "text-xs font-bold text-default-500" }}
                                >
                                    No volver a mostrar en esta sesión
                                </Checkbox>
                            </ModalBody>
                            <ModalFooter className="flex flex-col gap-2 pt-6">
                                <Button 
                                    color="primary" 
                                    className="w-full font-black uppercase tracking-wider shadow-lg shadow-primary/20" 
                                    onPress={confirmarActivacion}
                                >
                                    Continuar con la edición
                                </Button>
                                <Button 
                                    variant="flat" 
                                    color="primary"
                                    className="w-full font-bold" 
                                    onPress={() => {
                                        onClose();
                                        navigate('/simulador');
                                    }}
                                    endContent={<ArrowRight size={16} />}
                                >
                                    Ir al Simulador Pro
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal de Modo Lectura */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xs">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 items-center pt-8">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2"><Info size={24} /></div>
                                <h3 className="text-xl font-bold">Modo Lectura</h3>
                            </ModalHeader>
                            <ModalBody className="text-center">
                                <p className="text-sm text-default-500">Para modificar el estado de las materias y simular tu avance, debes activar el <b>Modo Edición</b>.</p>
                            </ModalBody>
                            <ModalFooter className="flex-col gap-2 pt-6">
                                <Button 
                                    aria-label="Activar edición desde modal"
                                    color="primary" className="w-full font-bold" onPress={handleActivarEdicion}>Activar Edición</Button>
                                <Button 
                                    aria-label="Cerrar modal"
                                    variant="light" className="w-full font-bold" onPress={onClose}>Cancelar</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

export default Equivalencias;

