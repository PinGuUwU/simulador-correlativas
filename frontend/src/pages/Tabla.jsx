import { useState, useEffect } from 'react'
import MateriaCard from '../components/MateriaCard'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'

function Tabla() {
    //Estados para guardar las materias y para mostrar una imagen de cargando
    const [materias, setMaterias] = useState([])
    const [cargando, setCargando] = useState(true)
    const bloquear = 'Bloqueado'
    const desbloquear = 'Desbloqueado'
    const numsRomanos = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
    const estadosPosibles = ['Disponible', 'Regular', 'Aprobado']
    const [progreso, setProgreso] = useState({}) //Los estados de cada tarjeta de cada materia
    //Simulacion del plan elegido
    const plan = "17.13"
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
                //Ya no está cargando porque ya tenemos la data
                setCargando(false)
            } catch (error) {
                console.error("Error al traer las materias:", error)
                setCargando(false)
            }
        }
        fetchMaterias()
    }, [])//Array vacío para que se ejecute una única vez

    //Por la situación especial de las optativas, debo tener un useEffect para que cuando se actualice el progreso, revisar si hay que actualizar las optativas
    useEffect(() => {
        let huboCambios = false
        let nuevoProgreso = { ...progreso }
        const revisarOptativas = () => {
            //Filtro las optativas
            const optativas = materias.filter((m) => m.nombre.toLowerCase().includes("optativa "))
            //Recorro las optativas
            optativas.forEach((op) => {
                const cuatriLimite = Number(op.correlativas[0])

                //Verifico que todas las materias hasta el cuatri 7 estén aprobadas
                const hayMateriasPendientes = materias
                    .filter(m => Number(m.cuatrimestre) <= cuatriLimite)
                    .some(m => progreso[m.codigo] !== estadosPosibles[2])
                if (hayMateriasPendientes && progreso[op.codigo] !== bloquear) {
                    //Entonceshay materias no aprobadas, se bloquea la optativa
                    nuevoProgreso[op.codigo] = bloquear
                    huboCambios = true
                }
            })
        }
        revisarOptativas()
        if (huboCambios) {
            setProgreso(nuevoProgreso)
        }
    }, [progreso])

    //Por la situación en específico de la Tesina
    useEffect(() => {
        let huboCambios = false
        let nuevoProgreso = { ...progreso }
        //Obtengo la tesina
        const materia = materias.filter((m) => m.nombre.toLowerCase().includes("tesina de grado"))
        const tesina = materia[0]

        const revisarTesina = () => {
            //Verifico si se desaprobo alguna materia anteriormente aprobada
            const hayMateriasPendientes = materias
                .filter((m) => m.nombre.toLowerCase() != tesina.nombre.toLowerCase())
                .some(m => progreso[m.codigo] !== estadosPosibles[2])

            if (hayMateriasPendientes && progreso[tesina.codigo] != bloquear) {
                //Si hay materias pendientes y la tesina no está bloqueada, la bloqueo y aviso que se debe actualizar el progreso
                nuevoProgreso[tesina.codigo] = bloquear
                huboCambios = true
            }
        }
        revisarTesina()
        if (huboCambios) {
            setProgreso(nuevoProgreso)
        }
    }, [progreso])

    const cambioDeEstado = (codigoMateria) => {

        //Busco el estado actual de la materia, si no existe la inicializo
        const materiaActual = materias.find((materia) => materia.codigo === codigoMateria)
        const estadoInicial = progreso[codigoMateria]

        //Actualizo su estado a el siguiente estado posible
        const estadoNuevo = actualizarEstado(estadoInicial)

        //Creo un progreso con el nuevo cambio
        let nuevoProgreso = { ...progreso, [codigoMateria]: estadoNuevo }
        let materiasModificadas = [materiaActual.codigo]

        //Si es una materia optativa  tendrá un valor en "correlativas" distinto
        //Que se debe manejar como caso aparte
        //el número del cuatrimestre que debe tener regular
        const cuatrimestre = materiaActual.correlativas[0]
        const esCuatrimestre = /^[1-9]$/.test(cuatrimestre)
        //Si es la tesina
        if (materiaActual.correlativas[0] === "Todas") {
            aprobarHastaCuatri(materiaActual.cuatrimestre - 1, nuevoProgreso, materiasModificadas)
        } else if (esCuatrimestre && estadoInicial === bloquear && estadoNuevo === estadosPosibles[1]) {
            //Si es el número de un cuatrimestre entonces tengo que aprobar todas las materias hasta ese cuatrimestre
            aprobarHastaCuatri(cuatrimestre, nuevoProgreso, materiasModificadas)
        } else {
            console.log("llego3");
            //4 casos posibles:
            if ((estadoInicial === bloquear || estadoInicial === estadosPosibles[0]) && estadoNuevo === estadosPosibles[1]) {
                // 1. Bloqueado -> Regular || 2. disponible -> regular
                //Solo si tiene correlativas
                if (materiaActual.correlativas.length > 0) {
                    regularizarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas)
                }
            } else if (estadoInicial === estadosPosibles[1] && estadoNuevo === estadosPosibles[2]) {
                //(caso extra, si se necesita tener todas aprobadas entonces es la tesina)

                //3. regular -> aprobado
                //Solo si tiene correlativas
                if (materiaActual.correlativas.length > 0) {
                    aprobarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas)
                }
            } else if (estadoInicial === estadosPosibles[2] && estadoNuevo === estadosPosibles[0]) {
                //4. aprobado -> disponible
                bloquearDependencias(codigoMateria, nuevoProgreso)
            } else {
                //extra. bloqueado -> disponible
                //No existe, es "actualizarCorrelativas()" que hace esta transición solo a partir de las materias modificadas
            }
        }

        //Desbloqueo dependencias
        if (materiasModificadas.length > 1) {
            materiasModificadas.forEach((codigoMateria) => {
                desbloquearDependencias(codigoMateria, nuevoProgreso)
            })
        }
        setProgreso(nuevoProgreso)


    }

    //Funcion para aprobar todas las materias hasta cierto cuatri, para materias optativas del plan viejo
    const aprobarHastaCuatri = (cuatrimestre, nuevoProgreso, materiasModificadas) => {
        const cuatriLimite = Number(cuatrimestre)
        materias.forEach((m) => {
            const cuatriMateria = Number(m.cuatrimestre)
            if (cuatriMateria <= cuatriLimite) {
                //Si es mejor o igual al cuatrimestre elegido
                console.log(m + " " + m.cuatrimestre);
                //Si el cuatrimeste de la materia es menor o igual al que tenemos, la apruebo
                nuevoProgreso[m.codigo] = estadosPosibles[2]
                //Ya que se modifico, la guardo
                materiasModificadas.push(m.codigo)
            }
        })
    }

    // Funciones recursivas para la actualización de estado de materias 
    const regularizarCorrelativas = (codigosCorrelativas, nuevoProgreso, materiasModificadas) => {
        //Dos casos posibles
        //1. bloqueado -> disponible
        //2. disponible -> regular (Descartado, si anteriormente se puso en estado disponible entonces ya se encargó de regularizar las correlativas)

        codigosCorrelativas.forEach((codigo) => {
            //si la materia no está regularizada o aprobada 
            if (!([estadosPosibles[1], estadosPosibles[2]].includes(nuevoProgreso[codigo]))) {
                nuevoProgreso[codigo] = estadosPosibles[1]
                //Ya que fue modificada, la agrego al array de materias modificadas para luego revisar si tiene que desbloquear dependencias
                materiasModificadas.push(codigo)
                //Reviso también para regularizar sus correlativas si es que tiene
                const materiaActual = materias.find((materia) => materia.codigo === codigo)
                if (materiaActual.correlativas.length > 0) {
                    regularizarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas)
                }
            }
        })

    }
    const bloquearDependencias = (codigoMateria, nuevoProgreso) => {
        //aprobado -> disponibes
        //Debe bloquear a las materias cuyas correlativas incluyen su código
        materias.forEach((m) => {
            if (m.correlativas.includes(codigoMateria) && nuevoProgreso[m.codigo] != bloquear) {
                //Si esta materia tiene como correlativa codigoMateria y no está bloqueada, entonces la bloqueo
                nuevoProgreso[m.codigo] = bloquear
                //Busco a ver si hay otras materias dependientes a esta, que acaba de ser bloqueada, para bloquearlas
                bloquearDependencias(m.codigo, nuevoProgreso)
            }
        })
    }
    const desbloquearDependencias = (codigoMateria, nuevoProgreso) => {
        //bloqueado -> disponibles
        //Debo desbloquear las materias que tengan esta materia como correlativa y el resto de correlativas también estén regular o aprobadas
        materias.forEach((m) => {
            const todasBien = m.correlativas.every(c => ([estadosPosibles[1], estadosPosibles[2]].includes(nuevoProgreso[c])))
            const buenEstado = [estadosPosibles[1], estadosPosibles[2]].includes(nuevoProgreso[m.codigo])
            if (m.correlativas.includes(codigoMateria) && todasBien && !buenEstado) {
                nuevoProgreso[m.codigo] = estadosPosibles[0]
                //Creo que acá no necesito hacer recursividad como en otras funciones, con una pasada es suficiente
            }
        })


    }

    const aprobarCorrelativas = (codigosCorrelativas, nuevoProgreso, materiasModificadas) => {
        // regular -> aprobado
        codigosCorrelativas.forEach((codigo) => {
            // Si su correlativa no está aprobada, la apruebo
            if (nuevoProgreso[codigo] != estadosPosibles[2]) {
                nuevoProgreso[codigo] = estadosPosibles[2]
                // Agrego la materia a materias Modificadas
                materiasModificadas.push(codigo)
                //Reviso también para aprobar sus correlativas si es que tiene
                const materiaActual = materias.find((materia) => materia.codigo === codigo)
                if (materiaActual.correlativas.length > 0) {
                    aprobarCorrelativas(materiaActual.correlativas, nuevoProgreso, materiasModificadas)
                }
            }
        })
    }


    //Función para poder actualizar el estado individual de cada materia
    const actualizarEstado = (estadoMateria) => {
        const posEstado = estadosPosibles.indexOf(estadoMateria)
        console.log(estadoMateria);
        if (posEstado === 0) {
            //Si está disponible -> regular
            return estadosPosibles[posEstado + 1]
        } else if (estadoMateria === bloquear) {
            //Si está bloqueado -> regular
            return estadosPosibles[1]
        } else if (posEstado === (estadosPosibles.length - 1)) {
            //Si está aprobado -> disponible
            return estadosPosibles[0]
        } else {
            //Si está regular -> aprobado
            return estadosPosibles[2]
        }


    }

    const inicializarMateria = (materia) => {
        const estadoNuevo = (materia.correlativas.length > 0 ? 'Bloqueado' : estadosPosibles[0])
        setProgreso((prev) => { return { ...prev, [materia.codigo]: estadoNuevo } })
        progreso[materia.codigo]
        return estadoNuevo
    }
    //Ordeno las materias dentro del array cuatrimestres, para poder mostrarlas en orden y separarlas por cuatrimestre
    const cuatrimestres = [...new Set(materias.map((m) => Number(m.cuatrimestre)))].sort((a, b) => a - b)

    return (
        <div className=''>
            {//Mientras se están cargando las materias
                cargando && !materias
                //Mostrar un cosito de carga de HeroUI
            }
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
                                                estado={
                                                    progreso[materia.codigo] ||
                                                    inicializarMateria(materia)
                                                }
                                                actualizarEstados={cambioDeEstado}
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