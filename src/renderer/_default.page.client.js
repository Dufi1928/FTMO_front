// src/renderer/_default.page.client.js
import { createSSRApp, h } from 'vue'

export async function render(pageContext) {
    // pageProps est désormais transmis automatiquement
    const { Page, pageProps = {} } = pageContext

    const app = createSSRApp({
        render: () => h(Page, pageProps)
    })

    app.mount('#app')
}
