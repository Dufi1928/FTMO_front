<script setup>
import { onMounted, ref, computed } from 'vue'
import { usePageContext } from '../../renderer/usePageContext.js'
import Header from "../../components/Header/Header.vue"
import Footer from "../../components/Footer/Footer.vue"
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue"
import { useAuthStore } from "../../../stores/auth.js"
import './Club.css'
import '@splidejs/vue-splide/css'
import SecundaryPageTitle from "../../components/SecundaryPageTitle/SecundaryPageTitle.vue"
import GenericRankingTable from "../../components/GenericRankingTable/GenericRankingTable.vue"
import { Splide, SplideSlide } from "@splidejs/vue-splide"
import SectionHeader from "../../components/SectionHeader/SectionHeader.vue"
import MatchCard from "../../components/MatchCard/MatchCard.vue"
import DOMPurify from 'dompurify'

const pageContext = usePageContext()
const clubId = pageContext.routeParams?.id ?? 'inconnu'
const auth = useAuthStore()
const cities = ref([])
const club = ref(null)
const matches = ref([])
const loading = ref(true)
const errorMsg = ref('')

/* --------- Helpers horaires --------- */
function pad2(n) {
    return String(n).padStart(2, '0')
}
function fmtDateHeader(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

const upcomingMatches = computed(() => {
    const now = Date.now()
    return matches.value.filter(
        m => new Date(m.scheduled_datetime).getTime() >= now
    )
})
async function fetchAllMatches() {
    loading.value = true
    errorMsg.value = ''
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
        errorMsg.value = e?.message || 'Erreur inconnue.'
    } finally {
        loading.value = false
    }
}

function fmtTime(isoOrHHMMSS) {
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

function formatHoursWithAudience(schedules = []) {
    if (!Array.isArray(schedules) || schedules.length === 0) return ['Horaires non communiqués']
    return schedules.map(s => {
        const day = weekdayMap[s.weekday] || s.weekday
        const start = fmtTime(s.start_time)
        const end = fmtTime(s.end_time)
        const cats = (s.categories || []).map(c => c.label).join(', ') || 'Tous publics'
        return `${day} ${start}–${end} • ${cats}`
    })
}

onMounted(async () => {
    // Chargement du club courant
    try {
        const response = await fetch(`https://ftmo.bob-digital.com/api/teams/${clubId}`)

        if (!response.ok) throw new Error(`Erreur de chargement du club (status : ${response.status})`)
        club.value = await response.json()
        console.log(club.value)
    } catch (error) {
        console.error('Erreur lors du chargement des données du club :', error)
    }

    // Liste des clubs (pour slider villes/images)
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/')
        if (!res.ok) throw new Error(`Erreur de chargement des clubs (status : ${res.status})`)
        const data = await res.json()
        cities.value = data.map(team => ({
            name: team.club_name,
            image: team.image || '/src/assets/images/deulemont.jpeg'
        }))
    } catch (err) {
        console.error('Erreur de chargement des clubs :', err)
    }
    fetchAllMatches()
})

// Colonnes du tableau joueurs
const playerColumns = [
    {
        field: 'name',
        label: 'Joueur',
        pinned: true,
        sortable: false,
        html: (row) => {
            const imgHtml = row.avatar
                ? `<img src="${row.avatar}" alt="${row.name}" class="player-avatar"/>`
                : (() => {
                    const initials = row.name
                        .split(' ')
                        .map(n => n[0] || '')
                        .join('')
                        .slice(0,2)
                        .toUpperCase()
                    return `<div class="avatar-initials"><span>${initials}</span></div>`
                })()
            return `<div class="cell-with-avatar">${imgHtml}<span>${row.name}</span></div>`
        }
    },
    // { field: 'position', label: 'Classement', pinned: false, sortable: true },
    { field: 'matches', label: 'Matchs joués', pinned: false, sortable: true },
    {
        field: 'stats',
        label: 'Pourcentage de victoires',
        pinned: false,
        sortable: true,
        color: '#2436d4'
    },
    {
        field: 'matches Win',
        label: 'Matchs Gagnés',
        pinned: false,
        sortable: true,
        cellClass: 'won',
        color: '#12b221'
    },
    {
        field: 'matches lost',
        label: 'Matches Perdu',
        pinned: false,
        sortable: true,
        color: '#D11B1B'
    },
]


const playerRows = ref([])

