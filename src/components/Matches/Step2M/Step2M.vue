<template>
    <div class="table-responsive" :class="{ 'read-only': readOnly }">
        <table class="sets-table">
            <thead>
            <tr><th>Match</th><th>Dom.</th><th>Ext.</th><th>Score D</th><th>Score E</th></tr>
            </thead>
            <tbody>
            <tr v-for="(s, i) in form" :key="s.match_identifier">
                <td>{{ s.match_identifier }}</td>

                <td>
                    <select v-model.number="form[i].home_id" :disabled="readOnly">
                        <option :value="null">Sélectionner</option>
                        <option
                            v-for="p in filteredHomeOptions(s.match_identifier, s.home_id)"
                            :key="p.id"
                            :value="Number(p.id)"
                        >
                            {{ p.first_name }} {{ p.last_name }}
                        </option>
                    </select>
                </td>

                <td>
                    <select v-model.number="form[i].visitor_id" :disabled="readOnly">
                        <option :value="null">Sélectionner</option>
                        <option
                            v-for="p in filteredAwayOptions(s.match_identifier, s.visitor_id)"
                            :key="p.id"
                            :value="Number(p.id)"
                        >
                            {{ p.first_name }} {{ p.last_name }}
                        </option>
                    </select>
                </td>

                <td>
                    <select v-model.number="form[i].home_score" :disabled="readOnly">
                        <option :value="null">-</option>
                        <option v-for="n in 3" :key="n" :value="n">{{ n }}</option>
                    </select>
                </td>
                <td>
                    <select v-model.number="form[i].visitor_score" :disabled="readOnly">
                        <option :value="null">-</option>
                        <option v-for="n in 3" :key="n" :value="n">{{ n }}</option>
                    </select>
                </td>
            </tr>
            </tbody>
            <tfoot>
            <tr>
                <td colspan="3">Total</td>
                <td>{{ totalHome }}</td>
                <td>{{ totalAway }}</td>
            </tr>
            </tfoot>
        </table>
    </div>

    <!-- Bouton masqué si extérieur -->
    <button
        v-if="!readOnly"
        class="btn-primary save"
        @click="saveSets"
        :disabled="!isValid"
    >
        Sauvegarder
    </button>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
    team1: Array,
    team2: Array,
    matchId: Number,
    isHomeTeam: Boolean, // <-- ajouté
})
const emit = defineEmits(['next-step', 'error'])

const readOnly = computed(() => !props.isHomeTeam) // extérieur => lecture seule

// Initialize form
const form = ref([
    { match_identifier: 'M1-M1', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M1-M2', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M1-M3', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M2-M1', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M2-M2', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M2-M3', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M3-M1', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M3-M2', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M3-M3', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M4-M4', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M4-M5', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M4-M6', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M5-M4', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M5-M5', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M5-M6', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M6-M4', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M6-M5', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'M6-M6', home_id: null, visitor_id: null, home_score: '', visitor_score: '' }
])

const teamHome = computed(() => props.team1)
const teamAway = computed(() => props.team2)

const usedHomeFirstHalf = computed(() =>
    form.value
        .filter(r => ['M1','M2','M3'].includes(r.match_identifier.split('-')[0]))
        .map(r => r.home_id)
        .filter(Boolean)
)
const usedAwayFirstHalf = computed(() =>
    form.value
        .filter(r => ['M1','M2','M3'].includes(r.match_identifier.split('-')[1]))
        .map(r => r.visitor_id)
        .filter(Boolean)
)

function ensureCurrent(list, all, currentId) {
    if (currentId == null) return list
    const cid = Number(currentId)
    if (!list.some(p => Number(p.id) === cid)) {
        const cur = all.find(p => Number(p.id) === cid)
        if (cur) return [cur, ...list]
    }
    return list
}

function filteredHomeOptions(matchId, currentHomeId) {
    const group = matchId.split('-')[0]
    let list = props.team1
    if (['M4','M5','M6'].includes(group)) {
        list = props.team1.filter(
            p => Number(p.id) === Number(currentHomeId) || !usedHomeFirstHalf.value.includes(Number(p.id))
        )
    }
    return ensureCurrent(list, props.team1, currentHomeId)
}
function filteredAwayOptions(matchId, currentAwayId) {
    const group = matchId.split('-')[1]
    let list = props.team2
    if (['M4','M5','M6'].includes(group)) {
        list = props.team2.filter(
            p => Number(p.id) === Number(currentAwayId) || !usedAwayFirstHalf.value.includes(Number(p.id))
        )
    }
    return ensureCurrent(list, props.team2, currentAwayId)
}

