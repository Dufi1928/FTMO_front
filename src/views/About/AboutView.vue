<script setup>
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import './About.css'
import {useAuthStore} from '../../../stores/auth.js'

const auth = useAuthStore()
import '@splidejs/vue-splide/css'
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue";
import SecundaryPageTitle from "../../components/SecundaryPageTitle/SecundaryPageTitle.vue";
import {Splide, SplideSlide} from "@splidejs/vue-splide";
import {onMounted, ref} from "vue";
import SectionHeader from "../../components/SectionHeader/SectionHeader.vue";
import CityCircle from "../../components/CityCircle/CityCircle.vue";


const stats = [
    {icon: 'src/assets/icons/about/members.svg', value: '100+', label: 'Membres actives'},
    {icon: 'src/assets/icons/about/trophy.svg', value: '50+', label: 'Tournois organisés'},
    {icon: 'src/assets/icons/about/clubs.svg', value: '8', label: 'Clubs'},
    {icon: 'src/assets/icons/about/experiences.svg', value: '20+', label: 'Années d’expériences'}
]
const values = [
    {
        icon: 'src/assets/icons/about/1.svg',
        value: 'Transmission',
        label: 'La FTMO valorise la transmission des savoirs, du respect des règles et de la culture du tennis de table.'
    },
    {
        icon: 'src/assets/icons/about/2.svg',
        value: 'Inclusion',
        label: 'Nous accueillons des joueurs de tous âges, de toutes origines et de tous niveaux, créant ainsi une communauté diversifiée et solidaire.'
    },
    {
        icon: 'src/assets/icons/about/3.svg',
        value: 'Esprit d’équipe',
        label: 'Nous encourageons le bon jeu, le respect des adversaires et un comportement gracieux dans la victoire comme dans la défaite.'
    },
]

const cities = ref([])

onMounted(async () => {
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/')
        const data = await res.json()
        cities.value = data.map(team => ({
            name: team.club_name,
            image: team.image || 'src/assets/images/deulemont1.jpeg',
            slug : team.id,
        }))
    } catch (err) {
        console.error('Erreur de chargement des clubs:', err)
    }
})


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
        <div class="about-detail-container">
            <div class="about-detail-wrapper">
                <div class="about-detail-info">
                    <SecundaryPageTitle
                        title="Notre Club"
                    />
                    <p>Le Foyers de Tennis de Table de la Métropole Ouest (FTMO) rassemble les clubs de tennis de table
                        de
                        Lille et de ses environs. Depuis plus de 50 ans, nous œuvrons pour développer ce sport, former
                        les
                        jeunes talents et organiser des compétitions de qualité.</p>
                    <p>Notre mission est de promouvoir les valeurs sportives, l'esprit d'équipe et la pratique du tennis
                        de
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
                            <img :src="stat.icon" :alt="stat.label"/>
                        </div>
                        <div class="stat-number">{{ stat.value }}</div>
                        <div class="stat-label">{{ stat.label }}</div>
                    </div>
                </SplideSlide>
            </Splide>
        </div>
        <div class="values-section">
            <SecundaryPageTitle
                title="Nos valeurs"
            />
        </div>

        <div class="about-values-wrapper">
            <div v-for="(value, i) in values" :key="i">
                <div class="value-card">
                    <div class="icon-circle">
                        <img :src="value.icon" :alt="value.label"/>
                    </div>
                    <div class="mini-title">{{ value.value }}</div>
                    <div class="stat-label">{{ value.label }}</div>
                </div>
            </div>
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
                        <CityCircle :image="city.image" :name="city.name" :slug="city.slug" />
                    </SplideSlide>
                </Splide>
            </div>
        </div>



    </main>
    <Footer/>
</template>
