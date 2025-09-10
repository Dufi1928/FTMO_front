<script setup>
import {ref, computed, onMounted} from 'vue'
import Header from '../../components/Header/Header.vue'
import {useAuthStore} from '../../../stores/auth.js'
import SectionHeader from '../../components/SectionHeader/SectionHeader.vue'
import CityCircle from '../../components/CityCircle/CityCircle.vue'
import './home.css'
import '@splidejs/vue-splide/css'
import {Splide, SplideSlide} from '@splidejs/vue-splide'
import MatchCard from "../../components/MatchCard/MatchCard.vue";
import Footer from "../../components/Footer/Footer.vue";
import MapClubsByPosition from "../../components/MapClubsByPosition/MapClubsByPosition.vue";


const auth = useAuthStore()
const cities = ref([])
const loading = ref(true)
const errorMsg = ref('')
const matches = ref([])
const ranking = ref([])

async function fetchAllMatches() {
    loading.value = true
    errorMsg.value = ''
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        const headers = {
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            'Content-Type': 'application/json',
        }

        let res = await fetch('https://ftmo.bob-digital.com/api/matches', {headers})
        if (!res.ok) res = await fetch('https://ftmo.bob-digital.com/api/matches/', {headers})
        if (!res.ok) throw new Error('Impossible de charger les matchs.')

        const data = await res.json()
        matches.value = Array.isArray(data) ? data : []
    } catch (e) {
        errorMsg.value = e?.message || 'Erreur inconnue.'
    } finally {
        loading.value = false
    }
}
function buildRankingFromTeams(teams) {
    const rows = teams.map((t) => {
        const wonSets  = Number(t.total_points_scored)   || 0      // sets gagnés
        const lostSets = Number(t.total_points_conceded) || 0      // sets perdus
        const diff     = wonSets - lostSets

        // Hypothèse de calcul des "Points" de classement :
        // 2 pts par match gagné + 1 par match nul (ajuste si ta règle est différente)
        const points = (Number(t.matches_won) || 0) * 2 + (Number(t.matches_drawn) || 0)

        // Numéro d’équipe : adapte selon ta donnée (ici on met 1 par défaut)
        const teamNo = t.team_admin ?? 1

        return {
            club: t.club_name,
            teamNo,
            points,
            won: wonSets,
            lost: lostSets,
            diff
        }
    })
    // tri du plus grand nombre de sets gagnés au plus petit
    rows.sort((a, b) => b.won - a.won)
    // attribution des rangs
    rows.forEach((r, i) => (r.rank = i + 1))
    ranking.value = rows
}



onMounted(async () => {
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/')
        const data = await res.json()
        // alimente le slider des clubs
        cities.value = data.map(team => ({
            name: team.club_name,
            image: team.image || 'src/assets/images/deulemont1.jpeg',
            slug: team.id,
        }))

        // construit le ranking à partir de l’API
        buildRankingFromTeams(data)
    } catch (err) {
        console.error('Erreur de chargement des clubs:', err)
    }

    fetchAllMatches()
})


const fmtDateHeader = (iso) =>
    new Date(iso).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
const sortedMatches = computed(() =>
    [...matches.value].sort(
        (a, b) => new Date(a.scheduled_datetime) - new Date(b.scheduled_datetime)
    )
)
// Prochaines rencontres uniquement
const upcomingMatches = computed(() => {
    const now = Date.now()
    return sortedMatches.value.filter(m => new Date(m.scheduled_datetime).getTime() >= now)
    // .slice(0, 10) // ← décommente si tu veux limiter le slider à 10 items
})

</script>


<template>
    <Header :key="auth.renderKey"/>
    <div class="hero-banner">
        <div class="hero-content-container">
            <div class="hero-content">
                <h1 class="hero-content-title">Le Tennis de table dans
                    la Métropole Lilloise</h1>
                <a class="hero-content-cta" href="#">Découvrez nos clubs</a>
            </div>
        </div>
    </div>

    <div class="our-history-container">
        <div class="our-history-content">
            <h2 class="our-history-content-title">Notre histoire, notre force</h2>
            <p class="our-history-content-content">
                La Fédération de Tennis de Table de la Métropole Lilloise (FTMO) rassemble les clubs de tennis de table
                de Lille et de ses environs. Depuis plus de 50 ans, nous œuvrons pour développer ce sport, former les
                jeunes talents et organiser des compétitions de qualité.
            </p>
            <p class="our-history-content-content">
                Notre mission est de promouvoir les valeurs sportives, l'esprit d'équipe et la pratique du tennis de
                table pour tous, quel que soit l'âge ou le niveau.
            </p>
