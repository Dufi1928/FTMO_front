<!-- Step3D.vue -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import './Step3D.css'

const props = defineProps({
    team1: Array,
    team2: Array,
    matchId: Number,
    // 'home' => validation_status_home, 'away' => validation_status_away
    validateSide: {
        type: String,
        default: 'home',
        validator: v => ['home', 'away'].includes(v)
    }
})

const emit = defineEmits(['next-step', 'error'])

const FORFAIT = 'FORFAIT'
const showSuccess = ref(false)
const showValidated = ref(false)

const form = ref([
    { match_identifier: 'D-M-M',   home_ids: [null, null], visitor_ids: [null, null], home_score: null, visitor_score: null },
    { match_identifier: 'D-M-M-2', home_ids: [null, null], visitor_ids: [null, null], home_score: null, visitor_score: null },
    { match_identifier: 'D-M-J',   home_ids: [null, null], visitor_ids: [null, null], home_score: null, visitor_score: null },
    { match_identifier: 'D-M-F',   home_ids: [null, null], visitor_ids: [null, null], home_score: null, visitor_score: null },
    { match_identifier: 'D-F-J',   home_ids: [null, null], visitor_ids: [null, null], home_score: null, visitor_score: null }
])

/* ---------- Badges (affichage) ---------- */
function requiredType () { return 'Joueur' }

/* ---------- Options : non filtrées ---------- */
function homeOptionsFor () { return Array.isArray(props.team1) ? props.team1 : [] }
function awayOptionsFor () { return Array.isArray(props.team2) ? props.team2 : [] }

/* ---------- Helpers ---------- */
function includesForfait(arr) {
    return Array.isArray(arr) && arr.some(v => v === FORFAIT)
}
function isForfaitHome (i) { return includesForfait(form.value[i]?.home_ids) }
function isForfaitAway (i) { return includesForfait(form.value[i]?.visitor_ids) }
/** Sert uniquement à désactiver les scores, pas les selects joueurs */
function isForfaitRow (i) { return isForfaitHome(i) || isForfaitAway(i) }

const toInt = (v) => {
    const n = Number(v?.id ?? v)
    return Number.isInteger(n) ? n : null
}
/** Convertit une paire potentiellement mixte (string/number/null) en entiers valides */
const toPair = (arr) => Array.isArray(arr)
    ? arr.map(v => Number(v)).filter(n => Number.isInteger(n))
    : []

/* ---------- Sélection joueurs & FORFAIT ---------- */
function onChangePlayers (i) {
    const row = form.value[i]
    if (!row) return

    // Normalise une paire en gérant correctement l'entrée/sortie du mode FORFAIT
    const fix = (ids) => {
        const arr = Array.isArray(ids) ? ids.slice(0, 2) : [null, null]
        const hasForfait = arr.includes(FORFAIT)
        const hasReal = arr.some(v => v != null && v !== FORFAIT)

        // Si l'utilisateur choisit au moins un joueur alors qu'il y avait FORFAIT -> on sort du mode FORFAIT
        if (hasForfait && hasReal) {
            return arr.map(v => (v === FORFAIT ? null : v))
        }
        // Si FORFAIT présent et aucun joueur choisi -> binôme FORFAIT
        if (hasForfait) return [FORFAIT, FORFAIT]

        // Sinon, on nettoie juste d'éventuels restes de FORFAIT
        return arr.map(v => (v === FORFAIT ? null : v))
    }

    row.home_ids = fix(row.home_ids)
    row.visitor_ids = fix(row.visitor_ids)

    normalizeForfait(i)
}

/** Ne modifie plus automatiquement les scores en cas de FORFAIT (no-op) */
function normalizeForfait (i) {
    const r = form.value[i]
    const homeF = includesForfait(r.home_ids)
    const awayF = includesForfait(r.visitor_ids)
    if (homeF && !awayF) { r.home_score = 0; r.visitor_score = 3 }
    else if (awayF && !homeF) { r.home_score = 3; r.visitor_score = 0 }
}

/* ---------- Totaux ---------- */
const totalHome = computed(() =>
    form.value.reduce((sum, s) => sum + (parseInt(s.home_score) || 0), 0)
)
const totalAway = computed(() =>
    form.value.reduce((sum, s) => sum + (parseInt(s.visitor_score) || 0), 0)
)

