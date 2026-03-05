import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody, CardFooter, addToast } from "@heroui/react"

function MateriaCard({ materia, estado, actualizarEstados }) {
    //El estado de parámetro lo uso únicamente para inicializar el estadoLocal de cada tarjeta

    const actualizar = () => {
        actualizarEstados(materia.codigo, materia.correlativas)
    }

    return (
        <div className=''>
            <Card className='flex h-35 w-55 hover:cursor-pointer'
                isPressable
                onPress={() => { actualizar() }}
            >
                <CardHeader className='justify-center'>{materia.codigo}</CardHeader>
                <CardBody className='text-center grow overflow-hidden'>{materia.nombre}</CardBody>
                <CardFooter className='justify-center'>{estado}</CardFooter>
            </Card>
        </div>
    )
}


export default MateriaCard