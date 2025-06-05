import { createSSRApp } from 'vue'
import App from '../App.vue'
import { createPinia } from 'pinia'
import router from '../router/index.js'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  return { app, router }
}
