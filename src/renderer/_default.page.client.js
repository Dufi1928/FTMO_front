// src/renderer/_default.page.client.js
import { useClientRouter } from 'vite-plugin-ssr/client/router'
import { createApp } from './app.js'

useClientRouter({
  async render(pageContext) {
    const { app, router } = createApp()
    await router.push(pageContext.urlPathname)
    await router.isReady()
    app.mount('#app')
  }
})
