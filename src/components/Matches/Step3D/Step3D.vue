<template>
    <div class="table-responsive">
        <table class="sets-table">
            <thead>
            <tr>
                <th>Catégorie</th>
                <th>Dom.</th>
                <th>Ext.</th>
                <th>Score D</th>
                <th>Score E</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(s, i) in form" :key="s.match_identifier">
                <td class="categ-title">{{ s.match_identifier }}</td>

                <!-- DOMICILE -->
                <td>
                    <div class="select-group">
                        <span class="type-badge">{{ requiredType(s.match_identifier, 0) }}</span>
                        <select class="control-select" v-model.number="form[i].home_ids[0]">
                            <option value="">Sélectionner</option>
                            <option v-for="p in homeOptionsFor(i, 0)" :key="p.id" :value="p.id">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                        </select>
                    </div>
                    <div class="select-group">
                        <span class="type-badge">{{ requiredType(s.match_identifier, 1) }}</span>
                        <select class="control-select" v-model.number="form[i].home_ids[1]">
                            <option value="">Sélectionner</option>
                            <option v-for="p in homeOptionsFor(i, 1)" :key="p.id" :value="p.id">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                        </select>
                    </div>
                </td>

                <!-- EXTERIEUR -->
                <td>
                    <div class="select-group">
                        <span class="type-badge">{{ requiredType(s.match_identifier, 0) }}</span>
                        <select class="control-select" v-model.number="form[i].visitor_ids[0]">
                            <option value="">Sélectionner</option>
                            <option v-for="p in awayOptionsFor(i, 0)" :key="p.id" :value="p.id">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                        </select>
                    </div>
                    <div class="select-group">
                        <span class="type-badge">{{ requiredType(s.match_identifier, 1) }}</span>
                        <select class="control-select" v-model.number="form[i].visitor_ids[1]">
                            <option value="">Sélectionner</option>
                            <option v-for="p in awayOptionsFor(i, 1)" :key="p.id" :value="p.id">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                        </select>
                    </div>
                </td>

                <!-- SCORES -->
                <td>
                    <select class="control-select" v-model.number="form[i].home_score">
                        <option value="">-</option>
                        <option v-for="n in 3" :key="n" :value="n">{{ n }}</option>
                    </select>
                </td>
                <td>
                    <select class="control-select" v-model.number="form[i].visitor_score">
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({ team1: Array, team2: Array, matchId: Number })
const emit = defineEmits(['next-step', 'error'])

const form = ref([
    { match_identifier: 'D-M-J', home_ids: [null, null], visitor_ids: [null, null], home_score: '', visitor_score: '' },
    { match_identifier: 'D-M-F', home_ids: [null, null], visitor_ids: [null, null], home_score: '', visitor_score: '' },
    { match_identifier: 'D-F-J', home_ids: [null, null], visitor_ids: [null, null], home_score: '', visitor_score: '' }
])

const hommesHome = computed(() => props.team1.filter(p => p.civility === 'Mr'))
const hommesAway = computed(() => props.team2.filter(p => p.civility === 'Mr'))
const femmesHome = computed(() => props.team1.filter(p => p.civility === 'Mme'))
const femmesAway = computed(() => props.team2.filter(p => p.civility === 'Mme'))
const jeunesHome = computed(() =>
    props.team1.filter(
        p => new Date(p.birth_date) > new Date(new Date().getFullYear() - 15, 7, 31)
    )
)
const jeunesAway = computed(() =>
    props.team2.filter(
        p => new Date(p.birth_date) > new Date(new Date().getFullYear() - 15, 7, 31)
    )
)

function requiredType(matchId, pos) {
    if (matchId === 'D-M-J') return pos === 0 ? 'Homme' : 'Jeune'
    if (matchId === 'D-M-F') return pos === 0 ? 'Homme' : 'Femme'
    if (matchId === 'D-F-J') return pos === 0 ? 'Femme' : 'Jeune'
    return ''
}

function homeOptionsFor(idx, pos) {
    const id = form.value[idx].match_identifier
    if (id === 'D-M-J') return pos === 0 ? hommesHome.value : jeunesHome.value
    if (id === 'D-M-F') return pos === 0 ? hommesHome.value : femmesHome.value
    if (id === 'D-F-J') return pos === 0 ? femmesHome.value : jeunesHome.value
    return []
}
function awayOptionsFor(idx, pos) {
    const id = form.value[idx].match_identifier
    if (id === 'D-M-J') return pos === 0 ? hommesAway.value : jeunesAway.value
    if (id === 'D-M-F') return pos === 0 ? hommesAway.value : femmesAway.value
    if (id === 'D-F-J') return pos === 0 ? femmesAway.value : jeunesAway.value
    return []
}

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

/* Auto-règles de score (3-0 / 0-3) */
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

/* Synchronisation du joueur masculin entre D-M-J et D-M-F */
watch(
    () => form.value[0].home_ids[0],
    val => {
        if (form.value[1].home_ids[0] !== val) form.value[1].home_ids[0] = val
    }
)
watch(
    () => form.value[1].home_ids[0],
    val => {
        if (form.value[0].home_ids[0] !== val) form.value[0].home_ids[0] = val
    }
)
watch(
    () => form.value[0].visitor_ids[0],
    val => {
        if (form.value[1].visitor_ids[0] !== val) form.value[1].visitor_ids[0] = val
    }
)
watch(
    () => form.value[1].visitor_ids[0],
    val => {
        if (form.value[0].visitor_ids[0] !== val) form.value[0].visitor_ids[0] = val
    }
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
/* Conteneur responsive : scroll horizontal si nécessaire */
.table-responsive {
    width: 100%;
    overflow-x: auto;
}

/* Table */
.sets-table {
    width: 100%;
    border-collapse: collapse;
}
.sets-table th, .sets-table td {
    text-align: left;
}
.sets-table td {
    vertical-align: top;
    padding: 10px 12px;
}

/* Groupe label + select avec espace confortable */
.select-group {
    display: flex;
    align-items: center;
    gap: 8px;             /* espace entre badge et select */
    margin-bottom: 10px;  /* plus d’espace entre les selects */
}

/* Badge "Homme/Femme/Jeune" */
.type-badge {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 9999px;
    background: #eef2ff;
    color: #1f2937;
    white-space: nowrap;
    border: 1px solid #e5e7eb;
}

/* >>> Tous les inputs ont la même largeur, responsive */
:root {
    --control-min: 180px;  /* largeur mini confortable */
    --control-ideal: 22vw; /* s'adapte à l'écran */
    --control-max: 260px;  /* largeur maxi */
}

.control-select {
    width: clamp(var(--control-min), var(--control-ideal), var(--control-max));
    max-width: 100%;
    min-width: var(--control-min);
    display: inline-block;
}

/* Mobile : badge au-dessus, selects full width */
@media (max-width: 640px) {
    .select-group {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
    }
    .type-badge { margin-bottom: 2px; }
    .control-select { width: 100%; }
}

/* Styles hérités de MatchEditor.css (si présents) */
</style>

