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
                            <option :value="null">Sélectionner</option>
                            <option v-for="p in homeOptionsFor(i, 0)" :key="p.id" :value="Number(p.id)">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                        </select>
                    </div>
                    <div class="select-group">
                        <span class="type-badge">{{ requiredType(s.match_identifier, 1) }}</span>
                        <select class="control-select" v-model.number="form[i].home_ids[1]">
                            <option :value="null">Sélectionner</option>
                            <option v-for="p in homeOptionsFor(i, 1)" :key="p.id" :value="Number(p.id)">
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
                            <option :value="null">Sélectionner</option>
                            <option v-for="p in awayOptionsFor(i, 0)" :key="p.id" :value="Number(p.id)">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                        </select>
                    </div>
                    <div class="select-group">
                        <span class="type-badge">{{ requiredType(s.match_identifier, 1) }}</span>
                        <select class="control-select" v-model.number="form[i].visitor_ids[1]">
                            <option :value="null">Sélectionner</option>
                            <option v-for="p in awayOptionsFor(i, 1)" :key="p.id" :value="Number(p.id)">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                        </select>
                    </div>
                </td>

                <!-- SCORES -->
                <td>
                    <select class="control-select" v-model.number="form[i].home_score">
                        <option :value="null">-</option>
                        <option v-for="n in [0,1,2,3]" :key="`h${n}`" :value="n">{{ n }}</option>
                    </select>
                </td>
                <td>
                    <select class="control-select" v-model.number="form[i].visitor_score">
                        <option :value="null">-</option>
                        <option v-for="n in [0,1,2,3]" :key="`v${n}`" :value="n">{{ n }}</option>
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

    <!-- Message de succès -->
    <transition name="fade">
        <div v-if="showSuccess" class="alert-success" role="status" aria-live="polite">
            ✅ Sauvegarde effectuée
        </div>
    </transition>

    <button class="btn-primary save" @click="saveSets" :disabled="!isValid">Valider</button>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({ team1: Array, team2: Array, matchId: Number })
const emit = defineEmits(['next-step', 'error'])

const showSuccess = ref(false)

const form = ref([
    { match_identifier: 'D-M-M', home_ids: [null, null], visitor_ids: [null, null], home_score: null, visitor_score: null },
    { match_identifier: 'D-M-J', home_ids: [null, null], visitor_ids: [null, null], home_score: null, visitor_score: null },
    { match_identifier: 'D-M-F', home_ids: [null, null], visitor_ids: [null, null], home_score: null, visitor_score: null },
    { match_identifier: 'D-F-J', home_ids: [null, null], visitor_ids: [null, null], home_score: null, visitor_score: null }
])

/* ----------------- Filtres joueurs ----------------- */
const CUTOFF = new Date(new Date().getFullYear() - 15, 7, 31) // 31 août
const isJeune = (p) => p?.birth_date ? new Date(p.birth_date) > CUTOFF : false

const hommesHome = computed(() => props.team1.filter(p => p.civility === 'Mr'))
const hommesAway = computed(() => props.team2.filter(p => p.civility === 'Mr'))
const femmesHome = computed(() => props.team1.filter(p => p.civility === 'Mme'))
const femmesAway = computed(() => props.team2.filter(p => p.civility === 'Mme'))
const jeunesHome  = computed(() => props.team1.filter(isJeune))
const jeunesAway  = computed(() => props.team2.filter(isJeune))

function requiredType(matchId, pos) {
    if (matchId === 'D-M-M') return 'Homme'
    if (matchId === 'D-M-J') return pos === 0 ? 'Homme' : 'Jeune'
    if (matchId === 'D-M-F') return pos === 0 ? 'Homme' : 'Femme'
    if (matchId === 'D-F-J') return pos === 0 ? 'Femme' : 'Jeune'
    return ''
}

