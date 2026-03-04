import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react"

function MateriaCard({ materia }) {
    const [estado, setEstado] = useState()

    useEffect(() => {
        if (materia.cuatrimestre === "0" || materia.cuatrimestre === "1") {
            setEstado("Disponible")
        }
    }, [materia])

    return (
        <div className=''>
            <Card className='flex h-35 w-55'>
                <CardHeader className='justify-center'>{materia.codigo}</CardHeader>
                <CardBody className='text-center grow overflow-hidden'>{materia.nombre}</CardBody>
                <CardFooter className='justify-center'>{estado}</CardFooter>
            </Card>
        </div>
    )
}

export default MateriaCard