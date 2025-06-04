<script setup>
import { ref } from 'vue'
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import './login.css'

import { useAuthStore } from '../../../stores/auth.js'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)
async function handleSubmit() {
    error.value = null
    loading.value = true
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.value, password: password.value })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            error.value = data.detail || 'Identifiants invalides'
        } else {
            auth.setTokens(data.access, data.refresh)
            window.location.href = '/'          // redirection manuelle
        }
    } catch {
        error.value = 'Erreur réseau'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <Header :alwaysBlack="true" />
    <main class="login-container">
        <form class="login-form" @submit.prevent="handleSubmit">
            <label>
                Email
                <input type="email" v-model="email" required />
            </label>
            <label>
                Mot de passe
                <input type="password" v-model="password" required />
            </label>
            <button type="submit" :disabled="loading">
                {{ loading ? 'Connexion…' : 'Se connecter' }}
            </button>
            <p v-if="error" class="login-error">{{ error }}</p>
        </form>
    </main>
    <Footer />
</template>
