<script setup>
import { ref } from 'vue'
import Header from '../components/Header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'
import './login.css'

const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    const response = await fetch('https://ftmo.bob-digital.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      error.value = data.message || 'Échec de la connexion.'
    } else {
      console.log('Login success', data)
    }
  } catch (err) {
    error.value = 'Erreur réseau.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Header />
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
      <button type="submit" :disabled="loading">Se connecter</button>
      <p v-if="error" class="login-error">{{ error }}</p>
    </form>
  </main>
  <Footer />
</template>
