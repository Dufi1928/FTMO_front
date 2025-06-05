<script setup>
import { usePageContext } from '../../renderer/usePageContext.js'

const pageContext = usePageContext()
const clubId = pageContext.routeParams?.id ?? 'inconnu'
console.log('routeParams dans pageContext :', pageContext)
</script>

<template>
    <div>
        <h1>Détail du club ID : {{ clubId }}</h1>
    </div>
</template>
