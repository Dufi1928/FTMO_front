<template>
    <table class="sets-table">
        <thead>
        <tr><th>Match</th><th>Dom.</th><th>Ext.</th><th>Score D</th><th>Score E</th></tr>
        </thead>
        <tbody>
        <tr v-for="(s, i) in form" :key="s.match_identifier">
            <td>{{ s.match_identifier }}</td>
            <td>
                <select v-model.number="form[i].home_ids[0]">
                    <option value="">Sélectionner</option>
                    <option v-for="p in teamHome" :key="p.id" :value="p.id">
                        {{ p.first_name }} {{ p.last_name }}
                    </option>
                </select>
                <select v-model.number="form[i].home_ids[1]">
                    <option value="">Sélectionner</option>
                    <option v-for="p in teamHome" :key="p.id" :value="p.id">
                        {{ p.first_name }} {{ p.last_name }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model.number="form[i].visitor_ids[0]">
                    <option value="">Sélectionner</option>
                    <option v-for="p in teamAway" :key="p.id" :value="p.id">
                        {{ p.first_name }} {{ p.last_name }}
                    </option>
                </select>
                <select v-model.number="form[i].visitor_ids[1]">
                    <option value="">Sélectionner</option>
                    <option v-for="p in teamAway" :key="p.id" :value="p.id">
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

const form = ref([
    { match_identifier: 'D1', home_ids: [null, null], visitor_ids: [null, null], home_score: '', visitor_score: '' },
    { match_identifier: 'D2', home_ids: [null, null], visitor_ids: [null, null], home_score: '', visitor_score: '' },
    { match_identifier: 'D3', home_ids: [null, null], visitor_ids: [null, null], home_score: '', visitor_score: '' }
])

const teamHome = computed(() => props.team1)
const teamAway = computed(() => props.team2)

const totalHome = computed(() => form.value.reduce((sum, s) => sum + (parseInt(s.home_score) || 0), 0))
const totalAway = computed(() => form.value.reduce((sum, s) => sum + (parseInt(s.visitor_score) || 0), 0))

const isValid = computed(() =>
    form.value.every(s =>
        s.home_ids.every(id => id) &&
        s.visitor_ids.every(id => id) &&
        s.home_score !== '' &&
        s.visitor_score !== ''
    )
)

watch(
    () => form.value.map(r => ({ h: r.home_score, v: r.visitor_score })),
    (newVals, oldVals) => {
        newVals.forEach((val, i) => {
            const prev = oldVals[i] || { h: '', v: '' }
            if (val.h !== prev.h) {
                if (val.h !== '' && val.h !== 3) {
                    form.value[i].visitor_score = 3
                } else if (val.h === 3 && form.value[i].visitor_score === 3) {
                    form.value[i].visitor_score = ''
                }
            }
            if (val.v !== prev.v) {
                if (val.v !== '' && val.v !== 3) {
                    form.value[i].home_score = 3
                } else if (val.v === 3 && form.value[i].home_score === 3) {
                    form.value[i].home_score = ''
                }
            }
        })
    },
    { deep: true }
)

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
        form.value[idx].home_ids = set.home_players && set.home_players.length ? [...set.home_players] : [null, null]
        form.value[idx].visitor_ids = set.away_players && set.away_players.length ? [...set.away_players] : [null, null]
        form.value[idx].home_score = set.home_points
        form.value[idx].visitor_score = set.away_points
    })
})

async function saveSets() {
    const payload = form.value.map(s => ({
        match: props.matchId,
        set_type: 'double',
        match_identifier: s.match_identifier,
        home_players: s.home_ids,
        away_players: s.visitor_ids,
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
        if (!res.ok) throw new Error('Erreur sauvegarde D')
        emit('next-step')
    } catch (err) {
        emit('error', err.message)
    }
}
</script>

<style scoped>
/* Styles hérités de MatchEditor.css */
</style>

