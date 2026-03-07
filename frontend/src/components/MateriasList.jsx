import React, { useEffect, useState } from 'react'
import MateriaCard from './MateriaCard'
import { ButtonGroup, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Switch, useDisclosure } from '@heroui/react'

function MateriasList() {
    //Estados para guardar las materias y para mostrar una imagen de cargando
    const [materias, setMaterias] = useState([])
    const [modo, setModo] = useState(false) //Para saber si se está editando el estado o no
    const [infoMateria, setInfoMateria] = useState()
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

                //Inicializo acá mismo el progreso
                const progresoInicial = {}
                data.forEach(m => {
                    progresoInicial[m.codigo] = (m.correlativas.length > 0 ? 'Bloqueado' : estadosPosibles[0])
                })
                setProgreso(progresoInicial)


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
            //Si todavía no se cargaron las materias de la base de datos
            if (optativas.length === 0) return
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
        //Si todavía no se cargaron las materias de la base de datos
        if (!tesina) return

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
            aprobarHastaCuatri(materiaActual.cuatrimestre, nuevoProgreso, materiasModificadas)
        } else if (esCuatrimestre) {
            //Si es el número de un cuatrimestre entonces tengo que aprobar todas las materias hasta ese cuatrimestre
            aprobarHastaCuatri(cuatrimestre, nuevoProgreso, materiasModificadas)
        } else {
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
            if (!m.nombre.toLowerCase().includes("tesina de grado")) {
                const cuatriMateria = Number(m.cuatrimestre)
                if (cuatriMateria <= cuatriLimite) {
                    //Si es mejor o igual al cuatrimestre elegido
                    //Si el cuatrimeste de la materia es menor o igual al que tenemos, la apruebo
                    nuevoProgreso[m.codigo] = estadosPosibles[2]
                    //Ya que se modifico, la guardo
                    materiasModificadas.push(m.codigo)
                }
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

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
    //Abrir la info de una materia con Drawer de HeroUI
    const abrirInfo = (materia) => {
        setInfoMateria(materia)
        onOpen()
    }


    //Ordeno las materias dentro del array cuatrimestres, para poder mostrarlas en orden y separarlas por cuatrimestre
    const anios = [...new Set(materias.map((m) => Number(m.anio)))].sort((a, b) => a - b)
    return (
        <div>
            <div className='text-center'>
                <Switch
                    color="success"
                    onChange={() => setModo(!modo)}
                    endContent={<div>off</div>}
                    startContent={<div>on</div>}
                >Edit mode</Switch>
            </div>
            {anios.map((anio) => {
                //Me quedo con las materias de este año
                const materiasAnio = materias.filter((m) => Number(m.anio) === anio)
                //Hago el bloque visual del año
                return (
                    <div key={anio}>
                        <div>{anio}° Año</div>
                        <div>
                            {[1, 2].map((cuatri) => {
                                //Me quedo con las materias que pertenecen a este cuatrimestre (primer o segundo cuatri)
                                const materiasCuatri = materiasAnio.filter((m) => (((Number(m.cuatrimestre) % 2 === 0) ? 2 : 1)) === cuatri)
                                return (
                                    <div key={cuatri}>
                                        <div>{cuatri}° Cuatrimestre</div>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                                            {
                                                materiasCuatri.map((materia, index) => (
                                                    <MateriaCard
                                                        key={materia.codigo != "N/A" ? materia.codigo : (materia.codigo + `${index}`)}
                                                        materia={materia}
                                                        estado={progreso[materia.codigo]}
                                                        actualizarEstados={cambioDeEstado}
                                                        modo={modo}
                                                        abrirInfo={() => abrirInfo(materia)}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                )

                            })}
                        </div>
                    </div>
                )
            })
            }

            {/* Drawer de info de las materiasd */}
            <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            {infoMateria ? (
                                <>
                                    <DrawerHeader>
                                        <div>Detalle de Materia</div>
                                        {/* poner un divider */}
                                        {infoMateria.codigo}<br></br>
                                        {infoMateria.nombre} <br></br>
                                        {infoMateria.estado} | {infoMateria.anio}° Año | Cuatrimestre {infoMateria.cuatrimestre}
                                        Descripción: Agregarle descripción a las materias
                                    </DrawerHeader>
                                    <DrawerBody>
                                        <div>
                                            Correlativas para cursar
                                            Mapear correlativas con estado disponible
                                        </div>
                                        <div>
                                            Correlativas para rendir examen final
                                            mapear correlativas con estado regular
                                        </div>
                                        A cada una que mapee tengo que ponerle el estado, ya sea con simbolo o palabra de estado

                                    </DrawerBody>
                                    <DrawerFooter>

                                        {/* Acá agregar el consejo */}
                                    </DrawerFooter>

                                </>
                            ) : <DrawerBody>Cargando contenido...</DrawerBody>}

                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    )
}

export default MateriasList