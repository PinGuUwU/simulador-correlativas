import React, { useEffect, useState } from 'react'
import HeaderSimulador from '../components/Simulador/HeaderSimulador'
import MateriasSimulador from '../components/Simulador/MateriasSimulador'
import MateriaCard from '../components/Simulador/MateriaCard'
import ConfiguracionSimulador from '../components/Simulador/modals/ConfiguracionSimulador'
import { Button, Spinner, useDisclosure } from '@heroui/react'

function Simulador() {

    //Estados para guardar las materias y para mostrar una imagen de cargando, además para contabilizar el progreso
    const [materias, setMaterias] = useState([])
    const [progreso, setProgreso] = useState([])
    const [cargando, setCargando] = useState(true)
    const [plan, setPlan] = useState("17.14")
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
    //Busca las materias desde la base de datos, en base al plan seleccionado
    useEffect(() => {

        const fetchMaterias = async () => {
            try {
                //Hago la petición al backend
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/${plan}`)
                if (!response) {
                    throw new Error("Error en la respuesta del servidor")
                }

                const data = await response.json()
                setMaterias(data)

                //Inicializo acá mismo el progreso
                let progresoInicial = {}
                const storageKey = `progreso+${plan}`;
                const storageData = localStorage.getItem(storageKey);

                if (!storageData) {
                    data.forEach(m => {
                        progresoInicial[m.codigo] = (m.correlativas.length > 0 ? 'Bloqueado' : estadosPosibles[0])
                    })
                    localStorage.setItem(storageKey, JSON.stringify(progresoInicial))
                } else {
                    progresoInicial = JSON.parse(storageData)
                }

                setProgreso(progresoInicial)


                //Ya no está cargando porque ya tenemos la data
                setCargando(false)
            } catch (error) {
                console.error("Error al traer las materias:", error)
                setCargando(false)
            }
        }
        fetchMaterias()
        onConfiguracionOpen()
    }, [setPlan])//Array vacío para que se ejecute una única vez

    return (
        <div>
            {/* Modal de configuración inicial */}
            <ConfiguracionSimulador
                isOpen={isConfiguracionOpen}
                onOpenChange={onConfiguracionOpenChange}
                onClose={onConfiguracionClose}
                setModo={setModo}
                setAnio={setAnio}
                setCuatri={setCuatri}
            />
            <Button onPress={() => onConfiguracionOpen()}>Abrir Modal de Configuración</Button>
            <HeaderSimulador />
            {!cargando &&
                <MateriasSimulador
                    anio={anio}
                    cuatri={cuatri}
                    materias={materias}
                    progreso={progreso}
                />
            }
            {cargando &&
                <Spinner />
            }
            {/* Acá va la lógica para ir hacia adelante y hacia atrás en el avance */}
        </div>
    )
}

export default Simulador