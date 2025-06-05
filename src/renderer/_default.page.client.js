// src/renderer/_default.page.client.js
import { useClientRouter } from 'vite-plugin-ssr/client/router'
import { createApp } from './app.js'

useClientRouter({
  render(pageContext) {
    const { app } = createApp(pageContext)
    app.mount('#app')
  }
})
