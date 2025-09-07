<script setup>
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import './Clubs.css'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../../stores/auth.js'
const auth = useAuthStore()

import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue";
import MapClubsByPosition from "../../components/MapClubsByPosition/MapClubsByPosition.vue";
import SecundaryPageTitle from "../../components/SecundaryPageTitle/SecundaryPageTitle.vue";
import ClubCard from "../../components/ClubCard/ClubCard.vue";

// ---- State
const clubs = ref([])
const loading = ref(true)
const errorMsg = ref('')

// ---- Helpers
function getImage(team) {
    // Fallback si image vide
    if (team?.image && typeof team.image === 'string' && team.image.trim() !== '') {
        return team.image
    }
    return 'src/assets/images/deulemont.jpeg'
}

function pad2(n) {
    return String(n).padStart(2, '0')
}

function fmtTime(isoOrHHMMSS) {
    // Supporte "18:30:00" ou ISO "2025-09-01T18:52:17.649Z"
    if (!isoOrHHMMSS) return ''
    const onlyTime = /^\d{2}:\d{2}(:\d{2})?$/.test(isoOrHHMMSS)
    if (onlyTime) {
        const [h, m] = isoOrHHMMSS.split(':')
        return `${pad2(h)}:${pad2(m)}`
    }
    const d = new Date(isoOrHHMMSS)
    if (isNaN(d.getTime())) return ''
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const weekdayMap = {
    mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Ven', sat: 'Sam', sun: 'Dim'
}

function formatHours(schedules = []) {
    if (!Array.isArray(schedules) || schedules.length === 0) return 'Horaires non communiqués'
    // Exemple: "Lun 18:00–20:00 • Mer 19:00–21:00"
    const parts = schedules.slice(0, 3).map(s => {
        const day = weekdayMap[s.weekday] || s.weekday
        const start = fmtTime(s.start_time)
        const end = fmtTime(s.end_time)
        return `${day} ${start}–${end}`
    })
    // Si beaucoup d’entrées, affiche les 3 premières
    return parts.join(' • ')
}

// ---- Fetch
onMounted(async () => {
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        clubs.value = Array.isArray(data) ? data : []
    } catch (e) {
        console.error(e)
        errorMsg.value = "Impossible de charger les clubs pour le moment."
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <Header theme="light" :key="auth.renderKey" :alwaysBlack="true" />
    <main class="clubs-page-container">
        <MainPageTitle
            title="Les club près de chez vous"
            description="Retrouvez l’ensemble des clubs affiliés à la FTMO dans la métropole lilloise"
        />

        <div class="clubs-page-map-container">
            <MapClubsByPosition :show-filters="true" />
        </div>

        <div class="h2-page-container">
            <SecundaryPageTitle title="Les clubs" />
        </div>

        <!-- Etat de chargement / erreur -->
        <div v-if="loading" class="clubs-loading">Chargement des clubs…</div>
        <div v-else-if="errorMsg" class="clubs-error">{{ errorMsg }}</div>

        <!-- Listing depuis l’API -->
        <div v-else class="club-listing-container">
            <ClubCard
                v-for="team in clubs"
                :key="team.id"
                :slug="String(team.id)"
                :title="team.club_name"
                :image="getImage(team)"
                :address="team.adress || 'Adresse non communiquée'"
                :schedules="team.schedules || []"
            />
            <!-- Si aucun club -->
            <div v-if="clubs.length === 0" class="clubs-empty">Aucun club à afficher.</div>
        </div>
    </main>
    <Footer />
</template>
