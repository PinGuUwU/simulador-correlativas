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
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Firebase es enorme y aislado, puede vivir en su propio chunk
            if (id.includes('firebase')) return 'vendor-firebase';
            // Consolidamos todo lo demás en vendor-app para evitar desincronización de hooks
            return 'vendor-app';
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