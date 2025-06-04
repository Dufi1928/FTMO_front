<script setup>
import {ref,watch, onMounted, onUnmounted, computed, defineProps} from 'vue'
import './Header.css'

/* ① scroll shadow / fond */
const isScrolled = ref(false)

const props = defineProps({
    alwaysBlack: { type: Boolean, default: false }
})

function handleScroll() {
    isScrolled.value = window.scrollY > 10
}

onMounted(() => window.addEventListener('scroll', handleScroll, {passive: true}))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

/* ② burger mobile */
const mobileOpen = ref(false)

const toggleMobile = () => {
    mobileOpen.value = !mobileOpen.value
}
const closeMobile = () => {
    mobileOpen.value = false
}   // clic backdrop
watch(mobileOpen, open => {
    document.documentElement.classList.toggle('no-scroll', open)   // html ➡️ bloque aussi iOS
    document.body.classList.toggle('no-scroll', open)       // body  ➡️ bloque desktop
})


const headerIsBlack = computed(() => isScrolled.value || props.alwaysBlack)

</script>

<template>
    <header :class="['header', { scrolled: headerIsBlack }]">
        <div class="container">
            <!-- Logo -->
            <a class="logo" href="/">
                <img src="../../assets/logo.svg" alt="Logo"/>
            </a>

            <!-- Bouton burger (mobile only) -->
            <button
                class="burger"
                :class="{ open: mobileOpen }"
                @click="toggleMobile"
                aria-label="Ouvrir / fermer le menu"
            >
                <span></span><span></span><span></span>
            </button>

            <!-- Nav desktop -->
            <nav class="nav">
                <a href="/"><img src="../../assets/icons/home 1.svg"/>Accueil</a>
                <a href="#"><img src="../../assets/icons/calendar-lines 1.svg"/>Calendrier</a>
                <a href="#"><img src="../../assets/icons/question-mark-circle 1.svg"/>À propos</a>
                <a href="#"><img src="../../assets/icons/chat-lines 1.svg"/>Contact</a>
                <a href="/login">Connexion</a>
            </nav>
        </div>

        <!-- Panneau mobile + backdrop-->
        <div
            class="mobile-backdrop"
            :class="{ show: mobileOpen }"
            @click.self="closeMobile"
        >
            <nav class="mobile-panel" :class="{ show: mobileOpen }">

                <!-- ─── Barre supérieure : logo + bouton “X” ─── -->
                <header class="mobile-panel-header">
                    <img class="mobile-logo" src="../../assets/logo.svg" alt="Logo" />
                    <button
                        class="mobile-close"
                        aria-label="Fermer le menu"
                        @click="closeMobile"
                    >&times;</button>
                </header>

                <!-- liens du menu -->
                <a @click="closeMobile" href="#"><img src="../../assets/icons/home 1.svg" />Accueil</a>
                <a @click="closeMobile" href="#"><img src="../../assets/icons/calendar-lines 1.svg" />Calendrier</a>
                <a @click="closeMobile" href="#"><img src="../../assets/icons/question-mark-circle 1.svg" />À propos</a>
                <a @click="closeMobile" href="#"><img src="../../assets/icons/chat-lines 1.svg" />Contact</a>
                <a @click="closeMobile" href="/login">Connexion</a>
            </nav>
        </div>
    </header>
</template>
