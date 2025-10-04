<!-- AdminHome.vue -->
<script setup>
import './AdminHome.css'
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { onMounted, ref } from 'vue'
import GenericRankingTable from '../../../../components/GenericRankingTable/GenericRankingTable.vue'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

// --- états global
const ranking = ref(null)      // position actuelle de l'équipe
const winRate = ref(null)      // % victoires (équipe)
const loading = ref(true)
const errorMsg = ref('')

// --- données équipe + joueurs réels
const teamId = ref(null)
const teamName = ref('')
const playerColumns = [
    { field: 'name',        label: 'Joueur',            pinned: true,  sortable: true },
    { field: 'points_won',  label: 'Points gagnés',     pinned: false, sortable: true },
    { field: 'points_lost', label: 'Points perdus',     pinned: false, sortable: true },
    { field: 'diff',        label: 'Différence',        pinned: false, sortable: true },
    { field: 'win_pct',     label: '% estimé',          pinned: false, sortable: true,  },
]
const playerRows = ref([])

// --- graphique (classement hebdomadaire)
const chartData = ref({
    labels: [],
    datasets: [{
        label: 'Position hebdomadaire',
        data: [],
        borderColor: '#4b50ff',
        backgroundColor: 'rgba(75,80,255,0.1)',
        tension: 0.35,
        pointRadius: 3,
    }],
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: { color: '#555' },
            grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
            reverse: true, // 1 = meilleure position, en haut
            ticks: { color: '#555', stepSize: 1, precision: 0 },
            grid: { color: 'rgba(0,0,0,0.05)' },
            suggestedMin: 1,
            suggestedMax: 6,
        },
    },
    plugins: { legend: { display: false } },
}

// --- helpers dates (ISO semaines)
function getISOWeekStartUTC(year, week) {
    // ISO: semaine 1 = celle qui contient le 4 janv.
    const jan4 = new Date(Date.UTC(year, 0, 4))
    const day = jan4.getUTCDay() || 7 // dimanche=0 -> 7
    const mondayOfWeek1 = new Date(jan4)
    mondayOfWeek1.setUTCDate(jan4.getUTCDate() - day + 1)
    const start = new Date(mondayOfWeek1)
    start.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7)
    return start // lundi 00:00:00Z
}

function parseISOWeekKey(key) {
    // "YYYY-Www"
    const m = /^(\d{4})-W(\d{2})$/.exec(key)
    if (!m) return null
    return { year: Number(m[1]), week: Number(m[2]) }
}

function currentISOWeekStartUTC() {
    const now = new Date()
    // trouver le jeudi de la semaine courante (truc ISO)
    const tmp = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const day = tmp.getUTCDay() || 7
    tmp.setUTCDate(tmp.getUTCDate() + (4 - day))
    // semaine 1: lundi de la semaine contenant le 4 janv.
    const jan4 = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4))
    const dayJan4 = jan4.getUTCDay() || 7
    const mondayOfWeek1 = new Date(jan4)
    mondayOfWeek1.setUTCDate(jan4.getUTCDate() - dayJan4 + 1)
    const diffDays = Math.floor((tmp - mondayOfWeek1) / 86400000)
    const week = Math.floor(diffDays / 7) + 1
    return getISOWeekStartUTC(tmp.getUTCFullYear(), week)
}

function formatWeekLabel(year, week) {
    // "S36 — 2–8 sept. 2025"
    const start = getISOWeekStartUTC(year, week)
    const end = new Date(start)
    end.setUTCDate(start.getUTCDate() + 6)

    // 2–8 sept. 2025 (fr-FR)
    const dayStart = start.toLocaleDateString('fr-FR', { day: 'numeric' })
    const dayEnd = end.toLocaleDateString('fr-FR', { day: 'numeric' })
    const monthLabel = start.toLocaleDateString('fr-FR', { month: 'short' })
    const yearLabel = start.getUTCFullYear()

    return `S${String(week).padStart(2, '0')} — ${dayStart}–${dayEnd} ${monthLabel}. ${yearLabel}`
}

