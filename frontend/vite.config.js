import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    sourcemap: true,
  },
  server: {
    headers: {
      // Sin este header, el browser bloquea el popup de Google Auth
      // con el error: "Cross-Origin-Opener-Policy would block window.closed"
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})