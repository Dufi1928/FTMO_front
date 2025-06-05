<script setup>
import { useAuthStore } from '../../../../../stores/auth.js'
import { onMounted } from 'vue'
import Header from '../../../../components/Header/Header.vue'
import Footer from '../../../../components/Footer/Footer.vue'

const auth = useAuthStore()

onMounted(() => {
    if (!auth.isAuthenticated) {
        window.location.href = '/login'
    }
})

function logout() {
    auth.logout()
    window.location.href = '/login'
}
</script>

<template>
    <Header :key="auth.renderKey" :alwaysBlack="true"/>
    <div class="protected">
        <h1>Zone protégée</h1>
        <p>Seuls les utilisateurs authentifiés peuvent voir cette page.</p>
        <button @click="logout">Déconnexion</button>
    </div>
    <Footer/>
</template>

<style scoped>
.protected {
    padding: 150px 20px;
    font-family: "Lato", sans-serif;
}

button {
    margin-top: 20px;
    padding: 10px 20px;
    cursor: pointer;
}
</style>