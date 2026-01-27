import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Exclude WASM packages from pre-bundling
    exclude: ['@goplasmatic/reframe-wasm'],
  },
})
