import React, { useEffect, useState } from 'react'
import HeaderEquivalencias from '../components/Equivalencias/HeaderEquivalencias'
import ListaMaterias from '../components/Equivalencias/ListaMaterias'
import planService from '../services/planService'
import SearchMateria from '../components/Equivalencias/SearchMateria'
import equivalencias from '../data/equivalencias.json'
import materiasUtils from '../utils/Progreso/materiasUtils'

function Equivalencias() {
    // Acá tengo que mostrar qué materia equivale a qué materia entre el plan viejo y el plan nuevo
    //Si una persona quiere ver equivalencias es porque quiere ver qué materias del plan viejo le sirven para el nuevo, así que va a ser pensado exclusivamente así, ya que nadie del plan nuevo puede pasarse al viejo 
    //Entonces tengo que tener las materias del plan viejo y qué hago? Que seleccione

    //Con el componente Searchmateria voy a implementar una barra de búsqueda para que si se quiere saber de materias en específico no tiene que andar buscando en una lista super larga de materias

    //Agregar una sección de botones donde estarán los siguientes:
    //1. botón para "Mostrar materias que me faltan aprobar". Es decir, muestra las materias de plan viejo que NO tiene aprobadas (según el localStorage) y las equivalencias de dichas materias del plan nuevo
    //2. botón para "Mostrar materias aprobadas" Lo mismo que el anterior pero apra aprobadas
    //3. botón para "Mostrar todas" para poder mostrar todas, que sería como retractarse de elegir alguno de los otros dos botones, porque si no para volver a ver todas debería recargar la página

    //En algún lugar quiero que se muestre la comparativa de horas semanales y totales tanto de las materias como de la carrera en sí según plan de estudop
    const planViejo = planService.getPlanByNumber("17.13")
    const planNuevo = planService.getPlanByNumber("17.14")

    const [materiasViejas, setMateriasViejas] = useState(planViejo?.materias || [])
    const [materiasNuevas, setMateriasNuevas] = useState(planNuevo?.materias || [])

    const [equivalenciasAprobadas, setEquivalenciasAprobadas] = useState(0)

    const [progresoViejo, setProgresoViejo] = useState({})
    const [progresoNuevo, setProgresoNuevo] = useState({})

    //Esto es para modificar qué materias muestro con los botones que estarán en otro componente
    const [materiasMostradas, setMateriasMostradas] = useState([])

    //Leo su progreso de entrada para mostrar una barra de progreso generarl, además puedo usar su progrso luego si es que quiere ver en base a su progreso 

    useEffect(() => {
        const storageKey = "progreso+17.13"
        //Agarro del localstorage el progreso hasta ahora
        const progresoStorage = JSON.parse(localStorage.getItem(storageKey))

        //La guardo y no la modifico, ya que acá es para ver pero no para editar.
        if (progresoStorage) {
            //Solamente lo seteo si es que existe, porque si no quedará como undefined
            setProgresoViejo(progresoStorage)
        } else {
            //En caso de que no haya progreso previo entonces tengo que inicializarlo
            let progreso = []
            materiasViejas.forEach(m => {
                if (m.tesis) {
                    progreso[m.codigo] = materiasUtils.bloquear
                } else {
                    progreso[m.codigo] = (m.correlativas.length > 0 ? materiasUtils.bloquear : materiasUtils.estadosPosibles[0])
                }
            })
            setProgresoViejo(progreso)
        }


    }, []) //<-- para que se ejecute una sola vez 

    useEffect(() => {
        //Si se actualiza el progreso viejo, actualizo el nuevo

        let progresoNuevoInicial = {}

        //A partir del progreso viejo que tengo, debo inicializar el progreso en la carrera nueva, para pasarselo al header
        materiasNuevas.forEach(materia => {
            //Me guardo las equivalencias de la materia actual
            const equivalenciasMateria = equivalencias[materia.codigo]
            if (equivalenciasMateria) {
                //Si tiene equivalencias el ej json de equivalencias
                let regulares = 0
                let aprobadas = 0
                let pendientes = 0
                equivalenciasMateria.forEach(codigo => {
                    //Recorro las equivalencias
                    if (progresoViejo[codigo] === "Aprobado") {
                        //Si la equivalencia no está regular o aprobada seteo false
                        aprobadas++
                    } else if (progresoViejo[codigo] === "Regular") {
                        regulares++
                    } else {
                        pendientes++
                    }
                })
                if (aprobadas === equivalenciasMateria.length) {
                    //Si tiene todas las equivalencias aprobadas, entonces la marco como que la tiene aprobada
                    progresoNuevoInicial[materia.codigo] = "Aprobado"
                } else if (regulares === equivalenciasMateria.length) {
                    //Si tiene todas las equivalencias regualres, entonces la marco como que la tiene regular
                    progresoNuevoInicial[materia.codigo] = "Regular"
                } else {
                    //Si no tiene todas regulares o aprobadas, entonces la marco como pendiente
                    progresoNuevoInicial[materia.codigo] = "Pendiente"
                }
            } else {
                //Si no tiene equivalencias qué debería hacer? 
                //Primero veo si es la misma materia con el mismo codigo en ambos planes    
                const existe = progresoViejo[materia.codigo]
                if (!existe) {
                    //Si no la marco como Sin equivalencias, para materias nuevas por ejemplo
                    progresoNuevoInicial[materia.codigo] = "Sin equivalencias"
                } else {
                    progresoNuevoInicial[materia.codigo] = progresoViejo[materia.codigo]
                }
            }
        })
        setProgresoNuevo(progresoNuevoInicial)

    }, [progresoViejo])

    useEffect(() => {
        //Cada vez que cambia el progreso viejo o nuevo, entonces cambia la cantidad de equivalencias completadas
        let equivalenciasAprobadasActuales = 0
        materiasNuevas.forEach(m => {
            if (progresoNuevo[m.codigo] === "Aprobado") {
                equivalenciasAprobadasActuales++
            }
        })
        const porcentajeNuevo = Math.trunc((equivalenciasAprobadasActuales * 100) / materiasNuevas.length)
        setEquivalenciasAprobadas(equivalenciasAprobadasActuales)

        //Ahora actualizo las barras del header
        setProgresoNuevoBar(porcentajeNuevo)
        let materiasViejasAprobadas = 0
        materiasViejas.forEach(m => {
            if (progresoViejo[m.codigo] === "Aprobado") {
                materiasViejasAprobadas++
            }
        })
        const porcentajeViejo = Math.trunc((materiasViejasAprobadas * 100) / materiasViejas.length)
        setProgresoViejoBar(porcentajeViejo)
    }, [progresoNuevo])

    const [progresoViejoBar, setProgresoViejoBar] = useState(0)
    const [progresoNuevoBar, setProgresoNuevoBar] = useState(0)



    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <HeaderEquivalencias
                progresoViejo={progresoViejoBar}
                progresoNuevo={progresoNuevoBar}
                totalMaterias={materiasNuevas.length}
                equivalenciasAprobadas={equivalenciasAprobadas}
            />

            <SearchMateria
                setMateriasMostradas={setMateriasMostradas}
                materias={{ materiasViejas, materiasNuevas }}
            />

            <ListaMaterias
                materiasMostradas={materiasMostradas}
                materiasNuevas={materiasNuevas}
                materiasViejas={materiasViejas}
                progresoNuevo={progresoNuevo}
                progresoViejo={progresoViejo}
                setProgresoNuevo={setProgresoNuevo}
                setProgresoViejo={setProgresoViejo}
            />
        </div>
    )
}

export default Equivalencias