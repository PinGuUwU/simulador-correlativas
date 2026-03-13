import React from 'react'
import { useRoutes } from 'react-router-dom'
import Correlativas from '../pages/Correlativas'
import Equivalencias from '../pages/Equivalencias'
import ChatBot from '../pages/Chatbot'
import Inicio from '../pages/Inicio'

const Rutas = ({ plan }) => {
    const componentesRutas = useRoutes([
        {
            path: "/",
            element: <Inicio />
        },
        {
            path: "/correlativas",
            element: <Correlativas plan={plan} />
        },
        {
            path: "/equivalencias",
            element: <Equivalencias />,
        },
        {
            path: "/chatbot",
            element: <ChatBot />
        }
    ])
    return componentesRutas
}

export default Rutas