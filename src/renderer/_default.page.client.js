// src/renderer/_default.page.client.js
import { createSSRApp, h } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth.js'

export async function render(pageContext) {
    const { Page, pageProps = {} } = pageContext

    const app = createSSRApp({
        render: () => h(Page, pageProps)
    })

    const pinia = createPinia()
    app.use(pinia)

    const auth = useAuthStore()

    if (pageContext.urlPathname.startsWith('/protected') && !auth.isAuthenticated) {
        window.location.href = '/login'
        return
    }

    app.mount('#app')
}
