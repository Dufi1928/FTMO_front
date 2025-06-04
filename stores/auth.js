// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const access = ref(localStorage.getItem('accessToken'))
    const refresh = ref(localStorage.getItem('refreshToken'))

    function setTokens(a, r) {
        access.value = a
        refresh.value = r
        localStorage.setItem('accessToken', a)
        localStorage.setItem('refreshToken', r)
    }

    function logout() {
        access.value = null
        refresh.value = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    }

    const isAuthenticated = computed(() => !!access.value)

    return {access, refresh, isAuthenticated, setTokens, logout}
})
