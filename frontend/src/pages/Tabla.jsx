import { useState, useEffect } from 'react'

function Tabla() {
    //Estados para guardar las materias y para mostrar una imagen de cargando
    const [materias, setMaterias] = useState([])
    const [cargando, setCargando] = useState(true)
    const plan = "17.13"
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
                //Ya no está cargando porque ya tenemos la data
                setCargando(false)
            } catch (error) {
                console.error("Error al traer las materias:", error)
                setCargando(false)
            }
        }
        fetchMaterias()
    }, [])//Array vacío para que se ejecute una única vez

    return (
        <div>

        </div>
    )
}

export default Tabla