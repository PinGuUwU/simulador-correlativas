import React, { Suspense, lazy } from 'react'
import { useRoutes } from 'react-router-dom'
import { Spinner } from '@heroui/react'

import Progreso from '../pages/Progreso'
import Inicio from '../pages/Inicio'
import Simulador from '../pages/Simulador'
import RedDeMaterias from '../pages/RedDeMaterias'

const Equivalencias = lazy(() => import('../pages/Equivalencias'))
const ChatBot = lazy(() => import('../pages/ChatBot'))
const ComoUsar = lazy(() => import('../pages/ComoUsar'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))
const Contacto = lazy(() => import('../pages/Contacto'))

const LoadingFallback = () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner size="lg" color="primary" label="Cargando..." />
    </div>
)

const Rutas = ({ plan, setPlan }) => {
    const componentesRutas = useRoutes([
        {
            path: "/",
            element: <Inicio />
        },
        {
            path: "/progreso",
            element: <Progreso plan={plan} setPlan={setPlan} />
        },
        {
            path: "/red",
            element: <RedDeMaterias plan={plan} setPlan={setPlan} />
        },
        {
            path: "/simulador",
            element: <Simulador plan={plan} setPlan={setPlan} />
        },
        {
            path: "/equivalencias",
            element: <Equivalencias />,
        },
        // {
        //     path: "/chatbot",
        //     element: <ChatBot />
        // },
        {
            path: "/como-usar",
            element: <ComoUsar />
        },
        {
            path: "/config",
            element: <SettingsPage plan={plan} setPlan={setPlan} />
        },
        {
            path: "/contacto",
            element: <Contacto />
        }
    ])
    return (
        <Suspense fallback={<LoadingFallback />}>
            {componentesRutas}
        </Suspense>
    )
}

export default Rutas