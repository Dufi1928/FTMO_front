<script setup>
import { onMounted, ref, computed } from 'vue'
import './AdminMatcheManager.css'
import MatchCard from "../../../../components/MatchCard/MatchCard.vue"
import MatchEditor from "../../../../components/MatchEditor/MatchEditor.vue"
import { Splide, SplideSlide } from "@splidejs/vue-splide"
import '@splidejs/vue-splide/css'

const matches = ref([])
const selectedMatch = ref(null)
const showEditor = ref(false)

function openMatchEditor(match) {
    selectedMatch.value = match
    showEditor.value = true
}

function formatDate(isoString) {
    return new Date(isoString).toLocaleString('fr-FR', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

function formaTtime(isoString) {
    return new Date(isoString).toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

async function fetchTeamMatches() {
    const token = localStorage.getItem('accessToken')
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/matches/my_team', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        if (!res.ok) throw new Error('Erreur lors du chargement des matchs')
        const data = await res.json()
        matches.value = data.matches
    } catch (err) {
        console.error(err.message)
    }
}

const upcomingMatches = computed(() =>
    matches.value
        .filter(m => new Date(m.scheduled_datetime) > new Date())
        .sort((a, b) => new Date(a.scheduled_datetime) - new Date(b.scheduled_datetime))
)

onMounted(() => {
    fetchTeamMatches()
})
</script>

<template>
    <div class="matches-page-wrapper">
        <transition name="slide-left" mode="out-in">
            <div v-if="!showEditor" key="match-list" class="matches-container">
                <h2 class="page-title">Matchs à venir</h2>
                <div class="city-slider-container">
                    <Splide
                        :options="{ perPage: 3, arrows: true, gap: '1rem', pagination: false, focus: 'left',trimSpace: true, perMove: 1, breakpoints: { 1124: { perPage: 2 }, 640: { perPage: 1 } } }">
                        <SplideSlide
                            v-for="(match, i) in upcomingMatches"
                            :key="i"
                        >
                            <MatchCard
                                :venue="match.home_team_name"
                                :showBtn="true"
                                :homeName="match.home_team_name"
                                :awayName="match.away_team_name"
                                :matchTime="formaTtime(match.scheduled_datetime)"
                                :matchDate="formatDate(match.scheduled_datetime)"
                                :onClickDetails="() => openMatchEditor(match)"
                                :homeLogo="`https://ftmo.bob-digital.com/media/${match.home_team_logo}`"
                                :awayLogo="`https://ftmo.bob-digital.com/media/${match.away_team_logo}`"
                            />
                        </SplideSlide>
                    </Splide>
                </div>
            </div>
        </transition>

        <!-- Le MatchEditor reste monté, s'affiche avec sa propre animation -->
        <MatchEditor
            v-if="showEditor"
            :match="selectedMatch"
            :is-home-team="selectedMatch.is_home_team"
            :visible="showEditor"
            @close="showEditor = false"
        />
    </div>
</template>









<!--        <h2>✅ Matchs joués</h2>-->
<!--        <ul v-if="playedMatches.length">-->
<!--            <li v-for="match in playedMatches" :key="match.id">-->
<!--                {{ match.home_team_name }} vs {{ match.away_team_name }} – {{ formatDate(match.scheduled_datetime) }}-->
<!--            </li>-->
<!--        </ul>-->
<!--        <p v-else>Aucun match joué.</p>-->

<!--        <h2>⏳ Matchs en attente de validation</h2>-->
<!--        <ul v-if="pendingValidationMatches.length">-->
<!--            <li v-for="match in pendingValidationMatches" :key="match.id">-->
<!--                {{ match.home_team_name }} vs {{ match.away_team_name }} – {{ formatDate(match.scheduled_datetime) }}-->
<!--            </li>-->
<!--        </ul>-->
<!--        <p v-else>Aucune validation en attente.</p>-->

<!--        <p v-else>Aucun match trouvé.</p>-->