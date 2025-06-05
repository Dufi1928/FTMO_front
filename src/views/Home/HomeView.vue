<script setup>
import {ref, onMounted} from 'vue'
import Header from '../../components/Header/Header.vue'
import SectionHeader from '../../components/SectionHeader/SectionHeader.vue'
import CityCircle from '../../components/CityCircle/CityCircle.vue'
import './home.css'
import '@splidejs/vue-splide/css'
import {Splide, SplideSlide} from '@splidejs/vue-splide'
import MatchCard from "../../components/MatchCard/MatchCard.vue";
import Footer from "../../components/Footer/Footer.vue";
import MapProClubs from "../../components/Map/MapProClubs.vue"


const cities = ref([])

onMounted(async () => {
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/')
        const data = await res.json()
        cities.value = data.map(team => ({
            name: team.club_name,
            image: team.image || 'src/assets/images/deulemont.jpeg'
        }))
    } catch (err) {
        console.error('Erreur de chargement des clubs:', err)
    }
})
const ranking = ref([
    {rank: 1, club: 'Deulemont', teamNo: 1, points: 2, won: 74, lost: 15, diff: 59},
    {rank: 2, club: 'Lompret', teamNo: 1, points: 2, won: 64, lost: 23, diff: 41},
    {rank: 3, club: 'Capinghem', teamNo: 1, points: 2, won: 63, lost: 34, diff: 29},
    {rank: 4, club: 'Wez‐Macquart', teamNo: 1, points: 2, won: 54, lost: 39, diff: 15},
    {rank: 5, club: 'Deulemont', teamNo: 2, points: 2, won: 39, lost: 54, diff: -15}
])


</script>


<template>
    <Header/>
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
            <a href="" class="our-history-content-content-cta">En savoir plus</a>
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
                    <CityCircle :image="city.image" :name="city.name"/>
                </SplideSlide>
            </Splide>
        </div>
    </div>
    <SectionHeader
        background=""
        title="Les prochaines rencontres"
        linkText="Toutes les rencontres"
        linkUrl="/clubs"
    />

    <div class="city-slider-container" style="background: white">
        <Splide
            :options="{ perPage: 3, arrows: true, gap: '1rem', pagination: false, focus: 'left',trimSpace: true, perMove: 1, breakpoints: { 1124: { perPage: 2 }, 640: { perPage: 1 } } }">
            <SplideSlide v-for="(city, i) in cities" :key="i">
                <MatchCard details-url="https://google.fr" venue="Salle Victor Hugo, Lille" match-time="14h30"
                           match-date="23 Avril 2025" away-logo="src/assets/images/deulemont.jpeg" away-name="Deulemont"
                           home-logo="src/assets/images/deulemont.jpeg" home-name="Verlinghem"/>
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
                    <tr><th>Club</th></tr>
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
                        <th>Points</th>
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
                        <td>{{ row.points }}</td>
                        <td class="won">{{ row.won }}</td>
                        <td class="lost">{{ row.lost }}</td>
                        <td :class="{ positive:row.diff>0, negative:row.diff<0 }">
                            {{ row.diff>0? '+'+row.diff : row.diff }}
                        </td>
                    </tr>
                    </tbody>

                </table>
            </div>
        </div>
    </div>

    <template>
        <div class="map-container-home h-screen">
            <MapProClubs api-key="hwPULScg2AcyGIZf8gl0"/>
        </div>
    </template>
    <Footer/>


</template>

