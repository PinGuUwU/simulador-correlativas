import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App.jsx'
import './main.css'

createRoot(document.getElementById('root')).render(
  <HeroUIProvider>
    <NextThemesProvider attribute="class" defaultTheme='light' themes={['light', 'dark', 'girlie', 'pastel']} enableSystem={false}>
      {/* Esta etiqueta main es la clave para que pinte todo el fondo y cambie el color del texto base */}
      <main className="text-foreground bg-background min-h-screen">
        <App />
      </main>
    </NextThemesProvider>
  </HeroUIProvider>
)
