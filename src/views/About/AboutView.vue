<script setup>
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import './About.css'
import {useAuthStore} from '../../../stores/auth.js'

const auth = useAuthStore()
import '@splidejs/vue-splide/css'
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue";
import SecundaryPageTitle from "../../components/SecundaryPageTitle/SecundaryPageTitle.vue";
import MatchCard from "../../components/MatchCard/MatchCard.vue";
import {Splide, SplideSlide} from "@splidejs/vue-splide";


const stats = [
    { icon: 'src/assets/icons/about/members.svg', value: '100+', label: 'Membres actives' },
    { icon: 'src/assets/icons/about/trophy.svg', value: '50+', label: 'Tournois organisés' },
    { icon: 'src/assets/icons/about/clubs.svg', value: '8', label: 'Clubs' },
    { icon: 'src/assets/icons/about/experiences.svg', value: '20+', label: 'Années d’expériences' }
]


</script>

<template>
    <Header theme="light" :key="auth.renderKey" :alwaysBlack="true"/>
    <main class="about-page-container">
        <div class="about-page-title-wrapper">
            <MainPageTitle
                title="À propos"
                description="Découvrez l’histoire et les engagements de la FTMO"
            />
        </div>
        <div class="about-detail-container" >
            <div class="about-detail-wrapper">
                <div class="about-detail-info">
                    <SecundaryPageTitle
                        title="Notre Club"
                    />
                    <p>Le Foyers de Tennis de Table de la Métropole Ouest (FTMO) rassemble les clubs de tennis de table de
                        Lille et de ses environs. Depuis plus de 50 ans, nous œuvrons pour développer ce sport, former les
                        jeunes talents et organiser des compétitions de qualité.</p>
                    <p>Notre mission est de promouvoir les valeurs sportives, l'esprit d'équipe et la pratique du tennis de
                        table pour tous, quel que soit l'âge ou le niveau.</p>
                </div>
                <div class="about-image-wrapper">
                    <img src="../../assets/images/about/image.jpg" alt="">
                </div>
            </div>
        </div>

        <div class="about-stats-wrapper">
            <Splide
                :options="{ perPage: 4, arrows: true, gap: '1rem', pagination: false, focus: 'left',trimSpace: true, perMove: 1, breakpoints: { 1124: { perPage: 2 }, 640: { perPage: 1 } } }">
                <SplideSlide v-for="(stat, i) in stats" :key="i">
                    <div class="stat-card">
                        <div class="icon-circle">
                            <img :src="stat.icon" :alt="stat.label" />
                        </div>
                        <div class="stat-number">{{ stat.value }}</div>
                        <div class="stat-label">{{ stat.label }}</div>
                    </div>
                </SplideSlide>
            </Splide>
        </div>



    </main>
    <Footer/>
</template>
