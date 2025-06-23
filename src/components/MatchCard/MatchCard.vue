<script setup>
import './MatchCard.css'

defineProps({
    homeName: { type: String, required: true },
    buttonMessage: { type: String, required: false, default: "Détails du match" },
    showBtn: { type: Boolean, required: true },
    homeLogo: { type: String, required: true },
    awayName: { type: String, required: true },
    awayLogo: { type: String, required: true },
    matchDate: { type: String, required: true },
    matchTime: { type: String, required: true },
    venue: { type: String, required: true },
    detailsUrl: { type: String, required: false },
    onClickDetails: { type: Function, required: false },
    headerBg: { type: String, default: '#F4F4FF' }
})
</script>

<template>
    <div class="match-card">
        <div class="match-card__header" :style="{ backgroundColor: headerBg }">
            <div class="team">
                <div class="img-container">
                    <img :src="homeLogo" :alt="homeName" />
                </div>
                <span class="team-name">{{ homeName }}</span>
            </div>

            <span class="vs">VS</span>

            <div class="team">
                <div class="img-container">
                    <img :src="awayLogo" :alt="awayName" />
                </div>
                <span class="team-name">{{ awayName }}</span>
            </div>
        </div>

        <div class="match-card__body">
            <div>
                <div class="match-card__body--item-wraper">
                    <img src="../../assets/icons/match_calender.svg" alt="" />
                    {{ matchDate }}
                </div>
                <div class="match-card__body--item-wraper">
                    <img src="../../assets/icons/match_time.svg" alt="" />
                    {{ matchTime }}
                </div>
                <div class="match-card__body--item-wraper">
                    <img src="../../assets/icons/match_place.svg" alt="" />
                    {{ venue }}
                </div>
            </div>

            <template v-if="showBtn">
                <button class="btn-details" @click="onClickDetails">{{ buttonMessage }}</button>
            </template>
            <template v-if="detailsUrl">
                <a :href="detailsUrl" class="btn-details">{{ buttonMessage }}</a>
            </template>
        </div>
    </div>
</template>
