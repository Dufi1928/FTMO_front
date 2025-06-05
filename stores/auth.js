// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const access = ref(
        typeof localStorage === 'undefined' ? null : localStorage.getItem('accessToken')
    )
    const refresh = ref(
        typeof localStorage === 'undefined' ? null : localStorage.getItem('refreshToken')
    )

    const renderKey = ref(0) // 👈 Nouvelle clé de re-render

    function setTokens(a, r) {
        access.value = a
        refresh.value = r
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('accessToken', a)
            localStorage.setItem('refreshToken', r)
        }

        renderKey.value++ // 👈 Déclenche un re-render global
    }

    function logout() {
        access.value = null
        refresh.value = null
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        }

        renderKey.value++ // 👈 Force aussi re-render lors du logout
    }

    const isAuthenticated = computed(() => !!access.value)

    return { access, refresh, isAuthenticated, setTokens, logout, renderKey }
})