/* ---------- Validation ---------- */
const isScore = (n) => Number.isInteger(n) && n >= 0 && n <= 3

// Règles :
// - double forfait interdit
// - si un côté est FORFAIT : seul le côté NON forfait doit avoir exactement 2 joueurs distincts (scores libres)
// - sinon : 2 joueurs distincts de chaque côté + score exclusif (3-n)
const isValid = computed(() =>
    form.value.every((s) => {
        const homeF = includesForfait(s.home_ids)
        const awayF = includesForfait(s.visitor_ids)
        if (homeF && awayF) return false

        const home = toPair(s.home_ids)
        const away = toPair(s.visitor_ids)

        if (homeF) {
            return away.length === 2 && new Set(away).size === 2
        }
        if (awayF) {
            return home.length === 2 && new Set(home).size === 2
        }

        const bothFilled = home.length === 2 && away.length === 2
        const noDupTeam = new Set(home).size === 2 && new Set(away).size === 2
        const scoresOk =
            isScore(s.home_score) &&
            isScore(s.visitor_score) &&
            ((s.home_score === 3 && s.visitor_score < 3) ||
                (s.visitor_score === 3 && s.home_score < 3))

        return bothFilled && noDupTeam && scoresOk
    })
)

/* ---------- Récup existants ---------- */
async function fetchExistingSets () {
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

function asPair (raw) {
    const arr = Array.isArray(raw) ? raw : []
    const a = toInt(arr[0])
    const b = toInt(arr[1])
    return [a, b]
}

// Déduire un forfait depuis un set récupéré: score présent + aucun joueur
function detectForfaitFromExisting (i) {
    const r = form.value[i]
    if (!r) return
    const hEmpty = (r.home_ids?.[0] == null && r.home_ids?.[1] == null)
    const aEmpty = (r.visitor_ids?.[0] == null && r.visitor_ids?.[1] == null)
    if (hEmpty && aEmpty && isScore(r.home_score) && isScore(r.visitor_score)) {
        if (r.home_score === 0 && r.visitor_score === 3) {
            r.home_ids = [FORFAIT, FORFAIT]
        } else if (r.home_score === 3 && r.visitor_score === 0) {
            r.visitor_ids = [FORFAIT, FORFAIT]
        }
        normalizeForfait(i)
    }
}

onMounted(async () => {
    const sets = await fetchExistingSets()
    sets.forEach(set => {
        const idx = form.value.findIndex(f => f.match_identifier === set.match_identifier)
        if (idx === -1) return

        const [h0, h1] = asPair(set.home_players)
        const [a0, a1] = asPair(set.away_players)

        form.value[idx].home_ids = [h0, h1]
        form.value[idx].visitor_ids = [a0, a1]
        form.value[idx].home_score = Number(set.home_points)
        form.value[idx].visitor_score = Number(set.away_points)

        // Si on a un score mais aucun joueur, déduire le forfait
        detectForfaitFromExisting(idx)
    })
})

/* ---------- Auto-règles de score (inchangées hors forfait) ---------- */
watch(
    () => form.value.map(r => ({ h: r.home_score, v: r.visitor_score })),
    (newVals, oldVals) => {
        newVals.forEach((val, i) => {
            // Ne pas appliquer les règles auto si forfait
            if (isForfaitRow(i)) return

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

/* ---------- SAVE ---------- */
const formatErrors = (errs) => errs.map(e => `#${e.index}: ${JSON.stringify(e.error)}`).join('\n')

async function saveSets () {
    const payload = form.value.map(s => {
        const homeF = includesForfait(s.home_ids)
        const awayF = includesForfait(s.visitor_ids)

        if (homeF && awayF) {
            throw new Error('Les deux équipes ne peuvent pas être forfait en même temps.')
        }

        const home = toPair(s.home_ids)
        const away = toPair(s.visitor_ids)

        if (homeF) {
            if (away.length !== 2 || new Set(away).size !== 2) {
                throw new Error('Le côté non forfait doit avoir exactement 2 joueurs distincts.')
            }
            return {
                match: props.matchId,
                set_type: 'double',
                match_identifier: s.match_identifier,
                home_players: [],       // côté forfait
                away_players: away,     // côté non forfait
                // On n’altère pas les scores : on envoie tels quels
                home_points: s.home_score,
                away_points: s.visitor_score
            }
        }

        if (awayF) {
            if (home.length !== 2 || new Set(home).size !== 2) {
                throw new Error('Le côté non forfait doit avoir exactement 2 joueurs distincts.')
            }
            return {
                match: props.matchId,
                set_type: 'double',
                match_identifier: s.match_identifier,
                home_players: home,     // côté non forfait
                away_players: [],       // côté forfait
                home_points: s.home_score,
                away_points: s.visitor_score
            }
        }

        if (home.length !== 2 || away.length !== 2) {
            throw new Error('Chaque double doit avoir exactement 2 joueurs sélectionnés par équipe.')
        }
        if ((new Set(home).size !== 2) || (new Set(away).size !== 2)) {
            throw new Error('Un joueur ne peut pas être sélectionné deux fois dans la même paire.')
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

        const doValidate = window.confirm('Les scores ont été enregistrés. Voulez-vous valider le match maintenant ?')
        if (doValidate) {
            try {
                await validateMatch()
                showValidated.value = true
                setTimeout(() => (showValidated.value = false), 2000)
            } catch (e) {
                emit('error', `Match enregistré, mais la validation a échoué : ${e.message}`)
            }
        }
        emit('next-step')
    } catch (err) {
        emit('error', err.message)
    }
}

/* -------- Validation du match -------- */
async function validateMatch () {
    const token = localStorage.getItem('accessToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const body =
        props.validateSide === 'home'
            ? { validation_status_home: true }
            : { validation_status_away: true }

    const res = await fetch(`https://ftmo.bob-digital.com/api/matches/${props.matchId}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body)
    })
    if (!res.ok) {
        let msg = 'Erreur validation'
        try {
            const d = await res.json()
            msg = d?.detail || msg
        } catch {}
        throw new Error(msg)
    }
}
</script>

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
                        <select
                            class="control-select"
                            v-model="form[i].home_ids[0]"
                            @change="onChangePlayers(i)"
                        >
                            <option :value="null">Sélectionner</option>
                            <option v-for="p in homeOptionsFor(i, 0)" :key="p.id" :value="String(p.id)">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                            <option :value="FORFAIT">Forfait</option>
                        </select>
                    </div>
                    <div class="select-group">
                        <span class="type-badge">{{ requiredType(s.match_identifier, 1) }}</span>
                        <select
                            class="control-select"
                            v-model="form[i].home_ids[1]"
                            @change="onChangePlayers(i)"
                        >
                            <option :value="null">Sélectionner</option>
                            <option v-for="p in homeOptionsFor(i, 1)" :key="p.id" :value="String(p.id)">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                            <option :value="FORFAIT">Forfait</option>
                        </select>
                    </div>
                </td>

                <!-- EXTERIEUR -->
                <td>
                    <div class="select-group">
                        <span class="type-badge">{{ requiredType(s.match_identifier, 0) }}</span>
                        <select
                            class="control-select"
                            v-model="form[i].visitor_ids[0]"
                            @change="onChangePlayers(i)"
                        >
                            <option :value="null">Sélectionner</option>
                            <option v-for="p in awayOptionsFor(i, 0)" :key="p.id" :value="String(p.id)">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                            <option :value="FORFAIT">Forfait</option>
                        </select>
                    </div>
                    <div class="select-group">
                        <span class="type-badge">{{ requiredType(s.match_identifier, 1) }}</span>
                        <select
                            class="control-select"
                            v-model="form[i].visitor_ids[1]"
                            @change="onChangePlayers(i)"
                        >
                            <option :value="null">Sélectionner</option>
                            <option v-for="p in awayOptionsFor(i, 1)" :key="p.id" :value="String(p.id)">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                            <option :value="FORFAIT">Forfait</option>
                        </select>
                    </div>
                </td>

                <!-- SCORES (bloqués si forfait) -->
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

    <!-- Message de validation -->
    <transition name="fade">
        <div v-if="showValidated" class="alert-success" role="status" aria-live="polite">
            ✅ Match validé
        </div>
    </transition>

    <button class="btn-primary save" @click="saveSets" :disabled="!isValid">Valider</button>
</template>
