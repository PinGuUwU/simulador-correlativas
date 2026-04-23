import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, Tab, Card, CardBody, Button } from '@heroui/react'
import ProgresoHelp from '../components/Tutorial/sections/ProgresoHelp'
import SimuladorHelp from '../components/Tutorial/sections/SimuladorHelp'
import EquivalenciasHelp from '../components/Tutorial/sections/EquivalenciasHelp'

export default function ComoUsar() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-default-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 ring-4 ring-primary/5">
                        <i className="fa-solid fa-book-open-reader text-primary text-4xl"></i>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">
                        Centro de Ayuda
                    </h1>
                    <p className="text-foreground/60 text-lg max-w-2xl">
                        Aprendé a exprimir al máximo todas las herramientas que el simulador tiene para ofrecerte.
                    </p>
                </div>

                {/* Tabs de Navegación */}
                <Tabs
                    fullWidth
                    aria-label="Opciones de ayuda"
                    color="primary"
                    variant="underlined"
                    classNames={{
                        tabList: "w-full relative rounded-none border-b border-divider p-0 gap-0",
                        cursor: "w-full bg-primary",
                        tab: "max-w-full px-1 h-12",
                        tabContent: "group-data-[selected=true]:text-primary font-bold text-[13px] sm:text-base"
                    }}
                >
                    <Tab
                        key="progreso"
                        title={
                            <div className="flex items-center space-x-2">
                                <i className="fa-solid fa-chart-line"></i>
                                <span>Mi Progreso</span>
                            </div>
                        }
                    >
                        <ProgresoHelp />
                    </Tab>
                    <Tab
                        key="simulador"
                        title={
                            <div className="flex items-center space-x-2">
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                <span>Simulador</span>
                            </div>
                        }
                    >
                        <SimuladorHelp />
                    </Tab>
                    <Tab
                        key="equivalencias"
                        title={
                            <div className="flex items-center space-x-2">
                                <i className="fa-solid fa-right-left"></i>
                                <span>Equivalencias</span>
                            </div>
                        }
                    >
                        <EquivalenciasHelp />
                    </Tab>
                </Tabs>

                {/* Footer de la página */}
                <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        variant="flat"
                        color="primary"
                        onPress={() => navigate('/progreso')}
                        startContent={<i className="fa-solid fa-arrow-left"></i>}
                        className="font-bold px-8"
                    >
                        Volver a mi carrera
                    </Button>
                    <Button
                        variant="light"
                        onPress={() => navigate('/')}
                        className="font-medium"
                    >
                        Ir al Inicio
                    </Button>
                </div>
            </div>
        </div>
    )
}
