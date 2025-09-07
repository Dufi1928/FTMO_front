/* Step1MJ.vue */

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({ team1: Array, team2: Array, matchId: Number })
const emit = defineEmits(['next-step', 'error'])

// Initialize form (on garde la même structure d'affichage)
const form = ref([
    { match_identifier: 'F-F', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'F-J', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'J-F', home_id: null, visitor_id: null, home_score: '', visitor_score: '' },
    { match_identifier: 'J-J', home_id: null, visitor_id: null, home_score: '', visitor_score: '' }
])

// Pools (inchangé)
const femmesJeunesHome = computed(() =>
    props.team1.filter(
        p => p.civility === 'Mme' || new Date(p.birth_date) > new Date(new Date().getFullYear() - 15, 7, 31)
    )
)
const femmesJeunesAway = computed(() =>
    props.team2.filter(
        p => p.civility === 'Mme' || new Date(p.birth_date) > new Date(new Date().getFullYear() - 15, 7, 31)
    )
)

// Totals (inchangé)
const totalHome = computed(() =>
    form.value.reduce((sum, s) => sum + (parseInt(s.home_score) || 0), 0)
)
const totalAway = computed(() =>
    form.value.reduce((sum, s) => sum + (parseInt(s.visitor_score) || 0), 0)
)

// Validation (inchangé)
const isValid = computed(() =>
    form.value.every(
        s => s.home_id && s.visitor_id && s.home_score !== '' && s.visitor_score !== ''
    )
)

// Prefill (on garde le comportement, on s'adapte juste aux nouveaux champs du back)
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
        if (res.status === 401 || res.status === 403) {
            throw new Error('Non autorisé : token manquant/expiré ou droits insuffisants')
        }
        if (!res.ok) throw new Error('Erreur récupération des sets existants')
        return await res.json()
    } catch (e) {
        emit('error', e.message)
        return []
    }
}

onMounted(async () => {
    const sets = await fetchExistingSets()
    sets.forEach(set => {
        const idx = form.value.findIndex(f => f.match_identifier === set.match_identifier)
        if (idx !== -1) {
            // Compat old/new back : on lit d'abord les tableaux (nouveau), sinon les anciens champs
            const home = Array.isArray(set.home_players) ? set.home_players[0] : set.home_player
            const away = Array.isArray(set.away_players) ? set.away_players[0] : set.away_player
            form.value[idx].home_id = home ?? null
            form.value[idx].visitor_id = away ?? null
            form.value[idx].home_score = Number(set.home_points)
            form.value[idx].visitor_score = Number(set.away_points)
        }
    })
})

// Auto-balance and prevent 3-3 (inchangé)
watch(
    () => form.value.map(r => ({ h: r.home_score, v: r.visitor_score })),
    (newVals, oldVals) => {
        newVals.forEach((val, i) => {
            const prev = oldVals[i]
            // Home changed
            if (val.h !== prev.h) {
                if (val.h !== '' && val.h !== 3) {
                    form.value[i].visitor_score = 3
                } else if (val.h === 3 && form.value[i].visitor_score === 3) {
                    form.value[i].visitor_score = ''
                }
            }
            // Visitor changed
            if (val.v !== prev.v) {
                if (val.v !== '' && val.v !== 3) {
                    form.value[i].home_score = 3
                } else if (val.v === 3 && form.value[i].home_score === 3) {
                    form.value[i].home_score = ''
                }
            }
        })
    }, { deep: true }
)

// Save (adapté au nouveau back : tableaux + set_type 'single')
async function saveSets() {
    const payload = form.value.map(s => ({
        match: props.matchId,
        set_type: 'single',                 // <- nouveau type harmonisé
        match_identifier: s.match_identifier,
        home_players: [s.home_id],          // <- tableaux d'IDs (taille 1)
        away_players: [s.visitor_id],       // <- tableaux d'IDs (taille 1)
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
        if (!res.ok) throw new Error('Erreur sauvegarde MJ')
        emit('next-step')
    } catch (err) {
        emit('error', err.message)
    }
}
</script>

<template>
    <div class="table-responsive">
        <table class="sets-table">
            <thead>
            <tr><th>Catégorie</th><th>Dom.</th><th>Ext.</th><th>Score D</th><th>Score E</th></tr>
            </thead>
            <tbody>
            <tr v-for="(s, i) in form" :key="s.match_identifier">
                <td>{{ s.match_identifier }}</td>
                <td>
                    <select v-model.number="form[i].home_id">
                        <option value="">Sélectionner</option>
                        <option v-for="p in femmesJeunesHome" :key="p.id" :value="p.id">
                            {{ p.first_name }} {{ p.last_name }}
                        </option>
                    </select>
                </td>
                <td>
                    <select v-model.number="form[i].visitor_id">
                        <option value="">Sélectionner</option>
                        <option v-for="p in femmesJeunesAway" :key="p.id" :value="p.id">
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
    </div>
    <button class="btn-primary save" @click="saveSets" :disabled="!isValid">Sauvegarder</button>
</template>

<style scoped>
/* Styles hérités de MatchEditor.css */

.table-responsive {
    width: 100%;
    overflow-x: auto;
}

.sets-table {
    min-width: 600px;
}

@media (max-width: 640px) {
    .sets-table th,
    .sets-table td {
        padding: 0.5rem;
    }
    .sets-table select {
        min-width: 120px;
    }
}
</style>
