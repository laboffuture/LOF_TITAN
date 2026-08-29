import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The API port. NOT 3000 - Docker Desktop binds that on Windows and answers
// every request with a 404, which is indistinguishable from a broken API.
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:4000'

// Same-origin during development, so the httpOnly session cookie is sent
// without any CORS configuration in the browser.
const proxy = {
  '/api': {
    target: API_TARGET,
    changeOrigin: true
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Absolute base, not './'. With nested routes (/kit/:id) a relative base would
  // resolve asset URLs against the current route instead of the site root, so
  // e.g. ./firmware/bootloader.bin would 404 from /LOF_TITAN/kit/invisible-line.
  // This also makes import.meta.env.BASE_URL a stable '/LOF_TITAN/'.
  base: '/LOF_TITAN/',
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    proxy
  },
  // `vite preview` does NOT inherit server.proxy, so without this the built app
  // has no API at all when previewed locally.
  preview: {
    proxy
  }
})
