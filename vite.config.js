import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    // Performance optimizations
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    
    rollupOptions: {
      external: ['@base44/sdk'],
      
      // Code splitting for better performance
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          icons: ['lucide-react'],
          utils: ['clsx']
        }
      }
    },
    
    // Compression and optimization
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  },
  
  resolve: {
    alias: {
      '@base44/sdk': process.env.NODE_ENV === 'production' 
        ? './services/base44ServiceProd.js'
        : '@base44/sdk'
    }
  },
  
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'clsx'],
    exclude: ['@base44/sdk']
  },
  
  // CSS optimization
  css: {
    devSourcemap: false
  },
  
  // Enable experimental features for better performance
  esbuild: {
    jsxInject: `import React from 'react'`,
    target: 'esnext'
  }
})