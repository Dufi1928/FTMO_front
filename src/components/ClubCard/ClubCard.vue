<script setup>
import {defineProps} from 'vue'
import './ClubCard.css'

const props = defineProps({
    slug: {type: Number, required: true},
    title: {type: String, required: true},
    image: {type: String, default: 'src/assets/images/deulemont.jpeg'},
    address: {type: String, required: true},
    operatingHours: {type: String, required: true}

})
</script>

<template>
    <div class="club-card-line-container">
        <div class="club-card-img">
            <img :src="image" :alt="title"/>
        </div>
        <div class="club-card-content">
            <h2 class="club-card-title">{{ title }}</h2>
            <div class="club-card-info">
                <p><img src="../../assets/icons/location_icon.svg" alt="Adresse"/> {{ address }}</p>
                <p><img src="../../assets/icons/clock_icon.svg" alt="Horaires"/> {{ operatingHours }}</p>
            </div>
        </div>
        <div class="club-card-button">
            <a :href="`/clubs/${slug}`">Voir la fiche</a>
        </div>
    </div>
</template>
