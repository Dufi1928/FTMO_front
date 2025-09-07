<script setup>
import {defineProps} from 'vue'
import './CityCircle.css'

const props = defineProps({
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    }
})
</script>

<template>
    <div class="city-circle">
        <img :src="image" alt="Ville" class="city-image"/>
        <a :href="`/clubs/${slug}`" class="city-info">
            <p class="city-name">{{ name }}</p>
            <img src="../../assets/icons/icon.svg" alt="→">
        </a>
    </div>
</template>