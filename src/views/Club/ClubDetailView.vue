<script setup>
import { onMounted, ref } from 'vue'
import { usePageContext } from '../../renderer/usePageContext.js'
import Header from "../../components/Header/Header.vue"
import Footer from "../../components/Footer/Footer.vue"
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle.vue"
import { useAuthStore } from "../../../stores/auth.js"
import './Club.css'
import '@splidejs/vue-splide/css'
import SecundaryPageTitle from "../../components/SecundaryPageTitle/SecundaryPageTitle.vue";
import GenericRankingTable from "../../components/GenericRankingTable/GenericRankingTable.vue";
import {Splide, SplideSlide} from "@splidejs/vue-splide";
import SectionHeader from "../../components/SectionHeader/SectionHeader.vue";
import MatchCard from "../../components/MatchCard/MatchCard.vue";

const pageContext = usePageContext()
const clubId = pageContext.routeParams?.id ?? 'inconnu'
const auth = useAuthStore()
const cities = ref([])
const club = ref(null)

onMounted(async () => {
    // Chargement des informations du club courant
    try {
        const response = await fetch(`https://ftmo.bob-digital.com/api/teams/${clubId}`)
        if (!response.ok) {
            throw new Error(`Erreur de chargement du club (status : ${response.status})`)
        }
        club.value = await response.json()
    } catch (error) {
        console.error('Erreur lors du chargement des données du club :', error)
    }

    // Chargement de la liste de tous les clubs (pour en extraire villes/images)
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/')
        if (!res.ok) {
            throw new Error(`Erreur de chargement des clubs (status : ${res.status})`)
        }
        const data = await res.json()
        cities.value = data.map(team => ({
            name: team.club_name,
            image: team.image || '/src/assets/images/deulemont.jpeg'
        }))
    } catch (err) {
        console.error('Erreur de chargement des clubs :', err)
    }
})
const playerColumns = [
    { field: 'name',       label: 'Joueur',                 pinned: true,  sortable: false },
    { field: 'position',   label: 'Classement',             pinned: false, sortable: true },
    { field: 'matches',    label: 'Matchs joués',           pinned: false, sortable: true },
    {
        field: 'stats',
        label: 'Pourcentage de victoires',
        pinned: false,
        sortable: true,
        color: '#2436d4'               // exemple : pourcentage en bleu
    },
    {
        field: 'matches Win',
        label: 'Matchs Gagnés',
        pinned: false,
        sortable: true,
        cellClass: 'won',
        color: '#12b221'// applique la classe CSS .won définie dans le style
    },
    {
        field: 'matches lost',
        label: 'Matches Perdu',
        pinned: false,
        sortable: true,
        color: '#D11B1B'             // écriture verte
    },
]
const playerRows = ref([])

onMounted(() => {
    playerRows.value = [
        {
            name: 'Martin Dupont',
            position: 1,
            'matches Win': 10,
            matches: 12,
            stats: '83.3%',        // Pourcentage de victoires
            'matches lost': 25,
        },
        {
            name: 'Laura Bernard',
            position: 2,
            'matches Win': 8,
            matches: 11,
            stats: '72.7%',
            'matches lost': 22,
        },
        {
            name: 'Sophie Leroy',
            position: 3,
            matches: 10,
            'set win': 20,
            stats: '70.0%',
            'matches Win': 7,
            'matches lost': 9,
        },
        {
            name: 'Antoine Girard',
            position: 4,
            'matches Win': 6,
            matches: 10,
            stats: '60.0%',
            'matches lost': 18,
        },
        {
            name: 'Thomas Moreau',
            position: 5,
            matches: 9,
            'set win': 15,
            stats: '55.6%',
            'matches Win': 5,
            'matches lost': 12
        },
        {
            name: 'Élodie Caron',
            position: 6,
            matches: 8,
            'matches Win': 4,
            stats: '50.0%',
            'matches lost': 12,
        },
        {
            name: 'Pierre Fontaine',
            position: 7,
            matches: 8,
            'matches Win': 3,
            stats: '37.5%',
            'matches lost': 10,
        }
    ]
})


</script>

<template>
    <Header theme="light" :key="auth.renderKey" :alwaysBlack="true" />

    <main class="club-page-container">
        <MainPageTitle
            v-if="club"
            :title="`Club de ${club.club_name}`"
            :description="club.short_description || 'Club de tennis de table.'"
        />
        <div class="" v-if="club">
            <div class="club-detail-container" >
                <div class="club-image-wrapper">
                    <img :src="club.image" alt="">
                </div>
                <div class="club-detail-info">
                    <h2>Notre Club</h2>
                    <p>{{ club.club_description_paragraph_1 }}</p>
                    <p>{{ club.club_description_paragraph_2 }}</p>
                    <button >
                        Prendre contact
                    </button>
                </div>
            </div>
        </div>
        <div v-else>
            <p>Chargement des données du club...</p>
        </div>

        <div class="our-players-section">
            <div class="h2-page-container">
                <SecundaryPageTitle
                    title="Nos Joueurs"
                />
            </div>
            <GenericRankingTable
                :columns="playerColumns"
                :rows="playerRows"
                title="Top Joueurs de la Saison"
                linkText="Voir tous les joueurs"
                linkUrl="/players"
            />


        </div>
            <SectionHeader
                background=""
                title="Les prochaines rencontres"
                linkText="Toutes les rencontres"
                linkUrl="/clubs"
            />

            <div class="city-slider-container" >
                <Splide
                    :options="{ perPage: 3, arrows: true, gap: '1rem', pagination: false, focus: 'left',trimSpace: true, perMove: 1, breakpoints: { 1124: { perPage: 2 }, 640: { perPage: 1 } } }">
                    <SplideSlide v-for="(city, i) in cities" :key="i">
                        <MatchCard details-url="https://google.fr" venue="Salle Victor Hugo, Lille" match-time="14h30"
                                   match-date="23 Avril 2025" away-logo="../../src/assets/images/deulemont.jpeg" away-name="Deulemont"
                                   home-logo="../../src/assets/images/deulemont.jpeg" home-name="Verlinghem"/>
                    </SplideSlide>
                </Splide>
            </div>
    </main>

    <Footer />
</template>