function homeOptionsFor(idx, pos) {
    const id = form.value[idx].match_identifier
    if (id === 'D-M-M') return hommesHome.value
    if (id === 'D-M-J') return pos === 0 ? hommesHome.value : jeunesHome.value
    if (id === 'D-M-F') return pos === 0 ? hommesHome.value : femmesHome.value
    if (id === 'D-F-J') return pos === 0 ? femmesHome.value : jeunesHome.value
    return []
}
function awayOptionsFor(idx, pos) {
    const id = form.value[idx].match_identifier
    if (id === 'D-M-M') return hommesAway.value
    if (id === 'D-M-J') return pos === 0 ? hommesAway.value : jeunesAway.value
    if (id === 'D-M-F') return pos === 0 ? hommesAway.value : femmesAway.value
    if (id === 'D-F-J') return pos === 0 ? femmesAway.value : jeunesAway.value
    return []
}

/* ----------------- Totaux ----------------- */
const totalHome = computed(() => form.value.reduce((sum, s) => sum + (parseInt(s.home_score) || 0), 0))
const totalAway = computed(() => form.value.reduce((sum, s) => sum + (parseInt(s.visitor_score) || 0), 0))

/* ----------------- Validation ----------------- */
const isScore = (n) => Number.isInteger(n) && n >= 0 && n <= 3
const isValid = computed(() =>
    form.value.every(s => {
        const h = s.home_ids
        const a = s.visitor_ids
        const bothFilled = h.every(Number.isInteger) && a.every(Number.isInteger)
        const twoEach = h.length === 2 && a.length === 2
        const noDup = new Set([...h, ...a]).size === [...h, ...a].length
        const scoresOk =
            isScore(s.home_score) &&
            isScore(s.visitor_score) &&
            ((s.home_score === 3 && s.visitor_score < 3) ||
                (s.visitor_score === 3 && s.home_score < 3))
        return twoEach && bothFilled && noDup && scoresOk
    })
)

/* ----------------- Normalisation d’ordre ----------------- */
const playerById = (teamArr, id) => teamArr.find(p => Number(p.id) === Number(id)) || null
const fitsType = (p, type) => {
    if (!p) return false
    if (type === 'Homme') return p.civility === 'Mr'
    if (type === 'Femme') return p.civility === 'Mme'
    if (type === 'Jeune') return isJeune(p)
    return false
}
/** Recase [idA,idB] dans [slot0, slot1] selon matchId et team */
function normalizePair(ids, matchId, teamArr) {
    const want0 = requiredType(matchId, 0)
    const want1 = requiredType(matchId, 1)
    const [a, b] = (ids || []).map(n => Number(n)).filter(Number.isInteger)
    const pa = playerById(teamArr, a)
    const pb = playerById(teamArr, b)

    if (fitsType(pa, want0) && fitsType(pb, want1)) return [a, b]
    if (fitsType(pa, want1) && fitsType(pb, want0)) return [b, a]

    let s0 = null, s1 = null
    if (fitsType(pa, want0)) s0 = a
    else if (fitsType(pb, want0)) s0 = b

    const rem = [a, b].filter(x => x !== s0)
    const pr0 = playerById(teamArr, rem[0])
    const pr1 = playerById(teamArr, rem[1])

    if (!s1) {
        if (fitsType(pr0, want1)) s1 = rem[0]
        else if (fitsType(pr1, want1)) s1 = rem[1]
    }

    if (s0 == null) s0 = a ?? null
    if (s1 == null) s1 = (s0 === a ? b : a) ?? null

    return [s0 ?? null, s1 ?? null]
}

/* ----------------- Auto-règles de score ----------------- */
watch(
    () => form.value.map(r => ({ h: r.home_score, v: r.visitor_score })),
    (newVals, oldVals) => {
        newVals.forEach((val, i) => {
            const prev = oldVals?.[i] ?? { h: null, v: null }
            if (val.h !== prev.h) {
                if (val.h != null && val.h !== 3) form.value[i].visitor_score = 3
                else if (val.h === 3 && form.value[i].visitor_score === 3) form.value[i].visitor_score = null
            }
            if (val.v !== prev.v) {
                if (val.v != null && val.v !== 3) form.value[i].home_score = 3
                else if (val.v === 3 && form.value[i].home_score === 3) form.value[i].home_score = null
            }
        })
    },
    { deep: true }
)