// Propagation des sélections (désactivée en lecture seule)
watch(
    () => form.value.map(r => r.home_id),
    (newIds, oldIds = []) => {
        if (readOnly.value) return
        newIds.forEach((newId, idx) => {
            if (newId !== oldIds[idx]) {
                const group = form.value[idx].match_identifier.split('-')[0]
                form.value.forEach(r => {
                    if (r.match_identifier.split('-')[0] === group) r.home_id = newId
                })
            }
        })
    }
)
watch(
    () => form.value.map(r => r.visitor_id),
    (newIds, oldIds = []) => {
        if (readOnly.value) return
        newIds.forEach((newId, idx) => {
            if (newId !== oldIds[idx]) {
                const group = form.value[idx].match_identifier.split('-')[1]
                form.value.forEach(r => {
                    if (r.match_identifier.split('-')[1] === group) r.visitor_id = newId
                })
            }
        })
    }
)

// Auto-balance scores (désactivé en lecture seule)
watch(
    () => form.value.map(r => ({ home: r.home_score, away: r.visitor_score })),
    (newVals, oldVals = []) => {
        if (readOnly.value) return
        newVals.forEach((val, idx) => {
            const prev = oldVals[idx] || { home: '', away: '' }
            if (val.home !== prev.home && val.home !== 3 && val.home !== '') {
                form.value[idx].visitor_score = 3
            }
            if (val.away !== prev.away && val.away !== 3 && val.away !== '') {
                form.value[idx].home_score = 3
            }
        })
    }
)

const totalHome = computed(() =>
    form.value.reduce((sum, s) => sum + (parseInt(s.home_score) || 0), 0)
)
const totalAway = computed(() =>
    form.value.reduce((sum, s) => sum + (parseInt(s.visitor_score) || 0), 0)
)
const isValid = computed(() =>
    form.value.every(s =>
        Number.isInteger(s.home_id) &&
        Number.isInteger(s.visitor_id) &&
        Number.isInteger(s.home_score) && s.home_score >= 1 && s.home_score <= 3 &&
        Number.isInteger(s.visitor_score) && s.visitor_score >= 1 && s.visitor_score <= 3
    )
)

async function fetchExistingSets() {
    const token = localStorage.getItem('accessToken')
    try {
        const res = await fetch(
            `https://ftmo.bob-digital.com/api/matchsets/?match=${props.matchId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            }
        )
        if (!res.ok) throw new Error('Erreur récupération des sets existants')
        return await res.json()
    } catch {
        return []
    }
}

onMounted(async () => {
    const sets = await fetchExistingSets()
    sets.forEach(set => {
        const idx = form.value.findIndex(f => f.match_identifier === set.match_identifier)
        if (idx === -1) return
        const home = Array.isArray(set.home_players) ? set.home_players[0] : set.home_player
        const away = Array.isArray(set.away_players) ? set.away_players[0] : set.away_player
        form.value[idx].home_id = home ?? null
        form.value[idx].visitor_id = away ?? null
        form.value[idx].home_score = Number(set.home_points)
        form.value[idx].visitor_score = Number(set.away_points)
    })
})

// Sécurité : ne rien faire en lecture seule
async function saveSets() {
    if (readOnly.value) return
    const payload = form.value.map(s => ({
        match: props.matchId,
        set_type: 'single',
        match_identifier: s.match_identifier,
        home_players: [s.home_id],
        away_players: [s.visitor_id],
        home_points: s.home_score,
        away_points: s.visitor_score
    }))

    try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`https://ftmo.bob-digital.com/api/matchsets/bulk_create/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Erreur sauvegarde M')
        emit('next-step')
    } catch (err) {
        emit('error', err.message)
    }
}
</script>

<style scoped>
.table-responsive {
    width: 100%;
    overflow-x: auto;
}

.sets-table {
    min-width: 600px;
}

@media (max-width: 640px) {
    .sets-table th, .sets-table td {
        padding: 0.5rem;
    }

    .sets-table select {
        min-width: 120px;
    }
}

.read-only {
    opacity: 0.9;
}

.read-only select {
    cursor: not-allowed;
}
</style>
