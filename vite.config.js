import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'https://rtiapi.roofze.in'
  const adminProxyTarget = env.VITE_RTI_ADMIN_PROXY_TARGET || apiProxyTarget

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      proxy: {
        '^/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '^/rti-admin': {
          target: adminProxyTarget,
          changeOrigin: true,
          secure: false,
          // 🔥 ये लाइन सबसे ज़रूरी है: यह '/rti-admin' को बदलकर '/api/rti-admin' कर देगी
          rewrite: (path) => path.replace(/^\/rti-admin/, '/api/rti-admin'),
        },
      },
    }
  }
})