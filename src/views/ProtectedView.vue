<script setup>
import { useAuthStore } from '../../stores/auth.js'
import { onMounted } from 'vue'

const auth = useAuthStore()

onMounted(() => {
  if (!auth.isAuthenticated) {
    window.location.href = '/login'
  }
})
</script>

<template>
  <div class="protected">
    <h1>Zone protégée</h1>
    <p>Seuls les utilisateurs authentifiés peuvent voir cette page.</p>
  </div>
</template>

<style scoped>
.protected {
  padding: 150px 20px;
  font-family: "Lato", sans-serif;
}
</style>
