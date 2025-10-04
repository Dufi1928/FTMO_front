<script setup>
import {ref, computed, onMounted} from 'vue'
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import MatchCard from "../../components/MatchCard/MatchCard.vue";
import {useAuthStore} from '../../../stores/auth.js'
import './MatchResults.css'
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue"

// NOTE: pas d'import 'vue-router' (projet SSR). On utilise une redirection simple côté client.
const goToMatch = (id) => {
  if (typeof window !== 'undefined') window.location.href = `/matches/${id}`
}

const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const matches = ref([])
const selectedDate = ref('') // '' = toutes

async function fetchAllMatches() {
    loading.value = true
    error.value = ''
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        const headers = {
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            'Content-Type': 'application/json',
        }
        let res = await fetch('https://ftmo.bob-digital.com/api/matches', {headers})
        if (!res.ok) res = await fetch('https://ftmo.bob-digital.com/api/matches/', {headers})
        if (!res.ok) throw new Error('Impossible de charger les matchs.')
        const data = await res.json()
        matches.value = Array.isArray(data) ? data : []
    } catch (e) {
        error.value = e?.message || 'Erreur inconnue.'
    } finally {
        loading.value = false
    }
}

function formatDateLabel(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', {year: 'numeric', month: 'long', day: 'numeric'})
}

const groupedMatches = computed(() => {
    const validatedMatches = matches.value.filter(m => !!m.validation_status_home && !!m.validation_status_away)
    const groups = {}
    for (const m of validatedMatches) {
        const d = new Date(m.scheduled_datetime)
        const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
        if (!groups[key]) groups[key] = []
        groups[key].push(m)
    }
    return Object.keys(groups)
        .sort((a, b) => new Date(a) - new Date(b)) // proche -> lointain
        .map(key => ({
            date: key,
            dateLabel: formatDateLabel(groups[key][0]?.scheduled_datetime),
            matches: groups[key].sort((x, y) => new Date(x.scheduled_datetime) - new Date(y.scheduled_datetime))
        }))
})

// Dates disponibles (style Schedule: puces avec bordure)
const availableDates = computed(() => groupedMatches.value.map(g => g.date))

const displayedGroups = computed(() => {
    if (!selectedDate.value) return groupedMatches.value
    return groupedMatches.value.filter(g => g.date === selectedDate.value)
})

function fmtDateHeader(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
    })
}

function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
}

onMounted(async () => {
    await fetchAllMatches()
})
</script>

<template>
    <Header theme="light" :key="auth.renderKey" :alwaysBlack="true"/>
    <main class="matches-page-container">
        <div class="matche-page-title-wrapper">
            <MainPageTitle
                title="Tous les matchs par date"
                description="Retrouvez ici tous les matchs déjà joués, avec leurs résultats et les performances des équipes."
            />
        </div>

        <!-- FILTRE STYLE « Schedule » (entre le titre et la liste) -->
        <div class="matches-filter-bar">
            <div class="matches-filter-inner">
                <button
                    class="matches-chip"
                    :class="{ active: selectedDate === '' }"
                    @click="selectedDate = ''"
                >
                    Toutes
                </button>
                <button
                    v-for="d in availableDates"
                    :key="d"
                    class="matches-chip"
                    :class="{ active: selectedDate === d }"
                    @click="selectedDate = d"
                >
                    {{ new Date(d).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'}) }}
                </button>
            </div>
        </div>

        <div class="matches-by-date-container">
            <div v-if="loading" class="loading">Chargement des matchs...</div>
            <div v-else-if="error" class="error">{{ error }}</div>
            <div v-else class="matches_listing">
                <div v-for="group in displayedGroups" :key="group.date" class="date-group">
                    <div class="date-header">
                        {{ group.dateLabel }}
                    </div>
                    <div class="matches-grid">
                        <MatchCard
                            v-for="m in group.matches"
                            :key="m.id"
                            :home-name="m.home_team_name"
                            :away-name="m.away_team_name"
                            :home-logo="m.home_team_logo ? `https://ftmo.bob-digital.com/media/${m.home_team_logo}` : ''"
                            :away-logo="m.away_team_logo ? `https://ftmo.bob-digital.com/media/${m.away_team_logo}` : ''"
                            :match-date="fmtDateHeader(m.scheduled_datetime)"
                            :match-time="fmtTime(m.scheduled_datetime)"
                            :venue="m.venue_name || m.home_team_name"
                            :show-btn="true"
                            @click="goToMatch(m.id)"
                            @cta-click="goToMatch(m.id)"
                        />
                    </div>
                </div>
                <div v-if="!displayedGroups.length" class="error">Aucun match pour cette date.</div>
            </div>
        </div>
    </main>
    <Footer/>
</template>

