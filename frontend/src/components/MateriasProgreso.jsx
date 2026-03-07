import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Progress } from '@heroui/react'
import React, { useEffect } from 'react'

function MateriasProgreso({ progreso, materias }) {
    //Calculo los datos que voy a mostrar
    useEffect(() => {
        if (progreso.length < 0) return
        let materiasAprobadas = 0
        let materiasDisponibles = 0
        let materiasBloqueadas = 0
        let materiasRegulares = 0
        materias.forEach((m) => {
            switch (progreso[m.codigo]) {
                case "Disponible":
                    materiasDisponibles += 1
                    break;
                case "Regular":
                    materiasRegulares += 1
                    break;
                case "Aprobada":
                    materiasAprobadas += 1
                    break;
                default:
                    materiasBloqueadas += 1
                    break;
            }
        })

    }, [progreso])

    const materiasAprobadas = materias.filter((m) => progreso[m.codigo] === "Aprobado").length
    const materiasDisponibles = materias.filter((m) => progreso[m.codigo] === "Disponible").length
    const materiasRegulares = materias.filter((m) => progreso[m.codigo] === "Regular").length
    const materiasBloqueadas = materias.filter((m) => progreso[m.codigo] === "Bloqueado").length

    const materiasTotales = materias.length

    const calcularProgreso = (cant) => {
        return (cant * 100) / materiasTotales
    }

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='px-4 border-4 border-green-200'>
                <CardHeader>
                    Materias Aprobadas
                </CardHeader>
                <CardBody className='flex flex-row justify-between'>
                    <div>

                        {materiasAprobadas}
                    </div>
                    <div className='bg-green-950 p-3 rounded-4xl border-green-400 border-3 shadow-md shadow-green-200 h-min w-min'>
                        <i className="fa-solid fa-arrow-trend-up text-xl text-green-400 "></i>
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full my-1">
                        <Progress aria-label="progreso aprobadas" color="success" size="sm" value={calcularProgreso(materiasAprobadas)} />
                    </div>
                </CardFooter>
            </Card>
            <Card className='px-4 border-4 border-blue-200'>
                <CardHeader>
                    Materias Disponibles
                    {/* Agregarle que si haces click o con hover sale una ventanita con más info o un simbolo de ? */}
                </CardHeader>
                <CardBody className='flex flex-row justify-between'>
                    <div>
                        {materiasDisponibles}
                    </div>
                    <div className='bg-blue-950 p-3 rounded-4xl border-cyan-400 border-3 shadow-md shadow-cyan-200 h-min w-min'>
                        <i className="fa-solid fa-arrow-trend-up text-xl text-cyan-400 "></i>
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full my-1">
                        <Progress aria-label="progreso disponibles" size="sm" value={calcularProgreso(materiasDisponibles)} />
                    </div>
                </CardFooter>
            </Card>
            <Card className='px-4 border-4 border-amber-200'>
                <CardHeader>
                    Materias Regulares
                </CardHeader>
                <CardBody className='flex flex-row justify-between'>
                    <div>
                        {materiasRegulares}
                    </div>
                    <div className='bg-yellow-950 p-3 rounded-4xl border-amber-300 border-3 shadow-md shadow-amber-200 h-min w-min'>
                        <i className="fa-solid fa-arrow-trend-up text-xl text-amber-400 "></i>
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full my-1">
                        <Progress aria-label="progreso regulares" color="warning" size="sm" value={calcularProgreso(materiasRegulares)} />
                    </div>
                </CardFooter>
            </Card>
            <Card className='px-4 border-4 border-gray-200'>
                <CardHeader>
                    Materias Bloqueadas
                </CardHeader>
                <CardBody className='flex flex-row justify-between'>
                    <div>
                        {materiasBloqueadas}
                    </div>
                    <div className='bg-gray-950 p-3 rounded-4xl border-gray-400 border-3 shadow-md shadow-gray-200 h-min w-min'>
                        <i className="fa-solid fa-arrow-trend-up text-xl text-gray-400"></i>
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full my-1">
                        <Progress aria-label="progreso bloqueadas" color="default" size="sm" value={calcularProgreso(materiasBloqueadas)} />
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default MateriasProgreso