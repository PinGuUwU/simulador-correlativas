import { useState } from 'react'
import NavBar from './components/NavBar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Rutas from './routes/Rutas'

function App() {
    const [plan, setPlan] = useState("17.14")
    //Simulo la carrera, en el futuro debo hacer el fetch de plan en el dashboard y  de ahi pasar todo

    return (
        <BrowserRouter>
            <div className='flex'>
                <NavBar setPlan={setPlan} plan={plan} />
                <main className='w-full'>
                    <Rutas plan={plan} />
                </main>
            </div>
        </BrowserRouter>
    )
}

export default App
