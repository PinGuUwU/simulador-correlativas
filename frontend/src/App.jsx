import { useState, useEffect, lazy, Suspense } from 'react'
import NavBar from './components/NavBar'
import { BrowserRouter } from 'react-router-dom'
import Rutas from './routes/Rutas'
import ScrollToTop from './components/Shared/ScrollToTop'
import AutoScrollTop from './components/Shared/AutoScrollTop'
import { AuthProvider } from './context/AuthContext'
import { usePageTracking } from './hooks/usePageTracking'
import { initOfflineListener } from './services/syncService'

// Componentes secundarios lazy-loaded para reducir FCP
const Footer = lazy(() => import('./components/Footer'))
const SyncModal = lazy(() => import('./components/SyncModal'))

// Componente interno para poder usar usePageTracking dentro del contexto del router
function AppContent({ plan, setPlan }) {
    usePageTracking();
    
    // Inicializar el listener para sincronización automática cuando vuelve el internet
    useEffect(() => {
        initOfflineListener();
    }, []);
    return (
        <div className='flex min-h-screen overflow-x-hidden'>
            <NavBar setPlan={setPlan} plan={plan} />
            <main className='flex-1 min-w-0 relative'>
                <Rutas plan={plan} setPlan={setPlan} />
                <Suspense fallback={null}>
                    <Footer />
                </Suspense>
                <ScrollToTop />
            </main>
        </div>
    )
}

function App() {
    // Inicializar el plan desde localStorage si existe
    const [plan, setPlan] = useState(() => {
        return localStorage.getItem('plan_activo');
    })

    // Persistir el plan cada vez que cambie
    useEffect(() => {
        if (plan) {
            localStorage.setItem('plan_activo', plan);
        }
    }, [plan]);

    return (
        <AuthProvider>
            <BrowserRouter>
                <AutoScrollTop />
                <Suspense fallback={null}>
                    <SyncModal />
                </Suspense>
                <AppContent plan={plan} setPlan={setPlan} />
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
