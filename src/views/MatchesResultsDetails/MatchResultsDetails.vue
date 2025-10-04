<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePageContext } from '../../renderer/usePageContext.js'
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import MainPageTitle from '../../components/MainPageTitle/MainPageTitle.vue'
import { useAuthStore } from '../../../stores/auth.js'
import './MatchResultsDetails.css'

const auth = useAuthStore()
const pageContext = usePageContext()
const matchId = computed(() => Number(pageContext?.routeParams?.id))

const loading = ref(true)
const error = ref('')
const match = ref(null)
const sets = ref([])

// Totaux globaux (tous sets)
const totalHome = computed(() => sets.value.reduce((s, r) => s + (Number(r.home_points) || 0), 0))
const totalAway = computed(() => sets.value.reduce((s, r) => s + (Number(r.away_points) || 0), 0))

// Dictionnaire id => joueur pour chaque équipe
const homePlayersMap = ref(new Map())
const awayPlayersMap = ref(new Map())

function fmtDateTime(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return '' }
}
function labelOfSet(s) {
  // Affiche une étiquette lisible: ex: "Simple M1-M2" ou "Double D-M-J"
  const base = (s.set_type || '').toString().trim().toLowerCase()
  const id = s.match_identifier || ''
  if (base === 'double') return `Double ${id}`
  if (base === 'single' || base === '') return `Simple ${id}`
  return `${base} ${id}`
}
function namesFromIds(ids, map) {
  if (!Array.isArray(ids) || !ids.length) return '—'
  return ids
    .map(id => {
      const p = map.get(Number(id))
      return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : `#${id}`
    })
    .join(' / ')
}

// --- Classification en 3 catégories ---
// 1) Doubles: set_type === 'double' OU libellé commençant par "Double"
const doubles = computed(() =>
  sets.value.filter(s => {
    const type = (s.set_type || '').toString().toLowerCase()
    return type === 'double' || labelOfSet(s).toLowerCase().startsWith('double')
  })
)
// 2) Simples Féminins/Jeunes: set_type 'single' et match_identifier qui contient F ou J
const singlesFJ = computed(() =>
  sets.value.filter(s => {
    const type = (s.set_type || '').toString().toLowerCase()
    const id = (s.match_identifier || '').toString().toUpperCase()
    return (type === '' || type === 'single') && /F|J/.test(id)
  })
)
// 3) Simples Masculins: tous les autres simples
const singlesM = computed(() =>
  sets.value.filter(s => {
    const type = (s.set_type || '').toString().toLowerCase()
    const id = (s.match_identifier || '').toString().toUpperCase()
    return (type === '' || type === 'single') && !/F|J/.test(id)
  })
)

// Totaux par catégorie
function sumCat(list, side) {
  return list.reduce((acc, r) => acc + (Number(side === 'home' ? r.home_points : r.away_points) || 0), 0)
}
const totals = computed(() => ({
  doubles: { home: sumCat(doubles.value, 'home'), away: sumCat(doubles.value, 'away') },
  singlesFJ: { home: sumCat(singlesFJ.value, 'home'), away: sumCat(singlesFJ.value, 'away') },
  singlesM: { home: sumCat(singlesM.value, 'home'), away: sumCat(singlesM.value, 'away') }
}))

