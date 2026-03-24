import React, { useEffect, useState } from 'react'
import HeaderEquivalencias from '../components/Equivalencias/HeaderEquivalencias'
import ListaMaterias from '../components/Equivalencias/ListaMaterias'
import plansData from '../data/plansData.json'
import SearchMateria from '../components/Equivalencias/SearchMateria'

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
    const planViejo = plansData.find(p => p.plan_numero === "17.13")
    const planNuevo = plansData.find(p => p.plan_numero === "17.14")

    const [materiasViejas, setMateriasViejas] = useState(planViejo.materias)
    const [materiasNuevas, setMateriasNuevas] = useState(planNuevo.materias)


    const [progresoGuardado, setProgresoGuardado ] = useState([])

    //Esto es para modificar qué materias muestro con los botones que estarán en otro componente
    const [materiasMostradas, setMateriasMostradas] = useState([])

    //Leo su progreso de entrada para mostrar una barra de progreso generarl, además puedo usar su progrso luego si es que quiere ver en base a su progreso 

    useEffect( () => {
        const storageKey = "progreso+17,13"
        //Agarro del localstorage el progreso hasta ahora
        const progresoStorage = localStorage.getItem(storageKey)
        //La guardo y no la modifico, ya que acá es para ver pero no para editar.
        setProgresoGuardado(progresoStorage)
    },[]) //<-- para que se ejecute una sola vez 



    return (
        <div>
        <HeaderEquivalencias/>
        <SearchMateria
            setMateriasMostradas={setMateriasMostradas}
            materias={{materiasViejas, materiasNuevas}}
        /> 
        <div className=
    'grid grid-cols-1'>
            <ListaMaterias
                materiasMostradas={materiasMostradas}
                materiasNuevas={materiasNuevas}
                materiasViejas={materiasViejas}
            />        
        </div>

        </div>
    )
}

export default Equivalencias