<script setup>
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import './clubs.css'
import { useAuthStore } from '../../../stores/auth.js'
const auth = useAuthStore()
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue";
import MapClubsByPosition from "../../components/MapClubsByPosition/MapClubsByPosition.vue";
import SecundaryPageTitle from "../../components/SecundaryPageTitle/SecundaryPageTitle.vue";
import ClubCard from "../../components/ClubCard/ClubCard.vue";
</script>

<template>
    <Header theme="light"  :key="auth.renderKey" :alwaysBlack="true" />
    <main class="clubs-page-container">
        <MainPageTitle
            title="Les club près de chez vous"
            description="Retrouvez l’ensemble des clubs affiliés à la FTMO dans la métropole lilloise"
        />
        <div class="clubs-page-map-container" >
            <MapClubsByPosition/>
        </div>
        <div class="h2-page-container">
            <SecundaryPageTitle
                title="Les clubs"
            />
        </div>

        <div class="club-listing-container">
            <ClubCard
                id="club-card"
                title="Deulemont"
                image="src/assets/images/deulemont.jpeg"
                address="Salle Victor Hugo, Lille"
                operating-hours="Lun 18–20h Mer 19–21h Sam 10–12h"
            />
            <ClubCard
                title="Deulemont"
                image="src/assets/images/deulemont.jpeg"
                address="Salle Victor Hugo, Lille"
                operating-hours="Lun 18–20h Mer 19–21h Sam 10–12h"
            />
            <ClubCard
                title="Deulemont"
                image="src/assets/images/deulemont.jpeg"
                address="Salle Victor Hugo, Lille"
                operating-hours="Lun 18–20h Mer 19–21h Sam 10–12h"
            />
            <ClubCard
                title="Deulemont"
                image="src/assets/images/deulemont.jpeg"
                address="Salle Victor Hugo, Lille"
                operating-hours="Lun 18–20h Mer 19–21h Sam 10–12h"
            />
        </div>

    </main>
    <Footer />
</template>
