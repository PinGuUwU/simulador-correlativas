import { useState } from 'react'
import NavBar from './components/NavBar'
import { BrowserRouter } from 'react-router-dom'
import Rutas from './routes/Rutas'
import Footer from './components/Footer'
import ScrollToTop from './components/Shared/ScrollToTop'
import AutoScrollTop from './components/Shared/AutoScrollTop'
import { AuthProvider } from './context/AuthContext'
import { usePageTracking } from './hooks/usePageTracking'
import { initOfflineListener } from './services/syncService'
import SyncModal from './components/SyncModal'
import { useEffect } from 'react'

// Componente interno para poder usar usePageTracking dentro del contexto del router
function AppContent({ plan, setPlan }) {
    usePageTracking();
    
    // Inicializar el listener para sincronización automática cuando vuelve el internet
    useEffect(() => {
        initOfflineListener();
    }, []);
    return (
        <div className='flex'>
            <NavBar setPlan={setPlan} plan={plan} />
            <main className='w-full'>
                <Rutas plan={plan} setPlan={setPlan} />
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
                <SyncModal />
                <AppContent plan={plan} setPlan={setPlan} />
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
