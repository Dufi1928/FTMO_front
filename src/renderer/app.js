import { createSSRApp, h } from 'vue'
import { createPinia } from 'pinia'

export function createApp(pageContext) {
  const { Page, pageProps } = pageContext
  const app = createSSRApp({
    render: () => h(Page, pageProps || {})
  })
  const pinia = createPinia()
  app.use(pinia)
  return { app }
}