<!--            <a href="" class="our-history-content-content-cta">En savoir plus</a>-->
        </div>
    </div>
    <div class="images-grid-container">
        <img src="../../assets/images/grid.jpg" alt="">
    </div>
    <div class="clubs-container">
        <SectionHeader
            background='#F9F9F9'
            title="Les clubs près de chez vous"
            linkText="Tous les clubs"
            linkUrl="/clubs"
        />
        <div class="city-slider-container">
            <Splide
                :options="{ perPage: 4, arrows: true, gap: '1rem', pagination: false, focus: 'left',trimSpace: true, perMove: 1, breakpoints: { 1024: { perPage: 2 }, 640: { perPage: 1 } } }">
                <SplideSlide v-for="(city, i) in cities" :key="i">
                    <CityCircle :image="city.image" :name="city.name" :slug="city.slug"/>
                </SplideSlide>
            </Splide>
        </div>
    </div>
    <SectionHeader
        background=""
        title="Les prochaines rencontres"
        linkText="Toutes les rencontres"
        linkUrl="/schedule"
    />

    <div class="city-slider-container" style="background: white">
        <Splide
            :options="{
             perPage: 3,
             arrows: true,
             gap: '1rem',
             pagination: false,
             focus: 'left',
             trimSpace: true,
             perMove: 1,
             breakpoints: { 1124: { perPage: 2 }, 640: { perPage: 1 } }
           }"
        >
            <SplideSlide v-for="match in upcomingMatches" :key="match.id">
                <MatchCard
                    :home-name="match.home_team_name"
                    :away-name="match.away_team_name"
                    :home-logo="match.home_team_logo ? `https://ftmo.bob-digital.com/media/${match.home_team_logo}` : ''"
                    :away-logo="match.away_team_logo ? `https://ftmo.bob-digital.com/media/${match.away_team_logo}` : ''"
                    :match-date="fmtDateHeader(match.scheduled_datetime)"
                    :match-time="fmtTime(match.scheduled_datetime)"
                    :venue="match.home_team_name"
                    :show-btn="false"
                />
            </SplideSlide>
        </Splide>
    </div>

    <div class="ranking-table-container">
        <SectionHeader
            background="#F9F9F9"
            title="Classement des Équipes"
            linkText="Voir le classement complet"
            linkUrl="/clubs"
        />

        <div class="ranking-table-wrapper" id="rank-scroll">
            <!-- table fixe (colonne Club) -->
            <div class="rank-pinned">
                <table class="ranking-table ranking-left">
                    <thead>
                    <tr>
                        <th>Club</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="row in ranking" :key="row.rank">
                        <td>{{ row.club }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- table scrollable -->
            <div class="rank-scroll">
                <table class="ranking-table ranking-main">
                    <thead>
                    <tr>
                        <th>Classement</th>
                        <th>Sets gagnés</th>
                        <th>Sets perdus</th>
                        <th>Différence</th>
                    </tr>
                    </thead>

                    <tbody>
                    <tr v-for="row in ranking" :key="row.rank">
                        <td>
            <span class="rank-badge"
                  :class="{ gold:row.rank===1, silver:row.rank===2, bronze:row.rank===3 }">
              {{ row.rank }}
            </span>
                        </td>
                        <td class="won">{{ row.won }}</td>
                        <td class="lost">{{ row.lost }}</td>
                        <td :class="{ positive:row.diff>0, negative:row.diff<0 }">
                            {{ row.diff > 0 ? '+' + row.diff : row.diff }}
                        </td>
                    </tr>
                    </tbody>

                </table>
            </div>
        </div>
    </div>

    <template>
        <div class="map-container-home h-screen">
            <MapClubsByPosition :show-filters="false" />
        </div>
    </template>
    <Footer/>


</template>

