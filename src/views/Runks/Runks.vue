<script setup>
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import './Runks.css'
import { useAuthStore } from '../../../stores/auth.js'
const auth = useAuthStore()
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue"
import GenericRankingTable from "../../components/GenericRankingTable/GenericRankingTable.vue"

import { ref, onMounted } from 'vue'

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

const columns = [
    { field: 'club', label: 'Club', pinned: true },
    {
        field: 'rank',
        label: 'Classement',
        sortable: true,
        html: (row) => `<span class="rank-badge ${row.rank === 1 ? 'gold' : row.rank === 2 ? 'silver' : row.rank === 3 ? 'bronze' : ''}">${row.rank}</span>`
    },
    { field: 'won', label: 'Sets gagnés', sortable: true, cellClass: 'won', color: '#12B221' },
    { field: 'lost', label: 'Sets perdus', sortable: true, cellClass: 'lost', color: '#D11B1B' },
    { field: 'diff', label: 'Différence', sortable: true }
]

const ranking = ref([])

function buildRankingFromTeams(teams) {
    const rows = teams.map((t) => {
        const wonSets = Number(t.total_points_scored) || 0
        const lostSets = Number(t.total_points_conceded) || 0
        const diff = wonSets - lostSets
        const teamNo = t.team_admin ?? 1
        return {
            club: t.club_name,
            teamNo,
            won: wonSets,
            lost: lostSets,
            diff
        }
    })

    rows.sort((a, b) => b.won - a.won)
    rows.forEach((r, i) => (r.rank = i + 1))
    ranking.value = rows
}

async function fetchTeamsRanking() {
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/')
        const data = await res.json()
        buildRankingFromTeams(data)
    } catch (err) {
        console.error('Erreur chargement classement équipes', err)
    }
}

onMounted(() => {
    fetchTeamsRanking()
})
</script>

<template>
    <Header theme="light" :key="auth.renderKey" :alwaysBlack="true" />
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

        <div v-if="activeTag === 'EQUIPES'">
            <GenericRankingTable
                :columns="columns"
                :rows="ranking"
                width="80%"
                row_height="50"
            />
        </div>
        <div v-else class="coming-soon">
            <p>Classement bientôt disponible</p>
        </div>
    </main>
    <Footer />
</template>