async function fetchTeamPlayers(teamId) {
  const res = await fetch(`https://ftmo.bob-digital.com/api/teams/${teamId}/`, {
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data?.players) ? data.players : []
}

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    if (!matchId.value || Number.isNaN(matchId.value)) {
      throw new Error('Identifiant de match invalide.')
    }
    const headers = { 'Content-Type': 'application/json' }

    // Match
    const resMatch = await fetch(`https://ftmo.bob-digital.com/api/matches/${matchId.value}/`, { headers })
    if (!resMatch.ok) throw new Error('Impossible de charger le match.')
    match.value = await resMatch.json()

    // Joueurs des 2 équipes
    const [homePlayers, awayPlayers] = await Promise.all([
      fetchTeamPlayers(match.value.home_team),
      fetchTeamPlayers(match.value.away_team)
    ])
    homePlayersMap.value = new Map(homePlayers.map(p => [Number(p.id), p]))
    awayPlayersMap.value = new Map(awayPlayers.map(p => [Number(p.id), p]))

    // Sets
    const resSets = await fetch(`https://ftmo.bob-digital.com/api/matchsets/?match=${matchId.value}`, { headers })
    sets.value = resSets.ok ? await resSets.json() : []
  } catch (e) {
    error.value = e?.message || 'Erreur inconnue.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <Header theme="light" :key="auth.renderKey" :alwaysBlack="true"/>
  <main class="match-details-page">
    <div class="matche-page-title-wrapper">
      <MainPageTitle
        :title="match ? `${match.home_team_name} vs ${match.away_team_name} ${ totalHome } - ${ totalAway }` : 'Détails du match'"
        :description="match ? fmtDateTime(match.scheduled_datetime) : ''"
      />
    </div>

    <div class="match-details-container">
      <div v-if="loading" class="loading">Chargement...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!match" class="error">Match introuvable.</div>

      <div v-else>
        <!-- Bloc 1: Doubles -->
        <section class="results-section">
          <h3 class="results-section__title">Doubles</h3>
          <table class="sets-table">
            <thead>
            <tr>
              <th>Épreuve</th>
              <th>Domicile (joueurs)</th>
              <th>Extérieur (joueurs)</th>
              <th class="col-score">Score</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="s in doubles" :key="`d-${s.id}`" class="row-set">
              <td>{{ labelOfSet(s) }}</td>
              <td>{{ namesFromIds(s.home_players, homePlayersMap) }}</td>
              <td>{{ namesFromIds(s.away_players, awayPlayersMap) }}</td>
              <td class="score"><strong>{{ Number(s.home_points) ?? 0 }} - {{ Number(s.away_points) ?? 0 }}</strong></td>
            </tr>
            <tr v-if="!doubles.length">
              <td class="empty" colspan="4">Aucun double</td>
            </tr>
            </tbody>
            <tfoot v-if="doubles.length">
            <tr class="total-row">
              <td>Total</td><td></td><td></td>
              <td class="score"><strong>{{ totals.doubles.home }} - {{ totals.doubles.away }}</strong></td>
            </tr>
            </tfoot>
          </table>
        </section>

        <!-- Bloc 2: Simples Féminins-Jeunes -->
        <section class="results-section">
          <h3 class="results-section__title">Simples Féminins-Jeunes</h3>
          <table class="sets-table">
            <thead>
            <tr>
              <th>Épreuve</th>
              <th>Domicile (joueurs)</th>
              <th>Extérieur (joueurs)</th>
              <th class="col-score">Score</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="s in singlesFJ" :key="`fj-${s.id}`" class="row-set">
              <td>{{ labelOfSet(s) }}</td>
              <td>{{ namesFromIds(s.home_players, homePlayersMap) }}</td>
              <td>{{ namesFromIds(s.away_players, awayPlayersMap) }}</td>
              <td class="score"><strong>{{ Number(s.home_points) ?? 0 }} - {{ Number(s.away_points) ?? 0 }}</strong></td>
            </tr>
            <tr v-if="!singlesFJ.length">
              <td class="empty" colspan="4">Aucun simple Féminin/Jeune</td>
            </tr>
            </tbody>
            <tfoot v-if="singlesFJ.length">
            <tr class="total-row">
              <td>Total</td><td></td><td></td>
              <td class="score"><strong>{{ totals.singlesFJ.home }} - {{ totals.singlesFJ.away }}</strong></td>
            </tr>
            </tfoot>
          </table>
        </section>

        <!-- Bloc 3: Simples Masculins -->
        <section class="results-section">
          <h3 class="results-section__title">Simples Masculins</h3>
          <table class="sets-table">
            <thead>
            <tr>
              <th>Épreuve</th>
              <th>Domicile (joueurs)</th>
              <th>Extérieur (joueurs)</th>
              <th class="col-score">Score</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="s in singlesM" :key="`sm-${s.id}`" class="row-set">
              <td>{{ labelOfSet(s) }}</td>
              <td>{{ namesFromIds(s.home_players, homePlayersMap) }}</td>
              <td>{{ namesFromIds(s.away_players, awayPlayersMap) }}</td>
              <td class="score"><strong>{{ Number(s.home_points) ?? 0 }} - {{ Number(s.away_points) ?? 0 }}</strong></td>
            </tr>
            <tr v-if="!singlesM.length">
              <td class="empty" colspan="4">Aucun simple Masculin</td>
            </tr>
            </tbody>
            <tfoot v-if="singlesM.length">
            <tr class="total-row">
              <td>Total</td><td></td><td></td>
              <td class="score"><strong>{{ totals.singlesM.home }} - {{ totals.singlesM.away }}</strong></td>
            </tr>
            </tfoot>
          </table>
        </section>

        <!-- Total général -->
        <section class="results-section results-section--global">
          <table class="sets-table">
            <tfoot v-if="sets.length">
            <tr class="total-row total-row--global">
              <td>Total général</td><td></td><td></td>
              <td class="score"><strong>{{ totalHome }} - {{ totalAway }}</strong></td>
            </tr>
            </tfoot>
          </table>
        </section>

        <div v-if="!sets.length" class="error no-sets">
          Aucun set saisi pour ce match.
        </div>
      </div>
    </div>
  </main>
  <Footer />
</template>