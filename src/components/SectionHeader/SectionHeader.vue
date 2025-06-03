<script setup>
import './SectionHeader.css'

/* Déclaration des props */
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    linkText: {
        type: String,
        required: false
    },
    linkUrl: {
        type: String,
        required: false
    },
    background: {
        type: String,
        default: '#ffffff'
    }
})
</script>

<template>
    <!-- On lie correctement le style avec :style -->
    <div class="section-header" :style="{ backgroundColor: props.background }">
        <div class="container">
            <h2 class="section-title">{{ props.title }}</h2>
            <a :href="props.linkUrl" class="section-link">
                {{ props.linkText }}
                <img src="../../assets/icons/arrow-right.svg" alt="→" />
            </a>
        </div>
    </div>
</template>
