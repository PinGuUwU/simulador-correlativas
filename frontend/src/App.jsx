import { useState } from 'react'
import NavBar from './components/NavBar'
import { BrowserRouter } from 'react-router-dom'
import Rutas from './routes/Rutas'
import Footer from './components/Footer'
import ScrollToTop from './components/Shared/ScrollToTop'
import AutoScrollTop from './components/Shared/AutoScrollTop'
import { AuthProvider } from './context/AuthContext'

function App() {
    const [plan, setPlan] = useState("17.14")
    //Simulo la carrera, en el futuro debo hacer el fetch de plan en el dashboard y  de ahi pasar todo

    return (
        <AuthProvider>
            <BrowserRouter>
                <AutoScrollTop />
                <div className='flex'>
                    <NavBar setPlan={setPlan} plan={plan} />
                    <main className='w-full'>
                        <Rutas plan={plan} />
                        <Footer />
                        <ScrollToTop />
                    </main>
                </div>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
