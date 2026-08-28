import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function syncDistPlugin() {
  return {
    name: 'sync-dist',
    closeBundle() {
      try {
        const src = path.resolve(__dirname, 'dist')
        const dest = path.resolve(__dirname, '../dist')
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true })
        }
      } catch (e) {}
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), syncDistPlugin()],
  server: {
    watch: {
      usePolling: true,
      interval: 100
    }
  }
})
