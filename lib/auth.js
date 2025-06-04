// src/lib/auth.js
export function setTokens(access, refresh) {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
}

export function getAccessToken() {
    return localStorage.getItem('accessToken')
}

export function getRefreshToken() {
    return localStorage.getItem('refreshToken')
}

export function isAuthenticated() {
    return !!getAccessToken()
}

export function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    // redirige vers la page de connexion
    window.location.href = '/login.html'
}

/* wrapper fetch : ajoute le header + rafraîchit le token si 401 */
export async function apiFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
    const access = getAccessToken()
    if (access) headers.Authorization = `Bearer ${access}`

    let resp = await fetch(url, { ...options, headers })

    if (resp.status === 401 && getRefreshToken()) {
        const ok = await tryRefresh()          // tente de renouveler l’access
        if (ok) {
            headers.Authorization = `Bearer ${getAccessToken()}`
            resp = await fetch(url, { ...options, headers }) // relance l’appel
        } else {
            logout()
        }
    }
    return resp
}

async function tryRefresh() {
    const r = await fetch('https://ftmo.bob-digital.com/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: getRefreshToken() })
    })
    if (!r.ok) return false
    const data = await r.json()
    setTokens(data.access, getRefreshToken())
    return true
}
