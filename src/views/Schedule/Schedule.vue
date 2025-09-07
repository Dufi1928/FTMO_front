<script setup>
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import './Schedule.css'
import {useAuthStore} from '../../../stores/auth.js'
const auth = useAuthStore()
import '@splidejs/vue-splide/css'
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue";

import { ref, computed, onMounted } from 'vue'
import MatchCard from "../../components/MatchCard/MatchCard.vue"
import MapProClubs from "../../components/Map/MapProClubs.vue"

const loading = ref(true)
const errorMsg = ref('')
const matches = ref([])
const activeTab = ref('upcoming') // 'upcoming' | 'all'
const selectedTeam = ref('') // ← filtre équipe (vide = toutes)

/* ------------ Fetch ------------ */
async function fetchAllMatches() {
    loading.value = true
    errorMsg.value = ''
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

        let res = await fetch('https://ftmo.bob-digital.com/api/matches', {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Content-Type': 'application/json',
            },
        })
        if (!res.ok) {
            res = await fetch('https://ftmo.bob-digital.com/api/matches/', {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    'Content-Type': 'application/json',
                },
            })
        }
        if (!res.ok) throw new Error('Impossible de charger les matchs.')

        const data = await res.json()
        matches.value = Array.isArray(data) ? data : []
    } catch (e) {
        errorMsg.value = e?.message || 'Erreur inconnue.'
    } finally {
        loading.value = false
    }
}
onMounted(fetchAllMatches)

/* ------------ Helpers ------------ */
const fmtDateHeader = (iso) =>
    new Date(iso).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

// Tri global (ASC) par date, toujours utilisé avant tout filtrage
const sortedMatches = computed(() =>
    [...matches.value].sort(
        (a, b) => new Date(a.scheduled_datetime) - new Date(b.scheduled_datetime)
    )
)

// Liste des équipes (home + away), triée
const allTeams = computed(() => {
    const set = new Set()
    for (const m of matches.value) {
        if (m?.home_team_name) set.add(m.home_team_name)
        if (m?.away_team_name) set.add(m.away_team_name)
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
})

// Le match correspond-il au filtre d’équipe ?
const matchInSelectedTeam = (m) =>
    !selectedTeam.value
    || m?.home_team_name === selectedTeam.value
    || m?.away_team_name === selectedTeam.value

// Données triées (ASC) puis filtrées par équipe
const allFilteredSorted = computed(() =>
    sortedMatches.value.filter(matchInSelectedTeam)
)

// À venir (>= maintenant), trié puis filtré
const upcomingOnly = computed(() => {
    const now = Date.now()
    return allFilteredSorted.value.filter(
        m => new Date(m.scheduled_datetime).getTime() >= now
    )
})

function groupByDate(list) {
    const map = new Map()
    for (const m of list) {
        const d = new Date(m.scheduled_datetime)
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(m)
    }
    return [...map.entries()]
        .sort(([a],[b]) => new Date(a) - new Date(b))
        .map(([key, arr]) => ({
            key,
            label: fmtDateHeader(arr[0]?.scheduled_datetime ?? key),
            items: arr,
        }))
}

const groupedUpcoming = computed(() => groupByDate(upcomingOnly.value))
const groupedAll = computed(() => groupByDate(allFilteredSorted.value))

// (facultatif, non affiché ici) — utilitaires existants
function statusBadge(status) {
    const s = (status || '').toString().toLowerCase()
    if (['scheduled','programmé','pending'].includes(s)) return { text: 'Programmé', tone: 'badge--info' }
    if (['live','in_progress'].includes(s)) return { text: 'En cours', tone: 'badge--warning' }
    if (['finished','done','completed','terminé'].includes(s)) return { text: 'Terminé', tone: 'badge--success' }
    return { text: status || '—', tone: 'badge--neutral' }
}
function scoreText(m) {
    const h = m?.global_score_home, a = m?.global_score_away
    return (Number.isFinite(h) && Number.isFinite(a)) ? `${h} - ${a}` : null
}
function coerceBool(v) {
    if (typeof v === 'boolean') return v
    if (typeof v === 'string') {
        const s = v.toLowerCase()
        if (s === 'true') return true
        if (s === 'false') return false
    }
    return !!v
}
</script>

<template>
    <Header theme="light" :key="auth.renderKey" :alwaysBlack="true"/>
    <main class="schedule-page-container">
        <div class="schedule-page-title-wrapper">
            <MainPageTitle
                title="Calendrier des matchs"
                description="Consultez d’un coup d’œil les rencontres à venir et passées : horaires, scores et statuts, regroupés par date."
            />
        </div>

        <!-- Barre de filtres -->


        <div class="schedule-wrapper">
            <div class="filters-bar">
                <label for="teamSelect">Équipe</label>
                <select id="teamSelect" v-model="selectedTeam">
                    <option value="">Toutes les équipes</option>
                    <option v-for="t in allTeams" :key="t" :value="t">{{ t }}</option>
                </select>
                <button v-if="selectedTeam" class="btn-reset" @click="selectedTeam = ''">Réinitialiser</button>
            </div>
        </div>

        <div class="schedule-wrapper">
            <div v-if="loading" class="state loading">
                <div class="skeleton-line" />
                <div class="skeleton-line" />
                <div class="skeleton-line" />
            </div>

            <div v-else-if="errorMsg" class="state error">
                {{ errorMsg }}
            </div>

            <div class="cards-grid" v-else>
                <template v-for="group in (activeTab === 'upcoming' ? groupedUpcoming : groupedAll)" :key="group.key">
                    <MatchCard
                        v-for="m in group.items"
                        :key="m.id"
                        :home-name="m.home_team_name"
                        :away-name="m.away_team_name"
                        :home-logo="`https://ftmo.bob-digital.com/media/${m.home_team_logo}`"
                        :away-logo="`https://ftmo.bob-digital.com/media/${m.away_team_logo}`"
                        :match-date="fmtDateHeader(m.scheduled_datetime)"
                        :match-time="fmtTime(m.scheduled_datetime)"
                        :venue="m.home_team_name"
                        :show-btn="false"
                        button-message="Détails du match"
                    />
                </template>

                <div v-if="(activeTab === 'upcoming' ? groupedUpcoming : groupedAll).length === 0" class="state empty">
                    Aucun match à afficher.
                </div>
            </div>
        </div>
    </main>

    <!-- (Ton bloc carte) -->
    <template>
        <div class="map-container-home h-screen">
            <MapProClubs api-key="hwPULScg2AcyGIZf8gl0"/>
        </div>
    </template>

    <Footer/>
</template>
