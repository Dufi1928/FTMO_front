<!-- Step1MJ.vue -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import "./Step1MJ.css"

const props = defineProps({
    team1: Array,
    team2: Array,
    matchId: Number,
    isHomeTeam: { type: Boolean, default: false }
})
const emit = defineEmits(['next-step', 'error'])

const FORFAIT = 'FORFAIT'
const readOnly = computed(() => !Boolean(props.isHomeTeam))

const form = ref([
    { match_identifier: 'F-F', home_id: '', visitor_id: '', home_score: '', visitor_score: '' },
    { match_identifier: 'F-J', home_id: '', visitor_id: '', home_score: '', visitor_score: '' },
    { match_identifier: 'J-F', home_id: '', visitor_id: '', home_score: '', visitor_score: '' },
    { match_identifier: 'J-J', home_id: '', visitor_id: '', home_score: '', visitor_score: '' }
])

// --- utils
function findRowIndexByKey(key) { return form.value.findIndex(r => r.match_identifier === key) }
function homeRole(key) { return key.split('-')[0] } // 'F' ou 'J'
function awayRole(key) { return key.split('-')[1] } // 'F' ou 'J'

// Groupes de lignes par côté/role
const HOME_GROUPS = { F: ['F-F', 'F-J'], J: ['J-F', 'J-J'] }
const AWAY_GROUPS = { F: ['F-F', 'J-F'], J: ['F-J', 'J-J'] }

function otherRowKeyFor(side, key) {
    const role = side === 'home' ? homeRole(key) : awayRole(key)
    const group = side === 'home' ? HOME_GROUPS[role] : AWAY_GROUPS[role]
    if (!group) return null
    return group.find(k => k !== key) || null
}

// ====== Sélections & listes (Femme ou Jeune)
function isFemme(p) { return p?.civility === 'Mme' }
function isJeune(p) {
    if (!p?.birth_date) return false
    const refDate = new Date(new Date().getFullYear() - 15, 7, 31) // 31 août année(N-15)
    return new Date(p.birth_date) > refDate
}
const fullHome = computed(() => Array.isArray(props.team1) ? props.team1 : [])
const fullAway = computed(() => Array.isArray(props.team2) ? props.team2 : [])
const femmesJeunesHome = computed(() => fullHome.value.filter(p => isFemme(p) || isJeune(p)))
const femmesJeunesAway = computed(() => fullAway.value.filter(p => isFemme(p) || isJeune(p)))

// ====== Forfait helpers
function isForfaitHome(i)   { return form.value[i]?.home_id === FORFAIT }
function isForfaitAway(i)   { return form.value[i]?.visitor_id === FORFAIT }
function isForfaitRow(i)    { return isForfaitHome(i) || isForfaitAway(i) }
function isScore(n)         { return Number.isInteger(n) && n >= 0 && n <= 3 }

// ====== Totaux & validation
const totalHome = computed(() =>
    form.value.reduce((sum, s) => sum + (parseInt(s.home_score) || 0), 0)
)
const totalAway = computed(() =>
    form.value.reduce((sum, s) => sum + (parseInt(s.visitor_score) || 0), 0)
)

// Validation mise à jour :
// - si un côté est FORFAIT, seul le joueur du côté NON forfait est requis (pas d'exigence de score)
// - si aucun forfait, règles de score inchangées (3-n exclusif)
const isValid = computed(() =>
    form.value.every(s => {
        const homeF = s.home_id === FORFAIT
        const awayF = s.visitor_id === FORFAIT
        if (homeF && awayF) return false

        const h = s.home_id !== '' && s.home_id !== FORFAIT ? Number(s.home_id) : null
        const a = s.visitor_id !== '' && s.visitor_id !== FORFAIT ? Number(s.visitor_id) : null

        if (homeF) return Number.isInteger(a)
        if (awayF) return Number.isInteger(h)

        const scoresOk =
            isScore(s.home_score) &&
            isScore(s.visitor_score) &&
            ((s.home_score === 3 && s.visitor_score < 3) ||
                (s.visitor_score === 3 && s.home_score < 3))

        return Number.isInteger(h) && Number.isInteger(a) && scoresOk
    })
)

