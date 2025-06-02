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
    }
})
</script>

<template>
    <div class="city-circle">
        <img :src="image" alt="Ville" class="city-image"/>
        <div class="city-info">
            <p class="city-name">{{ name }}</p>
            <img src="../../assets/icons/icon.svg" alt="→">
        </div>
    </div>
</template>