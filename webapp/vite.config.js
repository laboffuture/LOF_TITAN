import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repo from /LOF_TITAN/, so the production build needs
// that base. Dev does NOT - it is served from the root, and using the subpath
// there only means http://localhost:5173/ shows Vite's "did you mean
// /LOF_TITAN/?" notice instead of the app.
//
// import.meta.env.BASE_URL follows this automatically, so router basename,
// asset() and the firmware fetches stay correct in both modes.
const PROD_BASE = '/LOF_TITAN/'

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
export default defineConfig(({ command }) => ({
  base: command === 'build' ? PROD_BASE : '/',
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    proxy
  },
  // `vite preview` serves the built output, so it uses the production base.
  preview: {
    proxy
  }
}))
