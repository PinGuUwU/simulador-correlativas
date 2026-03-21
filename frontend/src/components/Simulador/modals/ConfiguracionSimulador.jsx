import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup, Select, SelectItem } from '@heroui/react'
import selectUtils from '../../../utils/Simulador/selectUtils.js'
import { useState } from 'react'

function ConfiguracionSimulador({ isOpen, onOpenChange, onClose, setAnio, setModo, setCuatri, setPlan }) {

    const [confiPlan, setConfiPlan] = useState("17.14")
    const [confiAnio, setConfiAnio] = useState("2026")
    const [confiCuatri, setConfiCuatri] = useState("1")
    const [confiModo, setConfiModo] = useState("viejo")

    const handleConfigurar = () => {
        setAnio(confiAnio)
        setPlan(confiPlan)
        setCuatri(confiCuatri)
        setModo(confiModo)
        console.log(confiModo, confiAnio, confiCuatri, confiPlan);
        // Cierro el modal al terminar de configurar
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            // En móvil se pega abajo como un "drawer", en desktop va al centro
            placement="bottom-center"
            size="md"
            disableAnimation
            scrollBehavior="inside"
            backdrop="blur"
            classNames={{
                base: "sm:rounded-3xl rounded-t-3xl border-0 shadow-2xl max-h-[90vh]",
                header: "border-b border-default-100 p-6",
                body: "p-4 sm:p-6 gap-6",
                footer: "border-t border-default-100 p-6",
                closeButton: "hover:bg-default-100 active:bg-default-200 transition-colors",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className='flex flex-col gap-1'>
                            <div className='flex items-center gap-3'>
                                {/* Icono con color primary consistente */}
                                <div className='bg-primary text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30'>
                                    <i className='fa-solid fa-sliders text-lg' />
                                </div>
                                <div className='flex flex-col'>
                                    <h2 className='text-xl font-bold text-foreground'>
                                        Configurar Simulación
                                    </h2>
                                    <p className='text-[12px] font-medium text-foreground/60 uppercase tracking-wider'>
                                        Parámetros Iniciales
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>

                        <ModalBody>
                            {/* Sección: Fecha de Inicio y plan */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-foreground">
                                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                                    <h3 className="font-bold text-md">Plan</h3>
                                </div>

                                <Select
                                    disableAnimation
                                    label="Plan de estudio"
                                    aria-label="Seleccionar Plan de estudio"
                                    variant="flat"
                                    defaultSelectedKeys={["17.14"]}
                                    onSelectionChange={(keys) => setConfiPlan(Array.from(keys)[0])}
                                    classNames={{
                                        trigger: "bg-default-50 border border-default-100 rounded-2xl shadow-sm h-14",
                                        label: "text-foreground/80 font-medium"
                                    }}
                                >
                                    {selectUtils.plans.map((anio) => (
                                        <SelectItem key={anio.key} textValue={anio.label}>
                                            {anio.label}
                                        </SelectItem>
                                    ))}
                                </Select>


                                <div className="flex items-center gap-2 text-foreground">
                                    <div className="w-1 h-5 bg-primary rounded-full"></div> {/* Indicador lateral */}
                                    <h3 className="font-bold text-md">Fecha de Inicio</h3>
                                </div>

                                <div className='flex flex-col sm:flex-row gap-3'>
                                    <Select
                                        disableAnimation
                                        label="Año de inicio"
                                        aria-label="Año de inicio de la simulación"
                                        variant="flat"
                                        defaultSelectedKeys={["2026"]}
                                        onSelectionChange={(keys) => setConfiAnio(Array.from(keys)[0])}
                                        classNames={{
                                            trigger: "bg-default-50 border border-default-100 rounded-2xl shadow-sm h-14",
                                            label: "text-foreground/80 font-medium"
                                        }}
                                    >
                                        {selectUtils.anios.map((anio) => (
                                            <SelectItem key={anio.key} textValue={anio.label}>
                                                {anio.label}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        disableAnimation
                                        label="Cuatrimestre"
                                        aria-label="Cuatrimestre de inicio"
                                        variant="flat"
                                        defaultSelectedKeys={["1"]}
                                        onSelectionChange={(keys) => setConfiCuatri(Array.from(keys)[0])}
                                        classNames={{
                                            trigger: "bg-default-50 border border-default-100 rounded-2xl shadow-sm h-14",
                                            label: "text-foreground/80 font-medium"
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
                                <div className="flex items-center gap-2 text-foreground">
                                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                                    <h3 className="font-bold text-md">Modo de simulación</h3>
                                </div>

                                <RadioGroup
                                    defaultValue={"viejo"}
                                    aria-label="Modo de simulación"
                                    onValueChange={setConfiModo}
                                    classNames={{ wrapper: "gap-3" }}
                                >
                                    <Radio
                                        value="viejo"
                                        classNames={{
                                            base: "inline-flex m-0 bg-content1 hover:bg-primary/5 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-2xl gap-4 p-4 border border-default-100 shadow-sm transition-all data-[selected=true]:border-primary data-[selected=true]:bg-primary/10",
                                            label: "text-foreground font-bold text-sm",
                                            description: "text-foreground/80 text-[11px] leading-tight",
                                        }}
                                        description="Cargá tus materias aprobadas y regulares automáticamente."
                                    >
                                        Usar mi progreso actual
                                    </Radio>
                                    <Radio
                                        value="nuevo"
                                        classNames={{
                                            base: "inline-flex m-0 bg-content1 hover:bg-primary/5 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-2xl gap-4 p-4 border border-default-100 shadow-sm transition-all data-[selected=true]:border-primary data-[selected=true]:bg-primary/10",
                                            label: "text-foreground font-bold text-sm",
                                            description: "text-foreground/80 text-[11px] leading-tight",
                                        }}
                                        description="Iniciá una planificación limpia desde el primer año."
                                    >
                                        Empezar desde cero
                                    </Radio>
                                    {localStorage.getItem(`simulacion+${confiPlan}`) && (
                                        <Radio
                                            value="guardado"
                                            classNames={{
                                                base: "inline-flex m-0 bg-content1 hover:bg-primary/5 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-2xl gap-4 p-4 border border-default-100 shadow-sm transition-all data-[selected=true]:border-primary data-[selected=true]:bg-primary/10",
                                                label: "text-foreground font-bold text-sm",
                                                description: "text-foreground/80 text-[11px] leading-tight",
                                            }}
                                            description="Continuá tu simulación exactamente donde la dejaste."
                                        >
                                            Cargar simulación guardada
                                        </Radio>
                                    )}
                                </RadioGroup>
                            </div>
                        </ModalBody>

                        <ModalFooter className="flex-col sm:flex-row gap-3">
                            <Button
                                color="primary"
                                className="w-full sm:w-auto rounded-2xl font-bold h-12 shadow-lg shadow-primary/30"
                                onPress={() => handleConfigurar()}
                            >
                                Comenzar Simulación
                            </Button>
                            <Button
                                variant="light"
                                onPress={onClose}
                                className="w-full sm:w-auto rounded-2xl font-semibold h-12 text-foreground/60"
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