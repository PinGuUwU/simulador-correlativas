import React from 'react'
import { Chip } from '@heroui/react'

function HeaderSimulador({ plan }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Simulador de Cursada
                </h1>
                {plan && (
                    <Chip color="primary" variant="flat" size="md" className="font-bold">
                        Plan {plan}
                    </Chip>
                )}
            </div>
            <p className="text-foreground/80 font-medium text-sm md:text-base max-w-lg mt-1">
                Planifica tu cuatrimestre y visualiza tu progreso respetando las correlatividades de tu plan.
            </p>
        </div>
    )
}

export default HeaderSimulador