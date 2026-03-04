import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite' // 1. Importamos el plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Lo agregamos a la lista
  ],
})