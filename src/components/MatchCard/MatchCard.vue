<script setup>
import './MatchCard.css'

/* ─── Déclaration des props ─────────────────────────────────────────────── */
defineProps({
    /* Équipe à domicile */
    homeName: {type: String, required: true},
    homeLogo: {type: String, required: true}, // url ou chemin de l’image

    /* Équipe visiteuse */
    awayName: {type: String, required: true},
    awayLogo: {type: String, required: true},

    /* Infos match */
    matchDate: {type: String, required: true}, // ex. "2025-04-23"
    matchTime: {type: String, required: true}, // ex. "14h30"
    venue: {type: String, required: true}, // ex. "Salle Victor Hugo, Lille"

    /* Lien “Détails du match” */
    detailsUrl: {type: String, required: true},

    /* Optionnel : couleur de fond du header (haut violet clair sur la maquette) */
    headerBg: {type: String, default: '#F4F4FF'}
})
</script>

<template>
    <div class="match-card">
        <!-- En-tête avec les équipes -->
        <div class="match-card__header" :style="{ backgroundColor: headerBg }">
            <div class="team">
                <div class="img-container">
                    <img :src="homeLogo" :alt="homeName"/>
                </div>
                <span class="team-name">{{ homeName }}</span>
            </div>

            <span class="vs">VS</span>

            <div class="team">
                <div class="img-container">
                    <img :src="awayLogo" :alt="awayName"/>
                </div>
                <span class="team-name">{{ awayName }}</span>
            </div>
        </div>

        <!-- Infos pratiques -->
        <div class="match-card__body">
                <div>
                    <div class="match-card__body--item-wraper">
                        <img src="../../assets/icons/match_calender.svg" alt="">
                        <i class="icon icon-date"/> {{ matchDate }}
                    </div>
                    <div class="match-card__body--item-wraper">
                        <img src="../../assets/icons/match_time.svg" alt="">
                        <i class="icon icon-time"/> {{ matchTime }}
                    </div>
                    <div class="match-card__body--item-wraper">
                        <img src="../../assets/icons/match_place.svg" alt="">
                        <i class="icon icon-location"/> {{ venue }}
                    </div>
                </div>

            <a :href="detailsUrl" class="btn-details">Détails du match</a>
        </div>
    </div>
</template>
