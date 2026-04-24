import React, { Suspense, lazy } from 'react'
import { useRoutes } from 'react-router-dom'
import { Spinner } from '@heroui/react'

const Inicio = lazy(() => import('../pages/Inicio'))
const Progreso = lazy(() => import('../pages/Progreso'))
const Simulador = lazy(() => import('../pages/Simulador'))
const Equivalencias = lazy(() => import('../pages/Equivalencias'))
const ChatBot = lazy(() => import('../pages/ChatBot'))
const ComoUsar = lazy(() => import('../pages/ComoUsar'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))
const Contacto = lazy(() => import('../pages/Contacto'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const AdminRoute = lazy(() => import('../components/Auth/AdminRoute'))

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
        },
        {
            path: "/admin",
            element: (
                <AdminRoute>
                    <AdminDashboard />
                </AdminRoute>
            )
        }
    ])
    return (
        <Suspense fallback={<LoadingFallback />}>
            {componentesRutas}
        </Suspense>
    )
}

export default Rutas
