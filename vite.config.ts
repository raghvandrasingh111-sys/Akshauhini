import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api/sarvam': {
          target: env.VITE_SARVAM_PROXY_TARGET || 'https://api.sarvam.ai',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/sarvam/, ''),
        },
      },
    },
  }
})
