import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import { handleSyncApi } from './server/handler.ts'

function graphiteApiDevPlugin(): Plugin {
  return {
    name: 'graphite-api-dev',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (value !== undefined && process.env[key] === undefined) process.env[key] = value
      }
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/sync') return next()
        void handleSyncApi(req as IncomingMessage, res as ServerResponse)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), graphiteApiDevPlugin()],
  server: {
    port: 43123,
    host: true,
  },
})