/* ----------------- Sync masculin entre D-M-J (index 1) et D-M-F (index 2) ----------------- */
watch(() => form.value[1].home_ids[0], v => { if (form.value[2].home_ids[0] !== v) form.value[2].home_ids[0] = v })
watch(() => form.value[2].home_ids[0], v => { if (form.value[1].home_ids[0] !== v) form.value[1].home_ids[0] = v })
watch(() => form.value[1].visitor_ids[0], v => { if (form.value[2].visitor_ids[0] !== v) form.value[2].visitor_ids[0] = v })
watch(() => form.value[2].visitor_ids[0], v => { if (form.value[1].visitor_ids[0] !== v) form.value[1].visitor_ids[0] = v })

/* ----------------- GET existants ----------------- */
async function fetchExistingSets() {
    const token = localStorage.getItem('accessToken')
    try {
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`

        const res = await fetch(`https://ftmo.bob-digital.com/api/matchsets/?match=${props.matchId}`, { headers })
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

        const rawHome = Array.isArray(set.home_players) ? set.home_players : []
        const rawAway = Array.isArray(set.away_players) ? set.away_players : []

        const [h0, h1] = normalizePair(rawHome, set.match_identifier, props.team1)
        const [a0, a1] = normalizePair(rawAway, set.match_identifier, props.team2)

        form.value[idx].home_ids = [h0, h1]
        form.value[idx].visitor_ids = [a0, a1]
        form.value[idx].home_score = Number(set.home_points)
        form.value[idx].visitor_score = Number(set.away_points)
    })
})

/* ----------------- Helpers & SAVE ----------------- */
const toPair = (arr) => arr.filter(v => Number.isInteger(v)).map(v => Number(v))
const formatErrors = (errs) => errs.map(e => `#${e.index}: ${JSON.stringify(e.error)}`).join('\n')

async function saveSets() {
    const payload = form.value.map(s => {
        const home = toPair(s.home_ids)
        const away = toPair(s.visitor_ids)
        if (home.length !== 2 || away.length !== 2) {
            throw new Error('Chaque double doit avoir exactement 2 joueurs sélectionnés par équipe.')
        }
        if (new Set([...home, ...away]).size !== 4) {
            throw new Error('Un même joueur ne peut pas être sélectionné deux fois dans le même set.')
        }
        return {
            match: props.matchId,
            set_type: 'double',
            match_identifier: s.match_identifier,
            home_players: home,
            away_players: away,
            home_points: s.home_score,
            away_points: s.visitor_score
        }
    })

    try {
        const token = localStorage.getItem('accessToken')
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`

        const res = await fetch(`https://ftmo.bob-digital.com/api/matchsets/bulk_create/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || (data && Array.isArray(data.errors) && data.errors.length)) {
            const msg = data && data.errors ? formatErrors(data.errors) : null
            throw new Error(msg || 'Erreur sauvegarde D')
        }

        showSuccess.value = true
        setTimeout(() => (showSuccess.value = false), 2000)
        setTimeout(() => emit('next-step'), 300)
    } catch (err) {
        emit('error', err.message)
    }
}
</script>

<style scoped>
.table-responsive { width: 100%; overflow-x: auto; }
.sets-table { width: 100%; border-collapse: collapse; }
.sets-table th, .sets-table td { text-align: left; }
.sets-table td { vertical-align: top; padding: 10px 12px; }
.select-group { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.type-badge { font-size: 12px; padding: 2px 8px; border-radius: 9999px; background: #eef2ff; color: #1f2937; white-space: nowrap; border: 1px solid #e5e7eb; }
:root { --control-min: 180px; --control-ideal: 22vw; --control-max: 260px; }
.control-select { width: clamp(var(--control-min), var(--control-ideal), var(--control-max)); max-width: 100%; min-width: var(--control-min); display: inline-block; }
.alert-success { margin: 12px 0; padding: 10px 12px; border-radius: 10px; background: #ecfdf5; border: 1px solid #10b98133; color: #065f46; font-weight: 600; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 640px) {
    .select-group { flex-direction: column; align-items: stretch; gap: 6px; }
    .type-badge { margin-bottom: 2px; }
    .control-select { width: 100%; }
}
</style>
