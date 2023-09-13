import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), glsl(), svgrPlugin(), mkcert()],
  server: {
    proxy: {
      '/assets': {
        target: 'https://192.168.0.153:8080',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