// ====== Sets existants + détection forfait (restée compatible)
async function fetchExistingSets() {
    const token = localStorage.getItem('accessToken')
    try {
        const res = await fetch(`https://ftmo.bob-digital.com/api/matchsets/?match=${props.matchId}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        })
        if (res.status === 401 || res.status === 403) throw new Error('Non autorisé : token manquant/expiré ou droits insuffisants')
        if (!res.ok) throw new Error('Erreur récupération des sets existants')
        return await res.json()
    } catch (e) {
        emit('error', e.message)
        return []
    }
}

// Ne rien modifier automatiquement quand un forfait est choisi (no-op)
function normalizeForfait(i) {
    const r = form.value[i]
    const homeF = r.home_id === FORFAIT
    const awayF = r.visitor_id === FORFAIT
    if (homeF && !awayF) { r.home_score = 0; r.visitor_score = 3 }
    else if (awayF && !homeF) { r.home_score = 3; r.visitor_score = 0 }
}

// Déduire un forfait depuis l'existant seulement si motif 0-3 / 3-0 et aucun joueur
function detectForfaitFromExisting(i) {
    const r = form.value[i]
    if (!r) return
    const hEmpty = (r.home_id === '')
    const aEmpty = (r.visitor_id === '')
    if (hEmpty && aEmpty && isScore(r.home_score) && isScore(r.visitor_score)) {
        if (r.home_score === 0 && r.visitor_score === 3) {
            r.home_id = FORFAIT
        } else if (r.home_score === 3 && r.visitor_score === 0) {
            r.visitor_id = FORFAIT
        }
        normalizeForfait(i)
    }
}

onMounted(async () => {
    const sets = await fetchExistingSets()
    sets.forEach(set => {
        const idx = form.value.findIndex(f => f.match_identifier === set.match_identifier)
        if (idx === -1) return
        const home = Array.isArray(set.home_players) ? set.home_players[0] : set.home_player
        const away = Array.isArray(set.away_players) ? set.away_players[0] : set.away_player
        form.value[idx].home_id       = home != null ? String(home) : ''
        form.value[idx].visitor_id    = away != null ? String(away) : ''
        form.value[idx].home_score    = set.home_points === '' ? '' : Number(set.home_points)
        form.value[idx].visitor_score = set.away_points  === '' ? '' : Number(set.away_points)

        detectForfaitFromExisting(idx)
    })
})

// ====== Miroir des scores exclusifs (ignore les lignes forfait)
watch(
    () => form.value.map(r => ({ h: r.home_score, v: r.visitor_score })),
    (newVals, oldVals = []) => {
        if (readOnly.value) return
        newVals.forEach((val, i) => {
            if (isForfaitRow(i)) return
            const prev  = oldVals[i] || { h: '', v: '' }
            const hCur  = val.h === '' ? '' : Number(val.h)
            const hPrev = prev.h === '' ? '' : Number(prev.h)
            const vCur  = val.v === '' ? '' : Number(val.v)
            const vPrev = prev.v === '' ? '' : Number(prev.v)

            if (hCur !== hPrev) {
                if (hCur !== '' && hCur !== 3) form.value[i].visitor_score = 3
                else if (hCur === 3 && Number(form.value[i].visitor_score) === 3) form.value[i].visitor_score = ''
            }
            if (vCur !== vPrev) {
                if (vCur !== '' && vCur !== 3) form.value[i].home_score = 3
                else if (vCur === 3 && Number(form.value[i].home_score) === 3) form.value[i].home_score = ''
            }
        })
    },
    { deep: true }
)

// ====== Auto copie EXACTE sur la ligne sœur (même côté & même rôle F/J)
function onChangeHomePlayer(i, val) {
    const row = form.value[i]
    if (!row || readOnly.value) return

    row.home_id = val // '' | id string | FORFAIT
    normalizeForfait(i)

    // copie sur la ligne sœur uniquement si id valide (pas '' ni FORFAIT)
    if (row.home_id !== '' && row.home_id !== FORFAIT) {
        const key = row.match_identifier
        const sisterKey = otherRowKeyFor('home', key)
        if (sisterKey) {
            const j = findRowIndexByKey(sisterKey)
            if (j !== -1 && form.value[j].home_id === '') {
                form.value[j].home_id = row.home_id
            }
        }
    }
}

function onChangeAwayPlayer(i, val) {
    const row = form.value[i]
    if (!row || readOnly.value) return

    row.visitor_id = val // '' | id string | FORFAIT
    normalizeForfait(i)

    if (row.visitor_id !== '' && row.visitor_id !== FORFAIT) {
        const key = row.match_identifier
        const sisterKey = otherRowKeyFor('away', key)
        if (sisterKey) {
            const j = findRowIndexByKey(sisterKey)
            if (j !== -1 && form.value[j].visitor_id === '') {
                form.value[j].visitor_id = row.visitor_id
            }
        }
    }
}

// ====== Sauvegarde (aucune auto-modif des scores en cas de forfait)
async function saveSets() {
    if (readOnly.value) return

    const payload = form.value.map(s => {
        const homeF = s.home_id === FORFAIT
        const awayF = s.visitor_id === FORFAIT

        if (homeF && awayF) {
            throw new Error('Les deux équipes ne peuvent pas être forfait en même temps.')
        }

        const h = s.home_id !== '' && s.home_id !== FORFAIT ? Number(s.home_id) : null
        const a = s.visitor_id !== '' && s.visitor_id !== FORFAIT ? Number(s.visitor_id) : null

        // Exiger un joueur uniquement du côté non-forfait
        if (!homeF && !Number.isInteger(h)) {
            throw new Error('Sélectionne un joueur côté domicile (sauf si domicile est forfait).')
        }
        if (!awayF && !Number.isInteger(a)) {
            throw new Error('Sélectionne un joueur côté extérieur (sauf si extérieur est forfait).')
        }

        return {
            match: props.matchId,
            set_type: 'single',
            match_identifier: s.match_identifier,
            home_players: homeF ? [] : [h],
            away_players: awayF ? [] : [a],
            // Ne pas toucher aux scores : envoyer tels quels ('' -> null)
            home_points: s.home_score === '' ? null : Number(s.home_score),
            away_points: s.visitor_score === '' ? null : Number(s.visitor_score)
        }
    })

    try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`https://ftmo.bob-digital.com/api/matchsets/bulk_create/`, {
            method: 'POST',
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
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
    <div class="table-responsive" :class="{ 'read-only': readOnly }">
        <table class="sets-table">
            <thead>
            <tr><th>Catégorie</th><th>Dom.</th><th>Ext.</th><th>Score D</th><th>Score E</th></tr>
            </thead>
            <tbody>
            <tr v-for="(s, i) in form" :key="s.match_identifier">
                <td>{{ s.match_identifier }}</td>

                <!-- DOMICILE -->
                <td>
                    <select
                        :value="form[i].home_id"
                        @change="onChangeHomePlayer(i, $event.target.value)"
                        :disabled="readOnly"
                    >
                        <option value="">Sélectionner</option>
                        <option v-for="p in femmesJeunesHome" :key="p.id" :value="String(p.id)">
                            {{ p.first_name }} {{ p.last_name }}
                        </option>
                        <option :value="FORFAIT">Forfait</option>
                    </select>
                </td>

                <!-- EXTERIEUR -->
                <td>
                    <select
                        :value="form[i].visitor_id"
                        @change="onChangeAwayPlayer(i, $event.target.value)"
                        :disabled="readOnly"
                    >
                        <option value="">Sélectionner</option>
                        <option v-for="p in femmesJeunesAway" :key="p.id" :value="String(p.id)">
                            {{ p.first_name }} {{ p.last_name }}
                        </option>
                        <option :value="FORFAIT">Forfait</option>
                    </select>
                </td>

                <!-- SCORES (bloqués si forfait) -->
                <td>
                    <select
                        :value="form[i].home_score"
                        @change="form[i].home_score = $event.target.value === '' ? '' : Number($event.target.value)"
                        :disabled="readOnly"
                    >
                        <option value="">-</option>
                        <option v-for="n in [0,1,2,3]" :key="`h${n}`" :value="n">{{ n }}</option>
                    </select>
                </td>
                <td>
                    <select
                        :value="form[i].visitor_score"
                        @change="form[i].visitor_score = $event.target.value === '' ? '' : Number($event.target.value)"
                        :disabled="readOnly"
                    >
                        <option value="">-</option>
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

    <button
        v-if="!readOnly"
        class="btn-primary save"
        @click="saveSets"
        :disabled="!isValid"
    >
        Sauvegarder
    </button>
</template>
