export { render }
import { createApp } from './app.js'

async function render(pageContext) {
  const { app } = createApp(pageContext)
  app.mount('#app')
}