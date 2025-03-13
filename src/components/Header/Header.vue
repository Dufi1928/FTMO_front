<script setup>
import './Header.css'
import {onMounted, onUnmounted, ref} from 'vue'

const isScrolled = ref(false)

function handleScroll() {
    isScrolled.value = window.scrollY > 10
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll, {passive: true})
})
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
    <header :class="['header', { scrolled: isScrolled }]">
    <div class="container">
            <div class="logo">
                <a href="#">
                    <img src="../../assets/logo.svg" alt="Logo">
                </a>
            </div>
            <nav class="nav">
                <a href="#"><img src="../../assets/icons/home 1.svg" alt="">Accueil</a>
                <a href="#"><img src="../../assets/icons/calendar-lines 1.svg" alt="">Calendrier</a>
                <a href="#"><img src="../../assets/icons/question-mark-circle 1.svg" alt="">À propos</a>
                <a href="#"><img src="../../assets/icons/chat-lines 1.svg" alt="">Contact</a>
            </nav>
        </div>
    </header>
</template>

