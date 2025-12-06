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

/* ======================
   Définition colonnes
   ====================== */
const teamColumns = [
    { field: 'club', label: 'Club', pinned: true },
    {
        field: 'rank',
        label: 'Classement',
        sortable: true,
        html: (row) =>
            `<span class="rank-badge ${row.rank === 1 ? 'gold' : row.rank === 2 ? 'silver' : row.rank === 3 ? 'bronze' : ''}">${row.rank}</span>`
    },
    { field: 'won', label: 'Sets gagnés', sortable: true, cellClass: 'won', color: '#12B221' },
    { field: 'lost', label: 'Sets perdus', sortable: true, cellClass: 'lost', color: '#D11B1B' },
    { field: 'diff', label: 'Différence', sortable: true },
    { field: 'points', label: 'Pts', sortable: true },
    { field: 'played', label: 'Joués', sortable: true }
]

const playerColumns = [
    {
        field: 'player',
        label: 'Joueur',
        pinned: true,
        html: (row) => {
            const imgHtml = row.avatar
                ? `<img src="${row.avatar}" alt="${row.player}" class="player-avatar"/>`
                : (() => {
                    const initials = row.player
                        .split(' ')
                        .map(n => n[0] || '')
                        .join('')
                        .slice(0,2)
                        .toUpperCase()
                    return `<div class="avatar-initials"><span>${initials}</span></div>`
                })()
            return `<div class="cell-with-avatar">${imgHtml}<span>${row.player}</span></div>`
        }
    },
    { field: 'team_name', label: 'Equipe', sortable: true },
    {
        field: 'rank',
        label: 'Classement',
        sortable: true,
        html: (row) =>
            `<span class="rank-badge ${row.rank === 1 ? 'gold' : row.rank === 2 ? 'silver' : row.rank === 3 ? 'bronze' : ''}">${row.rank}</span>`
    },
    { field: 'won', label: 'Points marqués', sortable: true, cellClass: 'won', color: '#12B221' },
    { field: 'lost', label: 'Points concédés', sortable: true, cellClass: 'lost', color: '#D11B1B' },
    { field: 'diff', label: 'Différence', sortable: true }
]

const doubleColumns = [
    {
        field: 'pair',
        label: 'Paire',
        pinned: true,
        html: (row) => `<span>${row.pair ?? ''}</span>`
    },
    { field: 'team_name', label: 'Équipe', sortable: true },
    {
        field: 'rank',
        label: 'Classement',
        sortable: true,
        html: (row) =>
            `<span class="rank-badge ${row.rank === 1 ? 'gold' : row.rank === 2 ? 'silver' : row.rank === 3 ? 'bronze' : ''}">${row.rank}</span>`
    },
    { field: 'won', label: 'Points marqués', sortable: true, cellClass: 'won', color: '#12B221' },
    { field: 'lost', label: 'Points concédés', sortable: true, cellClass: 'lost', color: '#D11B1B' },
    { field: 'diff', label: 'Différence', sortable: true }
]

/* ======================
   Choix colonnes selon tag
   ====================== */
const isDoublesTag = (tag) => tag.toUpperCase().includes('DOUBLES')

const columns = computed(() => {
    if (activeTag.value === 'EQUIPES') return teamColumns
    if (isDoublesTag(activeTag.value)) return doubleColumns
    return playerColumns
})

/* ======================
   Données classement
   ====================== */
const ranking = ref([])
const loading = ref(false)
const errorMsg = ref('')

function decorateAndSet(rows, nameField) {
    const mapped = rows.map(r => {
        const won = Number(r.won) || 0
        const lost = Number(r.lost) || 0
        const base = {
            [nameField]: r[nameField],
            team_name: r.team_name || '',
            won,
            lost,
            diff: ('diff' in r) ? Number(r.diff) : (won - lost)
        }
        if (r.avatar) base.avatar = r.avatar
        return base
    })
    mapped.sort((a, b) => (b.won - a.won) || (b.diff - a.diff))
    mapped.forEach((r, i) => (r.rank = i + 1))
    ranking.value = mapped
}

