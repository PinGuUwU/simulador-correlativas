import { useState } from 'react'
import NavBar from './components/NavBar'
import { BrowserRouter } from 'react-router-dom'
import Rutas from './routes/Rutas'
import Footer from './components/Footer'
import ScrollToTop from './components/Shared/ScrollToTop'
import AutoScrollTop from './components/Shared/AutoScrollTop'
import { AuthProvider } from './context/AuthContext'
import { usePageTracking } from './hooks/usePageTracking'

// Componente interno para poder usar usePageTracking dentro del contexto del router
function AppContent({ plan, setPlan }) {
    usePageTracking();
    return (
        <div className='flex'>
            <NavBar setPlan={setPlan} plan={plan} />
            <main className='w-full'>
                <Rutas plan={plan} />
                <Footer />
                <ScrollToTop />
            </main>
        </div>
    )
}

function App() {
    const [plan, setPlan] = useState("17.14")

    return (
        <AuthProvider>
            <BrowserRouter>
                <AutoScrollTop />
                <AppContent plan={plan} setPlan={setPlan} />
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
