import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite avec proxy automatique pour le backend Express
export default defineConfig({
  plugins: [react()],
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
