import * as React from 'react'
import { createRoot } from 'react-dom/client'
window.React = React; // Polyfill para librerías que esperan React global en React 19
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App.jsx'
import './main.css'

// Silenciar logs y warnings en producción para una consola limpia y profesional
if (import.meta.env.PROD) {
  console.log = () => { };
  console.warn = () => { };
  // console.info = () => {}; // Descomenta si también quieres quitar los "info"
}

createRoot(document.getElementById('root')).render(
  <HeroUIProvider>
    <ToastProvider placement="bottom-right" maxVisibleToasts={1} />
    <NextThemesProvider attribute="class" defaultTheme='light' themes={['light', 'dark', 'girlie', 'pastel']} enableSystem={false}>
      {/* Esta etiqueta main es la clave para que pinte todo el fondo y cambie el color del texto base */}
      <main className="text-foreground bg-background min-h-screen">
        <App />
      </main>
    </NextThemesProvider>
  </HeroUIProvider>
)
