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
const sliderOptions = {
    perPage: 3,
    arrows: true,
    gap: '1rem',
    pagination: false,
    focus: 'left',
    trimSpace: true,
    perMove: 1,
    breakpoints: { 1124: { perPage: 2 }, 640: { perPage: 1 } }
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

const pendingMatches = computed(() =>
    matches.value
        .filter(m =>
            !m.is_home_team &&
            m.validation_status_home === true &&
            m.validation_status_away === false
        )
        .sort((a, b) =>
            new Date(a.scheduled_datetime) - new Date(b.scheduled_datetime)
        )
)

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
                <!-- SECTION 1 : Matchs à venir -->
                <h2 class="page-title">Matchs à venir</h2>
                <div class="city-slider-container">
                    <Splide :options="sliderOptions">
                        <SplideSlide
                            v-for="match in upcomingMatches"
                            :key="match.id"
                        >
                            <MatchCard
                                :venue="match.home_team_name"
                                :showBtn="true"
                                :homeName="match.home_team_name"
                                :awayName="match.away_team_name"
                                :matchTime="formaTtime(match.scheduled_datetime)"
                                :matchDate="formatDate(match.scheduled_datetime)"
                                @click="() => openMatchEditor(match)"
                                :homeLogo="`https://ftmo.bob-digital.com/media/${match.home_team_logo}`"
                                :awayLogo="`https://ftmo.bob-digital.com/media/${match.away_team_logo}`"
                            />
                        </SplideSlide>
                    </Splide>
                </div>

                <!-- SECTION 2 : Matchs en attente de validation -->
                <h2 class="page-title">Matchs en attente de validation</h2>
                <div class="city-slider-container">
                    <Splide :options="sliderOptions">
                        <SplideSlide
                            v-for="match in pendingMatches"
                            :key="match.id"
                        >
                            <MatchCard
                                :venue="match.home_team_name"
                                :showBtn="true"
                                :buttonMessage = "Verifier"
                                :homeName="match.home_team_name"
                                :awayName="match.away_team_name"
                                :matchTime="formaTtime(match.scheduled_datetime)"
                                :matchDate="formatDate(match.scheduled_datetime)"
                                @click="() => openMatchEditor(match)"
                                :homeLogo="`https://ftmo.bob-digital.com/media/${match.home_team_logo}`"
                                :awayLogo="`https://ftmo.bob-digital.com/media/${match.away_team_logo}`"
                            />
                        </SplideSlide>
                    </Splide>
                </div>
            </div>
        </transition>

        <MatchEditor
            v-if="showEditor"
            :match="selectedMatch"
            :is-home-team="selectedMatch.is_home_team"
            :visible="showEditor"
            @close="showEditor = false"
        />
    </div>
</template>