// --- helpers API
async function fetchMyTeam() {
    const token = localStorage.getItem('accessToken')
    const r = await fetch('https://ftmo.bob-digital.com/api/teams/my_team/', {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
    if (!r.ok) throw new Error('Impossible de récupérer mon équipe')
    return r.json()
}

async function fetchClassement(teamId) {
    const token = localStorage.getItem('accessToken')
    const r = await fetch(`https://ftmo.bob-digital.com/api/matches/classement/${teamId}`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
    if (!r.ok) throw new Error('Erreur API classement')
    return r.json()
}

// --- init
onMounted(async () => {
    try {
        // 1) my team (id + joueurs)
        const myTeam = await fetchMyTeam()
        const team = myTeam?.team
        if (!team?.id) throw new Error('Données équipe incomplètes')

        teamId.value = team.id
        teamName.value = team.club_name || ''

        // joueurs réels -> table
        const players = Array.isArray(team.players) ? team.players : []
        playerRows.value = players.map(p => {
            const won = Number(p.points_won || 0)
            const lost = Number(p.points_lost || 0)
            const total = won + lost
            const pct = total ? Math.round((won / total) * 100) : 0
            return {
                name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim(),
                points_won: won,
                points_lost: lost,
                diff: won - lost,
                win_pct: `${pct}%`,
            }
        })

        // 2) classement hebdo
        const data = await fetchClassement(teamId.value)

        ranking.value = data?.position ?? null
        winRate.value = data?.stats?.win_percentage ?? null

        const weekly = data?.weekly_positions ?? {}
        const currentWeekStart = currentISOWeekStartUTC()

        const pairs = Object.entries(weekly)
            .map(([key, pos]) => {
                const parsed = parseISOWeekKey(key)
                if (!parsed) return null
                const start = getISOWeekStartUTC(parsed.year, parsed.week)
                return { year: parsed.year, week: parsed.week, start, pos: Number(pos) }
            })
            .filter(Boolean)
            .filter(item => item.start <= currentWeekStart) // pas de semaines futures
            .sort((a, b) => (a.year - b.year) || (a.week - b.week))

        const labels = pairs.map(p => formatWeekLabel(p.year, p.week))
        const points = pairs.map(p => p.pos)

        chartData.value = {
            labels,
            datasets: [{ ...chartData.value.datasets[0], data: points }],
        }

        const maxPos = points.length ? Math.max(...points) : 6
        chartOptions.scales.y.suggestedMax = Math.max(6, maxPos)
    } catch (e) {
        errorMsg.value = e?.message || 'Erreur inconnue'
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="home-container">
        <h1 class="page-title">Tableau De Bord</h1>
        <p class="page-subtitle">
            Bienvenue sur le tableau de bord administrateur<span v-if="teamName"> — {{ teamName }}</span>.
        </p>

        <div v-if="loading">Chargement…</div>
        <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>

        <div v-else>
            <div class="card-grid">
                <div class="card yellow">
                    <h2>Classement général</h2>
                    <p class="value">
                        {{ ranking ?? '—' }}<sup v-if="ranking !== null">e</sup>
                    </p>
                    <p class="comment">
                        {{
                            ranking === 1
                                ? "Excellent ! Vous êtes en tête du classement."
                                : ranking !== null && ranking <= 5
                                    ? "Très bon positionnement, continuez ainsi !"
                                    : "Vous pouvez encore grimper au classement."
                        }}
                    </p>
                </div>

                <div class="card green">
                    <h2>Pourcentage de victoire</h2>
                    <p class="value">{{ winRate !== null ? Math.round(winRate) : '—' }}%</p>
                    <p class="comment">
                        {{
                            winRate !== null && winRate >= 75
                                ? "Performance impressionnante !"
                                : winRate !== null && winRate >= 50
                                    ? "Bon taux de victoire, gardez le rythme."
                                    : "Amélioration nécessaire pour rester compétitif."
                        }}
                    </p>
                </div>

                <div class="card chart-card">
                    <h2>Évolution du classement (hebdo)</h2>
                    <div class="chart-wrapper">
                        <template v-if="chartData.labels.length">
                            <Line :data="chartData" :options="chartOptions" />
                        </template>
                        <template v-else>
                            <div class="muted">Pas encore d’historique hebdomadaire de classement.</div>
                        </template>
                    </div>
                </div>
            </div>

            <div class="table-container">
                <h2 class="page-title">Joueurs de mon équipe</h2>
                <GenericRankingTable
                    :columns="playerColumns"
                    row_height="80"
                    :rows="playerRows"
                    width="100%"
                    title="Effectif & statistiques"
                    linkText="Voir tous les joueurs"
                    linkUrl="/players"
                />
            </div>
        </div>
    </div>
</template>
