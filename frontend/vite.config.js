import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React and routing
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI framework
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
  server: {
    proxy: {
      '/databases': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/logs': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/docs': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
