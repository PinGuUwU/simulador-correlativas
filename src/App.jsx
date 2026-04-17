import { useState, useEffect, lazy, Suspense } from 'react'
import NavBar from './components/NavBar'
import { BrowserRouter } from 'react-router-dom'
import Rutas from './routes/Rutas'
import ScrollToTop from './components/Shared/ScrollToTop'
import AutoScrollTop from './components/Shared/AutoScrollTop'
import { AuthProvider } from './context/AuthContext'
import { usePageTracking } from './hooks/usePageTracking'

// Componentes secundarios lazy-loaded para reducir FCP
const Footer = lazy(() => import('./components/Footer'))
const SyncModal = lazy(() => import('./components/SyncModal'))

import { useAuth } from './context/AuthContext'
import ServerError from './components/Shared/ServerError'

// Componente interno para poder usar usePageTracking dentro del contexto del router
function AppContent({ plan, setPlan }) {
    const { isCriticalError } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    usePageTracking();

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    if (isCriticalError) {
        return <ServerError />;
    }

    return (
        <div className='flex items-start min-h-screen overflow-x-hidden'>
            <NavBar setPlan={setPlan} plan={plan} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 min-w-0 relative transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
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
