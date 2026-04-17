import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'

export default function ComoUsar() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 text-center bg-default-100">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <i className="fa-solid fa-circle-question text-white text-3xl"></i>
            </div>

            <div className="flex flex-col gap-3 max-w-md">
                <h1 className="text-3xl font-black text-foreground tracking-tight">¿Cómo usar la app?</h1>
                <p className="text-foreground/60 text-base leading-relaxed">
                    Esta sección de ayuda está en construcción. Pronto vas a encontrar guías detalladas sobre cómo usar cada función de la aplicación.
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button
                    color="primary"
                    variant="shadow"
                    className="font-bold"
                    onPress={() => navigate('/progreso')}
                    startContent={<i className="fa-solid fa-arrow-left"></i>}
                >
                    Volver a Progreso
                </Button>
                <Button
                    variant="flat"
                    className="font-medium"
                    onPress={() => navigate('/')}
                >
                    Ir al inicio
                </Button>
            </div>
        </div>
    )
}
