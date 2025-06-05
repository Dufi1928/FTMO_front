export { usePageContext }

import { inject } from 'vue'

function usePageContext() {
    const pageContext = inject('pageContext')
    if (!pageContext) throw new Error('usePageContext() must be used within a page component.')
    return pageContext
}
