import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2017',
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/index.js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
