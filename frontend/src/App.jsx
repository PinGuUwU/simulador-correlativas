import { useState } from 'react'
import NavBar from './components/NavBar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import IniciarSesion from './pages/IniciarSesion'
import Registrarse from './pages/Registrarse'
import Tabla from './pages/Tabla'

function App() {
    const [count, setCount] = useState(0)
    //Simulo la carrera, en el futuro debo hacer el fetch de plan en el dashboard y  de ahi pasar todo
    const carrera = "Livenciatura en Sistemas de Información"

    return (
        <BrowserRouter>
            <NavBar carrera={carrera} />
            <main>
                <Routes>
                    <Route path='/' element={<Dashboard />} />
                    <Route path='/login' element={<IniciarSesion />} />
                    <Route path='/register' element={<Registrarse />} />
                    <Route path='/simulador' element={<Tabla />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}

export default App