onMounted(async () => {
    // Chargement du club courant
    try {
        const response = await fetch(`https://ftmo.bob-digital.com/api/teams/${clubId}`)
        if (!response.ok) throw new Error(`Erreur de chargement du club (status : ${response.status})`)
        club.value = await response.json()
    } catch (error) {
        console.error('Erreur lors du chargement des données du club :', error)
    }

    // >>> ICI: construire le tableau joueurs depuis l'API
    if (club.value?.players?.length) {
        const rows = club.value.players.map(p => {
            const rate = typeof p.win_rate === 'number' ? p.win_rate : 0
            return {
                name: [p.first_name, p.last_name].filter(Boolean).join(' '),
                avatar: p.profile_image || p.avatar || '',
                'matches Win': p.matches_won ?? 0,
                'matches lost': p.matches_lost ?? 0,
                matches: p.matches_played ?? 0,
                stats: `${rate.toFixed(1)}%`,
            }
        })

        // Tri: gagnés desc, puis % victoire, puis matches joués
        rows.sort((a, b) =>
            (b['matches Win'] - a['matches Win']) ||
            (parseFloat(b.stats) - parseFloat(a.stats)) ||
            (b.matches - a.matches)
        )

        // Rang (position)
        rows.forEach((r, i) => { r.position = i + 1 })

        playerRows.value = rows
    }

    // Liste des clubs (slider)
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/')
        if (!res.ok) throw new Error(`Erreur de chargement des clubs (status : ${res.status})`)
        const data = await res.json()
        cities.value = data.map(team => ({
            name: team.club_name,
            image: team.image || '/src/assets/images/deulemont.jpeg'
        }))
    } catch (err) {
        console.error('Erreur de chargement des clubs :', err)
    }
})

// Sanitisation du HTML TinyMCE
const desc1 = computed(() => DOMPurify.sanitize(club.value?.club_description_paragraph_1 || ''))
const desc2 = computed(() => DOMPurify.sanitize(club.value?.club_description_paragraph_2 || ''))
</script>

<template>
    <Header theme="light" :key="auth.renderKey" :alwaysBlack="true" />

    <main class="club-page-container">
        <MainPageTitle
            v-if="club"
            :title="`Club de ${club.club_name}`"
            :description="club.short_description || 'Club de tennis de table.'"
        />

        <div v-if="club" class="club-detail-container">
            <div class="club-image-wrapper">
                <img :src="club.image" alt="">
            </div>
            <div class="club-detail-info">
                <h2>Notre Club</h2>
                <div v-html="desc1"></div>
                <div v-html="desc2"></div>
                <h3>Horaires d’ouverture</h3>
                <div class="schedule-list">
                    <div
                        v-for="(s, i) in club.schedules"
                        :key="i"
                        class="schedule-item"
                    >
                        <div class="schedule-day">
                            {{ weekdayMap[s.weekday] || s.weekday }}
                        </div>
                        <div class="schedule-time">
                            {{ fmtTime(s.start_time) }} – {{ fmtTime(s.end_time) }}
                        </div>
                        <div class="schedule-audience">
                            {{ (s.categories || []).map(c => c.label).join(', ') || 'Tous publics' }}
                        </div>
                    </div>
                    <div v-if="!club.schedules || club.schedules.length === 0" class="schedule-empty">
                        Horaires non communiqués
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p>Chargement des données du club...</p>
        </div>

        <div class="our-players-section">
            <div class="h2-page-container">
                <SecundaryPageTitle title="Nos Joueurs" />
            </div>
            <GenericRankingTable
                :columns="playerColumns"
                :rows="playerRows"
                title="Top Joueurs de la Saison"
                linkText="Voir tous les joueurs"
                linkUrl="/players"
            />
        </div>

        <SectionHeader
            background=""
            title="Les prochaines rencontres"
            linkText="Toutes les rencontres"
            linkUrl="/schedule"
        />

        <div class="city-slider-container">
            <Splide :options="{ perPage: 3, gap: '1rem', rewind: true }">
                <SplideSlide v-for="match in upcomingMatches" :key="match.id">
                    <MatchCard
                        :home-name="match.home_team_name"
                        :away-name="match.away_team_name"
                        :home-logo="match.home_team_logo ? `https://ftmo.bob-digital.com/media/${match.home_team_logo}` : ''"
                        :away-logo="match.away_team_logo ? `https://ftmo.bob-digital.com/media/${match.away_team_logo}` : ''"
                        :match-date="fmtDateHeader(match.scheduled_datetime)"
                        :match-time="fmtTime(match.scheduled_datetime)"
                        :venue="match.home_team_name"
                        :show-btn="false"
                    />
                </SplideSlide>
            </Splide>
        </div>
    </main>

    <Footer />
</template>
