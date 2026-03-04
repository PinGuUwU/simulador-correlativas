import { useState, useEffect } from 'react'
import MateriaCard from '../components/MateriaCard'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'

function Tabla() {
    //Estados para guardar las materias y para mostrar una imagen de cargando
    const [materias, setMaterias] = useState([])
    const [cargando, setCargando] = useState(true)
    const numsRomanos = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

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

    const cuatrimestres = [...new Set(materias.map((m) => Number(m.cuatrimestre)))].sort((a, b) => a - b)

    return (
        <div className=''>
            {/* {
                materias.map((materia, index) => (
                    <MateriaCard
                        key={materia.codigo != "N/A" ? materia.codigo : (materia.codigo + `${index}`)} // Le hago el id único porque es buena práctica
                        materia={materia} //Paso la materia
                    />
                ))
            } */}
            <Table isStriped aria-label="Plan de estudios">
                <TableHeader>
                    <TableColumn className='text-center'>Cuatrimestre</TableColumn>
                    <TableColumn className='text-center'>Materias</TableColumn>
                </TableHeader>

                <TableBody>
                    {cuatrimestres.map((cuatri) => {
                        // Me quedo con las materias de este cuatrimestre
                        const materiasCuatri = materias.filter((m) => Number(m.cuatrimestre) === cuatri)

                        //Hago el bloque visual del cuatrimestre
                        return (
                            <TableRow key={cuatri}>
                                <TableCell className='text-center p-6'>
                                    <p>
                                        Cuatrimestre {cuatri}
                                    </p>
                                    <p>{numsRomanos[cuatri]}</p>
                                </TableCell>
                                <TableCell className='py-8 md:py-10'>
                                    <div className='grid gap-8 place-items-center'
                                        style={{ gridTemplateColumns: `repeat(${materiasCuatri.length}, minmax(0, 1fr))` }}
                                    >
                                        {materiasCuatri.map((materia, index) => (
                                            <MateriaCard
                                                key={materia.codigo != "N/A" ? materia.codigo : (materia.codigo + `${index}`)} // Le hago el id único porque es buena práctica
                                                materia={materia} //Paso la materia
                                            />
                                        ))}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })
                    }
                </TableBody>
            </Table>
        </div>
    )
}



export default Tabla