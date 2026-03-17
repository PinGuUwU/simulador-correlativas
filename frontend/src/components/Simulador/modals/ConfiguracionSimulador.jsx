import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup, Select, SelectItem } from '@heroui/react'
import selectUtils from '../../../utils/Simulador/selectUtils.js'

function ConfiguracionSimulador({ isOpen, onOpenChange, onClose }) {

    const handleConfigurar = () => {
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            // En móvil se pega abajo como un "drawer", en desktop va al centro
            placement="bottom-center"
            size="md"
            scrollBehavior="inside"
            backdrop="blur"
            classNames={{
                base: "sm:rounded-3xl rounded-t-3xl border-0 shadow-2xl max-h-[90vh]",
                header: "border-b border-slate-100 p-6",
                body: "p-4 sm:p-6 gap-6",
                footer: "border-t border-slate-100 p-6",
                closeButton: "hover:bg-slate-100 active:bg-slate-200 transition-colors",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className='flex flex-col gap-1'>
                            <div className='flex items-center gap-3'>
                                {/* Icono azul consistente con tus status cards */}
                                <div className='bg-blue-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30'>
                                    <i className='fa-solid fa-sliders text-lg' />
                                </div>
                                <div className='flex flex-col'>
                                    <h2 className='text-xl font-bold text-slate-900'>
                                        Configurar Simulación
                                    </h2>
                                    <p className='text-[12px] font-medium text-slate-400 uppercase tracking-wider'>
                                        Parámetros Iniciales
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>

                        <ModalBody>
                            {/* Sección: Fecha de Inicio */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-slate-800">
                                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div> {/* Indicador lateral como en tu dashboard */}
                                    <h3 className="font-bold text-md">Fecha de Inicio</h3>
                                </div>

                                <div className='flex flex-col sm:flex-row gap-3'>
                                    <Select
                                        label="Año de inicio"
                                        variant="flat"
                                        defaultSelectedKeys={["2026"]}
                                        classNames={{
                                            trigger: "bg-slate-50 border border-slate-100 rounded-2xl shadow-sm h-14",
                                            label: "text-slate-500 font-medium"
                                        }}
                                    >
                                        {selectUtils.anios.map((anio) => (
                                            <SelectItem key={anio.key} textValue={anio.label}>
                                                {anio.label}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Cuatrimestre"
                                        variant="flat"
                                        defaultSelectedKeys={["1"]}
                                        classNames={{
                                            trigger: "bg-slate-50 border border-slate-100 rounded-2xl shadow-sm h-14",
                                            label: "text-slate-500 font-medium"
                                        }}
                                    >
                                        {selectUtils.cuatris.map((cuatri) => (
                                            <SelectItem key={cuatri.key} textValue={cuatri.label}>
                                                {cuatri.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            {/* Sección: Modo de Simulación */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-slate-800">
                                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                    <h3 className="font-bold text-md">Modo de simulación</h3>
                                </div>

                                <RadioGroup
                                    defaultValue="avanzado"
                                    classNames={{ wrapper: "gap-3" }}
                                >
                                    <Radio
                                        value="avanzado"
                                        classNames={{
                                            base: "inline-flex m-0 bg-white hover:bg-blue-50/30 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-2xl gap-4 p-4 border border-slate-100 shadow-sm transition-all data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50/50",
                                            label: "text-slate-900 font-bold text-sm",
                                            description: "text-slate-500 text-[11px] leading-tight",
                                        }}
                                        description="Cargá tus materias aprobadas y regulares automáticamente."
                                    >
                                        Usar mi progreso actual
                                    </Radio>
                                    <Radio
                                        value="nuevo"
                                        classNames={{
                                            base: "inline-flex m-0 bg-white hover:bg-blue-50/30 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-2xl gap-4 p-4 border border-slate-100 shadow-sm transition-all data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50/50",
                                            label: "text-slate-900 font-bold text-sm",
                                            description: "text-slate-500 text-[11px] leading-tight",
                                        }}
                                        description="Iniciá una planificación limpia desde el primer año."
                                    >
                                        Empezar desde cero
                                    </Radio>
                                </RadioGroup>
                            </div>
                        </ModalBody>

                        <ModalFooter className="flex-col sm:flex-row gap-3">
                            <Button
                                color="primary"
                                className="w-full sm:w-auto rounded-2xl font-bold h-12 shadow-lg shadow-blue-500/30"
                                onPress={() => handleConfigurar()}
                            >
                                Comenzar Simulación
                            </Button>
                            <Button
                                variant="light"
                                onPress={onClose}
                                className="w-full sm:w-auto rounded-2xl font-semibold h-12 text-slate-400"
                            >
                                Cancelar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default ConfiguracionSimulador