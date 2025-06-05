<script setup>
import { defineProps } from 'vue'
import './SecundaryPageTitle.css'

const props = defineProps({
    title: { type: String, required: true },
})
</script>

<template>
    <div class="sec-page-title-container">
        <h2 class="secondary-page-title">{{ title }}</h2>
    </div>
</template>
