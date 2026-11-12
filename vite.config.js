import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/RTI-Admin/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'pdf-vendor';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-bootstrap/') || id.includes('node_modules/@restart/')) {
            return 'bootstrap-vendor';
          }
        },
      },
    },
  },
})
