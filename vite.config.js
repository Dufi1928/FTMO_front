import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ssr from 'vite-plugin-ssr/plugin'
import path from 'path' // ✅ Ajout nécessaire pour path.resolve

export default defineConfig({
  plugins: [
    vue(),
    ssr(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '#root': path.resolve(__dirname, './src'), // ✅ alias vers src
    },
  },
})
