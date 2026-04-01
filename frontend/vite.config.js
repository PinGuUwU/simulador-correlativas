import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('@heroui') || id.includes('framer-motion')) return 'vendor-ui';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
            return 'vendor'; // El resto
          }
        }
      }
    }
  },
  server: {
    headers: {
      // Sin este header, el browser bloquea el popup de Google Auth
      // con el error: "Cross-Origin-Opener-Policy would block window.closed"
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})