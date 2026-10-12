import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import { spawn, type ChildProcess } from 'child_process'
import net from 'net'

function bexlyBackendPlugin(): Plugin {
  let serverProcess: ChildProcess | null = null

  return {
    name: 'bexly-backend-plugin',
    configureServer(server) {
      // If started via concurrently/standalone, don't auto-spawn
      if (process.env.BEXLY_STANDALONE) return

      // Delay check slightly to give concurrently or pre-existing server time to bind
      setTimeout(() => {
        const checkSocket = net.createConnection({ port: 3001, host: '127.0.0.1' })
        checkSocket.on('connect', () => {
          checkSocket.destroy()
          console.log('\x1b[36m[Bexly]\x1b[0m Servidor backend API ativo na porta 3001.')
        })
        checkSocket.on('error', () => {
          checkSocket.destroy()
          console.log('\x1b[35m[Bexly]\x1b[0m Inicializando servidor backend Express (porta 3001)...')
          try {
            serverProcess = spawn('npx', ['tsx', 'watch', 'server/index.ts'], {
              stdio: 'inherit',
              shell: true,
              env: process.env,
            })
          } catch (e) {
            console.error('[Bexly] Erro ao iniciar processo do backend:', e)
          }
        })
      }, 1000)

      const cleanup = () => {
        if (serverProcess) {
          try {
            serverProcess.kill()
          } catch {}
          serverProcess = null
        }
      }

      server.httpServer?.on('close', cleanup)
      process.on('exit', cleanup)
      process.on('SIGINT', cleanup)
      process.on('SIGTERM', cleanup)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl(), bexlyBackendPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (_err, _req, res) => {
            if ('writeHead' in res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'backend_offline',
                message: 'O servidor backend da Bexly (porta 3001) está inicializando ou indisponível. Aguarde alguns segundos e tente novamente.'
              }));
            }
          });
        },
      },
    },
  },
})
