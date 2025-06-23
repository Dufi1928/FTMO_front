<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../../../../stores/auth.js'
import Footer from '../../../../components/Footer/Footer.vue'

import AdminHome from '../AdminHome/AdminHomeVieuw.vue'
import AdminTeamManager from '../AdminTeamManager/AdminTeamManagerVue.vue'
import AdminMatcheManager from '../AdminMatcheManager/AdminMatcheManagerVue.vue'
import AdminSetting from '../AdminSetting/AdminSettingVue.vue'
import './DashboardVieuw.css'

import { HomeIcon, UsersIcon, TrophyIcon, SettingsIcon, LogOutIcon, MenuIcon, ArrowLeftIcon } from 'lucide-vue-next'

const auth = useAuthStore()
const isCollapsed = ref(false)
const currentView = ref('Tableau De Bord')
const buttonLeft = ref('270px')

function toggleMenu() {
    isCollapsed.value = !isCollapsed.value
}

watch(isCollapsed, (val) => {
    buttonLeft.value = val ? '90px' : '270px'
})

onMounted(() => {
    if (!auth.isAuthenticated) {
        window.location.href = '/login'
    }
})

function logout() {
    auth.logout()
    window.location.href = '/login'
}

const currentComponent = computed(() => {
    switch (currentView.value) {
        case 'Tableau De Bord':
            return AdminHome
        case 'Mon Equipe':
            return AdminTeamManager
        case 'Matches':
            return AdminMatcheManager
        case 'settings':
            return AdminSetting
        default:
            return AdminHome
    }
})
</script>

<template>
    <div class="dashboard-page-container">
        <button
            class="toggle-button-floating"
            :style="{ left: buttonLeft }"
            @click="toggleMenu"
        >
            <component :is="isCollapsed ? MenuIcon : ArrowLeftIcon" class="icon" />
        </button>

        <aside :class="['dashboard-menu', { collapsed: isCollapsed }]">
            <img v-if="!isCollapsed" src="../../../../assets/logo.svg" alt="FTMO" class="dashboard-logo" />
            <nav class="menu-nav">
                <ul>
                    <li :class="{ active: currentView === 'Tableau De Bord' }">
                        <a href="#" @click.prevent="currentView = 'Tableau De Bord'">
                            <HomeIcon class="icon" />
                            <span v-if="!isCollapsed">Accueil</span>
                        </a>
                    </li>
                    <li :class="{ active: currentView === 'Mon Equipe' }">
                        <a href="#" @click.prevent="currentView = 'Mon Equipe'">
                            <UsersIcon class="icon" />
                            <span v-if="!isCollapsed">Mon Équipe</span>
                        </a>
                    </li>
                    <li :class="{ active: currentView === 'Matches' }">
                        <a href="#" @click.prevent="currentView = 'Matches'">
                            <TrophyIcon class="icon" />
                            <span v-if="!isCollapsed">Matches</span>
                        </a>
                    </li>
                    <li :class="{ active: currentView === 'settings' }">
                        <a href="#" @click.prevent="currentView = 'settings'">
                            <SettingsIcon class="icon" />
                            <span v-if="!isCollapsed">Paramètres</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" @click.prevent="logout">
                            <LogOutIcon class="icon" />
                            <span v-if="!isCollapsed">Déconnexion</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>

        <div :class="['main-content', { collapsed: isCollapsed }]">
            <component :is="currentComponent" />
            <Footer />
        </div>
    </div>
</template>
