/* Step2M.vue */
<template>
    <table class="sets-table">
        <thead>
        <tr><th>Match</th><th>Dom.</th><th>Ext.</th><th>Score D</th><th>Score E</th></tr>
        </thead>
        <tbody>
        <tr v-for="(s, i) in form" :key="s.match_identifier">
            <td>{{ s.match_identifier }}</td>
            <td>
                <select v-model.number="form[i].home_id">
                    <option value="">Sélectionner</option>
                    <option v-for="p in filteredHomeOptions(s.match_identifier, s.home_id)" :key="p.id" :value="p.id">
                        {{ p.first_name }} {{ p.last_name }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model.number="form[i].visitor_id">
                    <option value="">Sélectionner</option>
                    <option v-for="p in filteredAwayOptions(s.match_identifier, s.visitor_id)" :key="p.id" :value="p.id">
                        {{ p.first_name }} {{ p.last_name }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model.number="form[i].home_score">
                    <option value="">-</option>
                    <option v-for="n in 3" :key="n" :value="n">{{ n }}</option>
                </select>
            </td>
            <td>
                <select v-model.number="form[i].visitor_score">
                    <option value="">-</option>
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
    <button class="btn-primary save" @click="saveSets" :disabled="!isValid">Sauvegarder</button>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({ team1: Array, team2: Array, matchId: Number })
const emit = defineEmits(['next-step', 'error'])

// Initialize form based on JSON
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

// Pools
const teamHome = computed(() => props.team1)
const teamAway = computed(() => props.team2)

// IDs used in first half (M1-M3)
const usedHomeFirstHalf = computed(() =>
    form.value.filter(r => ['M1','M2','M3'].includes(r.match_identifier.split('-')[0])).map(r => r.home_id).filter(Boolean)
)
const usedAwayFirstHalf = computed(() =>
    form.value.filter(r => ['M1','M2','M3'].includes(r.match_identifier.split('-')[1])).map(r => r.visitor_id).filter(Boolean)
)

// Option filters
function filteredHomeOptions(matchId, currentHomeId) {
    const group = matchId.split('-')[0]
    if (['M4','M5','M6'].includes(group)) {
        return props.team1.filter(p => p.id === currentHomeId || !usedHomeFirstHalf.value.includes(p.id))
    }
    return props.team1
}
function filteredAwayOptions(matchId, currentAwayId) {
    const group = matchId.split('-')[1]
    if (['M4','M5','M6'].includes(group)) {
        return props.team2.filter(p => p.id === currentAwayId || !usedAwayFirstHalf.value.includes(p.id))
    }
    return props.team2
}

// Watchers to propagate selection across M1-M6
watch(
    () => form.value.map(r => r.home_id),
    (newIds, oldIds) => {
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
    (newIds, oldIds) => {
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

// Auto-balance scores
watch(
    () => form.value.map(r => ({ home: r.home_score, away: r.visitor_score })),
    (newVals, oldVals) => {
        newVals.forEach((val, idx) => {
            const prev = oldVals[idx]
            if (val.home !== prev.home && val.home !== 3 && val.home !== '') {
                form.value[idx].visitor_score = 3
            }
            if (val.away !== prev.away && val.away !== 3 && val.away !== '') {
                form.value[idx].home_score = 3
            }
        })
    }
)

// Totals
const totalHome = computed(() => form.value.reduce((sum, s) => sum + (parseInt(s.home_score) || 0), 0))
const totalAway = computed(() => form.value.reduce((sum, s) => sum + (parseInt(s.visitor_score) || 0), 0))

// Validation
const isValid = computed(() =>
    form.value.every(s => s.home_id && s.visitor_id && s.home_score !== '' && s.visitor_score !== '')
)

// Fetch and prefill existing sets
async function fetchExistingSets() {
    try {
        const res = await fetch(`https://ftmo.bob-digital.com/api/matchsets/?match=${props.matchId}`, { headers: { 'Content-Type': 'application/json' } })
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
        form.value[idx].home_id = set.home_player || null
        form.value[idx].visitor_id = set.away_player || null
        form.value[idx].home_score = set.home_points
        form.value[idx].visitor_score = set.away_points
    })
})

// Save sets
async function saveSets() {
    const payload = form.value.map(s => ({
        match: props.matchId,
        set_type: 'simple_m',
        match_identifier: s.match_identifier,
        home_player: s.home_id,
        away_player: s.visitor_id,
        home_points: s.home_score,
        away_points: s.visitor_score
    }))
    try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`https://ftmo.bob-digital.com/api/matchsets/bulk_create/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Erreur sauvegarde M')
        emit('next-step')
    } catch (err) {
        emit('error', err.message)
    }
}
</script>

<style scoped>
/* Styles hérités de MatchEditor.css */
</style>