// ---------------------
// Équipes: remplacer la source par classement-complet
// ---------------------
async function fetchTeamsRankingFromClassementComplet() {
    loading.value = true
    errorMsg.value = ''
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/matches/classement-complet/')
        if (!res.ok) throw new Error('Erreur chargement classement équipes')
        const data = await res.json()
        const rows = Array.isArray(data?.standings) ? data.standings : []
        ranking.value = rows.map(r => ({
            club: r.team_name,
            won: Number(r.sets_gained) || 0,
            lost: Number(r.sets_lost) || 0,
            diff: Number(r.sets_diff) || 0,
            rank: Number(r.position),
            points: Number(r.table_points) || 0,
            played: Number(r.played) || 0
        }))
    } catch (e) {
        console.error(e)
        errorMsg.value = e?.message || 'Erreur inconnue.'
        ranking.value = []
    } finally {
        loading.value = false
    }
}

// ---------------------
// Anciennes fonctions: on garde pour joueurs/doubles
// ---------------------
async function fetchTeamsRanking() {
    // redirige vers la nouvelle source
    return fetchTeamsRankingFromClassementComplet()
}

function buildRankingFromPlayers(players) {
    const rows = players.map(p => {
        const won = Number(p.points_scored) || 0
        const lost = Number(p.points_conceded) || 0
        const label = p.names ? p.names : `${p.first_name} ${p.last_name}`
        return {
            player: label,
            avatar: p.profile_image || p.avatar || '',
            team_name: p.team_name || '',
            won,
            lost,
            diff: won - lost
        }
    })
    decorateAndSet(rows, 'player')
}

function buildRankingFromDoubles(results) {
    const byPair = new Map();

    const pairLabelOf = (r) => {
        if (r.names) return r.names;
        if (Array.isArray(r.players) && r.players.length) {
            return r.players.map(p => `${p.first_name} ${p.last_name}`.trim()).join(' / ');
        }
        return 'inconnu';
    };

    const teamOfFirstPlayer = (r) => {
        if (Array.isArray(r.player_ids) && r.player_ids.length && Array.isArray(r.players) && r.players.length) {
            const firstId = [...r.player_ids].sort((a,b)=>a-b)[0];
            const first = r.players.find(p => p.id === firstId) || r.players[0];
            return first?.team_name || '';
        }
        return r.team_name || '';
    };

    for (const r of results) {
        const won = Number(r.points_scored) || 0;
        const lost = Number(r.points_conceded) || 0;

        const key = Array.isArray(r.player_ids) && r.player_ids.length
            ? [...r.player_ids].sort((a,b)=>a-b).join('-')
            : pairLabelOf(r);

        if (!byPair.has(key)) {
            byPair.set(key, {
                names: pairLabelOf(r),
                team_name: teamOfFirstPlayer(r),
                won: 0,
                lost: 0
            });
        }
        const acc = byPair.get(key);
        acc.won += won;
        acc.lost += lost;
        if (!acc.team_name) acc.team_name = teamOfFirstPlayer(r);
    }

    const rows = Array.from(byPair.values()).map(p => ({
        pair: p.names,
        team_name: p.team_name,
        won: p.won,
        lost: p.lost,
        diff: p.won - p.lost
    }));

    decorateAndSet(rows, 'pair');
}

async function fetchCategoryRanking(tag) {
    try {
        const slug = tag.toLowerCase().replace(/\s+/g, '-')
        const url = `${API_BASE}/stats/${encodeURIComponent(slug)}/`
        const res = await fetch(url)
        const data = await res.json()
        const results = data.results || []
        const looksLikeDoubles =
            isDoublesTag(tag) ||
            (results[0] && (Array.isArray(results[0].player_ids) || 'names' in results[0]))

        if (looksLikeDoubles) {
            buildRankingFromDoubles(results)
        } else {
            buildRankingFromPlayers(results)
        }
    } catch (err) {
        console.error(`Erreur chargement classement pour ${tag}`, err)
        ranking.value = []
    }
}

/* ======================
   Lifecycle
   ====================== */
onMounted(() => {
    fetchTeamsRankingFromClassementComplet()
})

watch(activeTag, (tag) => {
    if (tag === 'EQUIPES') {
        fetchTeamsRankingFromClassementComplet()
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

        <div v-if="loading" class="ranking-loading">Chargement du classement…</div>
        <div v-else-if="errorMsg" class="ranking-error">{{ errorMsg }}</div>
        <GenericRankingTable
            v-else-if="ranking.length"
            :columns="columns"
            :rows="ranking"
            :show-search="true"
            row_height="120"
            title="Classement des Équipes"
        />
        <div v-else class="coming-soon">
            <p>Classement bientôt disponible</p>
        </div>
    </main>
    <Footer/>
</template>
