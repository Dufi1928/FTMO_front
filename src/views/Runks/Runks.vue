<script setup>
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import './Runks.css'
import {useAuthStore} from '../../../stores/auth.js'

const auth = useAuthStore()
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue";
import GenericRankingTable from "../../components/GenericRankingTable/GenericRankingTable.vue"

import {ref, computed, onMounted, watch} from 'vue'

const API_BASE = 'https://ftmo.bob-digital.com/api'

const tags = [
    'EQUIPES',
    'FEMININES',
    'MASCULINS',
    'DOUBLES MASCULINS',
    'DOUBLES MASCULIN-FEMININ',
    'JEUNES',
    'DOUBLES MASCULIN-JEUNE',
    'DOUBLES FEMININ-JEUNE'
]

const activeTag = ref('EQUIPES')

const teamColumns = [
    {field: 'club', label: 'Club', pinned: true},
    {
        field: 'rank',
        label: 'Classement',
        sortable: true,
        html: (row) =>
            `<span class="rank-badge ${row.rank === 1 ? 'gold' : row.rank === 2 ? 'silver' : row.rank === 3 ? 'bronze' : ''}">${row.rank}</span>`
    },
    {field: 'won', label: 'Sets gagnés', sortable: true, cellClass: 'won', color: '#12B221'},
    {field: 'lost', label: 'Sets perdus', sortable: true, cellClass: 'lost', color: '#D11B1B'},
    {field: 'diff', label: 'Différence', sortable: true}
]

const playerColumns = [
    {field: 'player', label: 'Joueur', pinned: true},
    {
        field: 'rank',
        label: 'Classement',
        sortable: true,
        html: (row) =>
            `<span class="rank-badge ${row.rank === 1 ? 'gold' : row.rank === 2 ? 'silver' : row.rank === 3 ? 'bronze' : ''}">${row.rank}</span>`
    },
    {field: 'won', label: 'Points marqués', sortable: true, cellClass: 'won', color: '#12B221'},
    {field: 'lost', label: 'Points concédés', sortable: true, cellClass: 'lost', color: '#D11B1B'},
    {field: 'diff', label: 'Différence', sortable: true}
]

const columns = computed(() => activeTag.value === 'EQUIPES' ? teamColumns : playerColumns)

const ranking = ref([])

function decorateAndSet(rows, nameField) {
    // rows: [{[nameField], won, lost, diff?}]
    const mapped = rows.map(r => {
        const won = Number(r.won) || 0
        const lost = Number(r.lost) || 0
        return {
            [nameField]: r[nameField],
            won,
            lost,
            diff: ('diff' in r) ? Number(r.diff) : (won - lost)
        }
    })
    // Tri: won desc puis diff desc
    mapped.sort((a, b) => (b.won - a.won) || (b.diff - a.diff))
    mapped.forEach((r, i) => (r.rank = i + 1))
    ranking.value = mapped
}

function buildRankingFromTeams(teams) {
    const rows = teams.map((t) => {
        const wonSets = Number(t.total_points_scored) || 0
        const lostSets = Number(t.total_points_conceded) || 0
        const diff = wonSets - lostSets
        return {
            club: t.club_name,
            won: wonSets,
            lost: lostSets,
            diff
        }
    })
    decorateAndSet(rows, 'club')
}

async function fetchTeamsRanking() {
    try {
        const res = await fetch(`${API_BASE}/teams/`)
        const data = await res.json()
        buildRankingFromTeams(data)
    } catch (err) {
        console.error('Erreur chargement classement équipes', err)
        ranking.value = []
    }
}

function buildRankingFromPlayers(players) {
    const rows = players.map(p => {
        const won = Number(p.points_scored) || 0
        const lost = Number(p.points_conceded) || 0
        const diff = won - lost
        return {
            player: `${p.first_name} ${p.last_name}`,
            won,
            lost,
            diff
        }
    })
    decorateAndSet(rows, 'player')
}

async function fetchCategoryRanking(tag) {
    try {
        const slug = tag.toLowerCase().replace(/\s+/g, '-')
        const url = `${API_BASE}/stats/${encodeURIComponent(slug)}/`
        const res = await fetch(url)
        const data = await res.json()
        // data.results: [{ first_name, last_name, points_scored, points_conceded }]
        buildRankingFromPlayers(data.results || [])
    } catch (err) {
        console.error(`Erreur chargement classement pour ${tag}`, err)
        ranking.value = []
    }
}

onMounted(() => {
    fetchTeamsRanking()
})

watch(activeTag, (tag) => {
    if (tag === 'EQUIPES') {
        fetchTeamsRanking()
    } else {
        fetchCategoryRanking(tag)
    }
})
</script>

<template>
    <Header theme="light" :key="auth.renderKey" :alwaysBlack="true"/>
    <main class="runks-main">
        <div class="runks_hero">
            <MainPageTitle
                title="Classement général des clubs"
                description="Découvrez le classement actualisé de tous les clubs de la FTMO"
            />
        </div>

        <ul class="runks-tags">
            <li v-for="tag in tags" :key="tag">
                <button :class="{ active: activeTag === tag }" @click="activeTag = tag">
                    {{ tag }}
                </button>
            </li>
        </ul>

        <GenericRankingTable
            v-if="ranking.length"
            :columns="columns"
            :rows="ranking"
            row_height="80"
        />
        <div v-else class="coming-soon">
            <p>Classement bientôt disponible</p>
        </div>
    </main>
    <Footer/>
</template>
