import React, { useEffect, useState } from 'react'
import HeaderSimulador from '../components/Simulador/HeaderSimulador'
import MateriasSimulador from '../components/Simulador/MateriasSimulador'
import ConfiguracionSimulador from '../components/Simulador/modals/ConfiguracionSimulador'
import { Button, Spinner, useDisclosure, Card, CardBody } from '@heroui/react'

function Simulador() {
    const [materias, setMaterias] = useState([])
    const [plan, setPlan] = useState("")
    const [progresoSimulado, setProgresoSimulado] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [cuatri, setCuatri] = useState()
    const [anio, setAnio] = useState()
    const [modo, setModo] = useState()

    const {
        isOpen: isConfiguracionOpen,
        onClose: onConfiguracionClose,
        onOpenChange: onConfiguracionOpenChange,
        onOpen: onConfiguracionOpen
    } = useDisclosure()

    const estadosPosibles = ['Regular', 'Aprobado', 'Sin Cursar']

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

                const storageKey = `progreso+${plan}`
                const storageData = localStorage.getItem(storageKey)

                let progresoInicial = {}
                if (!storageData) {
                    data.forEach(m => {
                        progresoInicial[m.codigo] = (m.correlativas.length > 0 ? 'Bloqueado' : 'Sin Cursar')
                    })
                } else {
                    progresoInicial = JSON.parse(storageData)
                }

                setProgresoSimulado(progresoInicial)
                setCargando(false)
            } catch (error) {
                console.error("Error al traer las materias:", error)
                setCargando(false)
            }
        }
        fetchMaterias()
    }, [plan])


    return (
        <div className="flex flex-col gap-12 py-12 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">
            <ConfiguracionSimulador
                isOpen={isConfiguracionOpen}
                onOpenChange={onConfiguracionOpenChange}
                onClose={onConfiguracionClose}
                setModo={setModo}
                setAnio={setAnio}
                setCuatri={setCuatri}
                setPlan={setPlan}
            />

            {!plan && !cargando && (
                <div className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-in fade-in duration-500">
                    <div className="bg-primary/10 p-6 rounded-full">
                        <i className="fa-solid fa-gear text-5xl text-primary animate-spin-slow"></i>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Configuración Requerida</h2>
                        <p className="text-default-500 max-w-sm">Para comenzar la simulación, primero debemos definir los parámetros iniciales.</p>
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
                    <div className="flex justify-between items-center mb-4">
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
                        <MateriasSimulador
                            anio={anio}
                            cuatri={cuatri}
                            materias={materias}
                            progreso={progresoSimulado}
                            modo={modo}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default Simulador