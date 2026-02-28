import { useState } from 'react'
import NavBar from './components/NavBar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import IniciarSesion from './pages/IniciarSesion'
import Registrarse from './pages/Registrarse'
import Tabla from './pages/Tabla'

function App() {
    const [count, setCount] = useState(0)

    return (
        <BrowserRouter>
            <NavBar />
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
