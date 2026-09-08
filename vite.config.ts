import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/cameras': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/roles': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/tasks': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
