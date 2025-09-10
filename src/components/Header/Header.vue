<script setup>
import {ref,watch, onMounted, onUnmounted, computed, defineProps} from 'vue'
import { useAuthStore } from '../../../stores/auth.js'
import './Header.css'

/* ① scroll shadow / fond */
const isScrolled = ref(false)

const props = defineProps({
    alwaysBlack: { type: Boolean, default: false },
    theme: { type: String, default: 'dark' }
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

const auth = useAuthStore()

onMounted(() => {
    const accessToken = localStorage.getItem('accessToken')

    const desktopLink = document.querySelector('.nav a[href="/login"], .nav a[href="/protected/admin/dashboard"]')
    const mobileLink = document.querySelector('.mobile-panel a[href="/login"], .mobile-panel a[href="/protected/admin/dashboard"]')

    if (accessToken && accessToken !== 'null') {
        if (desktopLink) {
            desktopLink.href = '/protected/admin/dashboard'
            desktopLink.textContent = 'Mon compte'
        }
        if (mobileLink) {
            mobileLink.href = '/protected/admin/dashboard'
            mobileLink.textContent = 'Mon compte'
        }
    } else {
        if (desktopLink) {
            desktopLink.href = '/login'
            desktopLink.textContent = 'Connexion'
        }
        if (mobileLink) {
            mobileLink.href = '/login'
            mobileLink.textContent = 'Connexion'
        }
    }
})
const headerClasses = computed(() => {
    return {
        header: true,
        scrolled: isScrolled.value || props.alwaysBlack,
        'header--light': props.theme === 'light'
    }
})


</script>

<template>
    <header :class="headerClasses">
        <div class="container">
            <!-- Logo -->

            <a class="logo" href="/">
                <img  src="../../assets/logo.svg" alt="Logo" :class="{ 'd-none': theme === 'light' }"/>
                <img  src="../../assets/logo_black.svg" alt="Logo" :class="{ 'd-none': theme !== 'light' }"/>
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
                <a href="/">
                    <img src="../../assets/icons/home_icon.svg" :class="{ 'd-none': theme === 'light' }"/>
                    <img src="../../assets/icons/home_icon_black.svg" :class="{ 'd-none': theme !== 'light' }"/>
                    Accueil
                </a>
                <a href="/schedule">
                    <img src="../../assets/icons/calendar-lines.svg" :class="{ 'd-none': theme === 'light' }"/>
                    <img src="../../assets/icons/calendar-lines_black.svg" :class="{ 'd-none': theme !== 'light' }"/>
                    Calendrier
                </a>
                <a href="/about">
                    <img src="../../assets/icons/question-mark-circle.svg" :class="{ 'd-none': theme === 'light' }" />
                    <img src="../../assets/icons/question-mark-circle_black.svg" :class="{ 'd-none': theme !== 'light' }"/>
                    À propos
                </a>

                <a href="/runks">
                    <img src="../../assets/icons/leaderboard.svg" :class="{ 'd-none': theme === 'light' }" />
                    <img src="../../assets/icons/leaderboard_black.svg" :class="{ 'd-none': theme !== 'light' }"/>
                    Le classement
                </a>
                <a v-if="auth.isAuthenticated" href="/protected/admin/dashboard">Mon compte</a>
                <a v-else href="/login">Connexion</a>

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
                    <img  src="../../assets/logo.svg" alt="Logo" :class="{ 'd-none': theme === 'light' }"/>
                    <img  src="../../assets/logo_black.svg" alt="Logo" :class="{ 'd-none': theme !== 'light' }"/>
                    <button
                        class="mobile-close"
                        aria-label="Fermer le menu"
                        @click="closeMobile"
                    >&times;</button>
                </header>

                <!-- liens du menu -->
                <a @click="closeMobile" href="/">
                    <img src="../../assets/icons/home_icon.svg" :class="{ 'd-none': theme === 'light' }"/>
                    <img src="../../assets/icons/home_icon_black.svg" :class="{ 'd-none': theme !== 'light' }"/>
                    Accueil</a>
                <a @click="closeMobile" href="#">
                    <img src="../../assets/icons/calendar-lines.svg" :class="{ 'd-none': theme === 'light' }"/>
                    <img src="../../assets/icons/calendar-lines_black.svg" :class="{ 'd-none': theme !== 'light' }"/>
                    Calendrier
                </a>
                <a @click="closeMobile" href="#">
                    <img src="../../assets/icons/question-mark-circle.svg" :class="{ 'd-none': theme === 'light' }" />
                    <img src="../../assets/icons/question-mark-circle_black.svg" :class="{ 'd-none': theme !== 'light' }"/>
                    À propos
                </a>
                <a @click="closeMobile" href="#">
                    <img src="../../assets/icons/leaderboard.svg" :class="{ 'd-none': theme === 'light' }" />
                    <img src="../../assets/icons/leaderboard_black.svg" :class="{ 'd-none': theme !== 'light' }"/>
                    Le classement
                </a>
                <a
                    v-if="auth.isAuthenticated"
                    href="/protected/admin/dashboard"
                    @click="closeMobile"
                >
                    Mon compte
                </a>
                <a
                    v-else
                    href="/login"
                    @click="closeMobile"
                >
                    Connexion
                </a>
            </nav>
        </div>
    </header>

</template>
