import React from 'react'
import { useRoutes } from 'react-router-dom'
import Correlativas from '../pages/Correlativas'
import Equivalencias from '../pages/Equivalencias'
import ChatBot from '../pages/Chatbot'

const Rutas = ({ plan }) => {
    const componentesRutas = useRoutes([
        {
            path: "/correlativas",
            element: <Correlativas plan={plan} />
        },
        {
            path: "/equivalencias",
            element: <Equivalencias plan={plan} />,
        },
        {
            path: "/chatbot",
            element: <ChatBot plan={plan} />
        }
    ])
    return componentesRutas
}

export default Rutas