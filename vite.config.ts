import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), glsl(), svgrPlugin()],
  server: {
    https: {
      key: fs.readFileSync('./certs/private_key.pem'),
      cert: fs.readFileSync('./certs/certificate.pem'),
    },
    proxy: {
      '/assets': {
        target: 'https://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      // Forward 8765 websocket
      '/sync': {
        target: 'https://localhost:8765',
        changeOrigin: true,
        secure: false,
        ws: true
      },
    }
  }
})
