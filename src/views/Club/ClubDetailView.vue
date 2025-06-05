<script setup>
const props = defineProps()


const clubId = props.routeParams?.id ?? 'inconnu'
console.log('routeParams dans props :', props)
</script>

<template>
    <div>
        <h1>Détail du club ID : {{ clubId }}</h1>
    </div>
</template>
