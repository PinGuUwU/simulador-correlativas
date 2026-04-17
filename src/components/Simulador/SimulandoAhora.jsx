import React from 'react'
import { Card, CardBody } from '@heroui/react'

/**
 * Card que muestra el cuatrimestre y año que se está simulando actualmente.
 */
function SimulandoAhora({ cuatri, anioActual }) {
    return (
        <Card className="mb-6 bg-primary text-primary-foreground shadow-lg border-none rounded-3xl overflow-hidden relative">
            {/* Decoraciones abstractas */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

            <CardBody className="p-5 md:p-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm hidden md:block">
                        <i className="fa-regular fa-calendar-days text-3xl" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xs text-primary-foreground/80 font-semibold tracking-wider uppercase mb-1">
                            Simulando Ahora
                        </div>
                        <div className="text-xl md:text-3xl font-bold">
                            {cuatri}º Cuatrimestre - Año {anioActual}
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

export default SimulandoAhora
