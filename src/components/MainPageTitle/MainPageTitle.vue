<script setup>
import { defineProps } from 'vue'
import './MainPageTitle.css'

const props = defineProps({
    title: { type: String, required: true },
    description: { type: String, default: '' }
})
</script>

<template>
    <div class="club-title-container">
        <h1 class="club-title">{{ title }}</h1>
        <p v-if="description" class="club-description">{{ description }}</p>
    </div>
</template>
