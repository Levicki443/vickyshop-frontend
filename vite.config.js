import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite avec proxy automatique pour le backend Express et découpage des bundles
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('socket.io-client') || id.includes('canvas-confetti')) {
              return 'vendor-utils';
            }
            return 'vendor-libs';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/photo': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/image 1 pulle & chapeau': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/image 2 complet d habit': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
