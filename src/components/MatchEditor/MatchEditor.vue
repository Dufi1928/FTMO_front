
<script setup>
import { ref, onMounted } from 'vue'
import Step1MJ from '../Matches/Step1MJ/Step1MJ.vue'
import Step2M from '../Matches/Step2M/Step2M.vue'
// import Step3 from './Step3.vue'
import './MatchEditor.css'
const props = defineProps({ match: Object, visible: Boolean, isHomeTeam: Boolean })
const emit = defineEmits(['close'])

const step = ref(1)
const team1 = ref([])
const team2 = ref([])
const snackbarMessage = ref('')
const snackbarVisible = ref(false)
const snackbarType = ref('success')

async function fetchHomeTeam() {
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`https://ftmo.bob-digital.com/api/teams/my_team/`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
    if (!res.ok) throw new Error('Erreur récupération équipe')
    return (await res.json()).team.players
}
async function fetchAwayTeam(teamId) {
    const res = await fetch(`https://ftmo.bob-digital.com/api/teams/${teamId}/`, { headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) throw new Error('Erreur récupération équipe')
    return (await res.json()).players
}

onMounted(async () => {
    try {
        if (props.isHomeTeam) {
            team1.value = await fetchHomeTeam()
            team2.value = await fetchAwayTeam(props.match.away_team)
        } else {
            team1.value = await fetchAwayTeam(props.match.home_team)
            team2.value = await fetchHomeTeam()
        }
    } catch (err) {
        snackbarMessage.value = err.message
        snackbarType.value = 'error'
        snackbarVisible.value = true
        setTimeout(() => snackbarVisible.value = false, 3000)
    }
})

function nextStep() { if (step.value < 3) step.value++ }
function prevStep() { if (step.value > 1) step.value-- }
</script>

<template>
    <transition name="fade">
        <div v-if="snackbarVisible" class="snackbar" :class="snackbarType">
            {{ snackbarMessage }}
        </div>
    </transition>
    <transition name="slide-right">
        <div class="multi-step-form" v-if="visible">
            <div class="form-header">
                <button class="btn-secondary" @click="$emit('close')">Fermer</button>
                <h2 class="page-title">Étape {{ step }} sur 3</h2>
            </div>

            <Step1MJ
                v-if="step === 1"
                :team1="team1"
                :team2="team2"
                :matchId="match.id"
                @next-step="nextStep"
            />

            <Step2M
                v-else-if="step === 2"
                :team1="team1"
                :team2="team2"
                :matchId="match.id"
                @next-step="nextStep"
            />

<!--            <Step3-->
<!--                v-else-if="step === 3"-->
<!--            />-->

            <div class="btn-row">
                <button class="btn-secondary" @click="prevStep" v-if="step > 1">⬅ Retour</button>
                <button class="btn-primary" @click="nextStep" v-if="step < 3">Suivant ➔</button>
            </div>
        </div>
    </transition>
</template>


