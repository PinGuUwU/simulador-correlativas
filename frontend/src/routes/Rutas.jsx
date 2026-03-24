import React from 'react'
import { useRoutes } from 'react-router-dom'
import Progreso from '../pages/Progreso'
import Equivalencias from '../pages/Equivalencias'
import Inicio from '../pages/Inicio'
import ChatBot from '../pages/Chatbot'
import Simulador from '../pages/Simulador'
import ComoUsar from '../pages/ComoUsar'

const Rutas = ({ plan }) => {
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
        {
            path: "/chatbot",
            element: <ChatBot />
        },
        {
            path: "/como-usar",
            element: <ComoUsar />
        }
    ])
    return componentesRutas
}

export default Rutas