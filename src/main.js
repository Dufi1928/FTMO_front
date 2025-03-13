// src/main.js
import { createSSRApp, h } from 'vue'

export function createApp(Page, pageProps) {
    const app = createSSRApp({
        render: () => h(Page, pageProps),
    })

    function App() {
        return h(Page, pageProps || {})
    }

    return createSSRApp(App)
}
