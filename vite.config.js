import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/maad-app/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      external: ['@base44/sdk']
    }
  },
  resolve: {
    alias: {
      '@base44/sdk': process.env.NODE_ENV === 'production' 
        ? './services/base44ServiceProd.js'
        : '@base44/sdk'
    }
  }
})