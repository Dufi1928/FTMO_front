// src/renderer/_default.page.server.js
import { renderToString } from '@vue/server-renderer'
import { createApp } from './app.js'

export { passToClient }
const passToClient = ['pageProps', 'urlPathname']

export async function render(pageContext) {
  const { app } = createApp(pageContext)

  const appHtml = await renderToString(app)

  const documentHtml = `
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>FTMO</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
    </head>
    <body>
      <div id="app">${appHtml}</div>
    </body>
  </html>`

  return {
    documentHtml,
    pageContext: {
      pageProps: pageContext.pageProps || {},
      urlPathname: pageContext.urlPathname,
    }
  }
}
