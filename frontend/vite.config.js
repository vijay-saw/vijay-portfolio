import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow external access
    allowedHosts: [
      "sheldon-unfanned-ashlea.ngrok-free.dev" // allow ngrok domain
    ],
    port: 5173, // or whatever port you use for npm run dev
  },
})

