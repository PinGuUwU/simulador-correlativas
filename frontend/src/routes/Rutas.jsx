import React, { Suspense, lazy } from 'react'
import { useRoutes } from 'react-router-dom'
import { Spinner } from '@heroui/react'

const Progreso = lazy(() => import('../pages/Progreso'))
const Equivalencias = lazy(() => import('../pages/Equivalencias'))
const Inicio = lazy(() => import('../pages/Inicio'))
const ChatBot = lazy(() => import('../pages/Chatbot'))
const Simulador = lazy(() => import('../pages/Simulador'))
const ComoUsar = lazy(() => import('../pages/ComoUsar'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))

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
            element: <Progreso plan={plan} />
        },
        {
            path: "/simulador",
            element: <Simulador plan={plan} />
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
        }
    ])
    return (
        <Suspense fallback={<LoadingFallback />}>
            {componentesRutas}
        </Suspense>
    )
}

export default Rutas