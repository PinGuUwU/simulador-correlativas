import { useState } from 'react'
import NavBar from './components/NavBar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Correlativas'
import IniciarSesion from './pages/IniciarSesion'
import Registrarse from './pages/Registrarse'
import Tabla from './pages/Tabla'
import Rutas from './routes/Rutas'

function App() {
    const [count, setCount] = useState(0)
    //Simulo la carrera, en el futuro debo hacer el fetch de plan en el dashboard y  de ahi pasar todo
    const carrera = "Livenciatura en Sistemas de Información"

    return (
        <BrowserRouter>
            <div className='flex'>
                <NavBar />
                <main>
                    <Rutas />
                </main>
            </div>
        </BrowserRouter>
    )
}

export default App
