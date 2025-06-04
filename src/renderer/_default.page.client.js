// src/renderer/_default.page.client.js
import { createSSRApp, h } from 'vue'
import { createPinia } from 'pinia'

export async function render(pageContext) {
    // pageProps est désormais transmis automatiquement
    const { Page, pageProps = {} } = pageContext

    const app = createSSRApp({
        render: () => h(Page, pageProps)
    })

    app.use(createPinia())

    app.mount('#app')
}
