// src/renderer/_default.page.server.js
import { renderToString } from '@vue/server-renderer'
import { createApp } from './app.js'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server'
export { render, passToClient }

const passToClient = ['pageProps', 'urlPathname', 'routeParams']

async function render(pageContext) {
    const { app } = createApp(pageContext)
    const appHtml = await renderToString(app)

    const documentHtml = escapeInject`<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">

    <!-- Favicons -->
    <link rel="icon" href="/favicon.ico" />
    <link rel="icon" href="/favicon.png" type="image/png" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
    <link rel="apple-touch-icon" href="/favicon.png" />

    <title>FTMO</title>
  </head>
  <body style="margin: 0; width: 100vw">
    <div id="app">${dangerouslySkipEscape(appHtml)}</div>
  </body>
</html>`

    return {
        documentHtml,
        pageContext: {
            pageProps: pageContext.pageProps || {},
            routeParams: pageContext.routeParams // ✅ uniquement ce dont tu as besoin
        }
    }
}
