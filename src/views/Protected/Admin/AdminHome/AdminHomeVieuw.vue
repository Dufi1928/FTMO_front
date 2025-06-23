<script setup>
import './AdminHome.css'
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js'

import { Line } from 'vue-chartjs'
import {onMounted, ref} from "vue";
import GenericRankingTable from "../../../../components/GenericRankingTable/GenericRankingTable.vue";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)
const ranking = 4
const winRate = 67

const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
        {
            label: 'Matchs joués',
            data: [2, 4, 3, 5, 6, 4],
            borderColor: '#4b50ff',
            backgroundColor: 'rgba(75,80,255,0.1)',
            tension: 0.4,
        },
    ],
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: { color: '#555' },
            grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#555' },
            grid: { color: 'rgba(0,0,0,0.05)' },
        },
    },
    plugins: {
        legend: { display: false },
    },
}


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
    <div class="home-container">
        <h1 class="page-title">Tableau De Bord</h1>
        <p class="page-subtitle" >Bienvenue sur le tableau de bord administrateur.</p>

        <div class="card-grid">
            <div class="card yellow">
                <h2>Classement général</h2>
                <p class="value">{{ ranking }}<sup>e</sup></p>
                <p class="comment">
                    {{
                        ranking === 1
                            ? "Excellent ! Vous êtes en tête du classement."
                            : ranking <= 5
                                ? "Très bon positionnement, continuez ainsi !"
                                : "Vous pouvez encore grimper au classement."
                    }}
                </p>
            </div>

            <div class="card green">
                <h2>Pourcentage de victoire</h2>
                <p class="value">{{ winRate }}%</p>
                <p class="comment">
                    {{
                        winRate >= 75
                            ? "Performance impressionnante !"
                            : winRate >= 50
                                ? "Bon taux de victoire, gardez le rythme."
                                : "Amélioration nécessaire pour rester compétitif."
                    }}
                </p>
            </div>

            <div class="card chart-card">
                <h2>Evolution de clasement</h2>
                <div class="chart-wrapper">
                    <Line :data="chartData" :options="chartOptions" />
                </div>
            </div>
        </div>
        <div class="table-container">
            <h2 class="page-title">
                Classement de mes joueurs
            </h2>
            <GenericRankingTable
                :columns="playerColumns"
                :rows="playerRows"
                width="100%"
                title="Top Joueurs de la Saison"
                linkText="Voir tous les joueurs"
                linkUrl="/players"
            />
        </div>
    </div>
</template>
