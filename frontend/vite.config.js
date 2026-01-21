import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['anki-apkg-export']
  },
  build: {
    commonjsOptions: {
      include: [/anki-apkg-export/, /node_modules/]
    }
  },
  resolve: {
    alias: {
      'script-loader!sql.js': 'sql.js'
    }
  }
})
