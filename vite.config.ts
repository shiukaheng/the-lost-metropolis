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
        target: 'https://127.0.0.1:8081',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      // Forward 8765 websocket
      '/sync': {
        target: 'https://127.0.0.1:8765',
        changeOrigin: true,
        secure: false,
        ws: true
      },
    }
  }
})
