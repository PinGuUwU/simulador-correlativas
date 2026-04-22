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
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Firebase es enorme
            if (id.includes('firebase')) return 'vendor-firebase';
            
            // UI Frameworks y Animaciones
            if (id.includes('@heroui') || id.includes('framer-motion') || id.includes('@react-aria')) {
              return 'vendor-ui';
            }
            
            // Librerías de gráficos/flujo
            if (id.includes('@xyflow')) return 'vendor-flow';
            
            // Utilidades pesadas (PDF, imágenes)
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html-to-image')) {
              return 'vendor-utils';
            }
            
            // Iconos
            if (id.includes('lucide') || id.includes('fontawesome')) {
              return 'vendor-icons';
            }

            // El resto de dependencias pequeñas
            return 'vendor-base';
          }
        }
      }
    }
  }
})