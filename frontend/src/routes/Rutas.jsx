import React from 'react'
import { useRoutes } from 'react-router-dom'
import Correlativas from '../pages/Correlativas'
import Equivalencias from '../components/Equivalencias'
import ChatBot from '../components/ChatBot'

const Rutas = () => {
    const componentesRutas = useRoutes([
        {
            path: "/correlativas",
            element: <Correlativas />
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