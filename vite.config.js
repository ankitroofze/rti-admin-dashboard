import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'https://189.72.144.238'
  const adminProxyTarget = env.VITE_RTI_ADMIN_PROXY_TARGET || apiProxyTarget

  return {
    base: '/RTI-Admin/',
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      proxy: {
        '^/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '^/rti-admin': {
          target: adminProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/rti-admin/, '/api/rti-admin'),
        },
      },
    },
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
  }
})
