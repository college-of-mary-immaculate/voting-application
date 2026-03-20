import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'    // ← Tailwind v4 uses this

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),                              // ← add this
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: 80,
      protocol: 'ws',
    },
    watch: {
      usePolling: true,
    }
  },
  optimizeDeps: {
    force: true
  }
})