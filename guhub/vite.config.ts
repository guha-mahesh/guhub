import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow the ngrok tunnel host through; Vite otherwise rejects forwarded Host headers.
    allowedHosts: true, // dev preview over ngrok; accept the forwarded host
  },
})
