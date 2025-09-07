<script setup>
import './MapClubsByPosition.css'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    showFilters: { type: Boolean, default: true } // ← nouvelle prop
})

const mapEl = ref(null)
let map, group, L
const noResults = ref(false)

// ---- Filtres / position user
const filters = ref({ radius: '' })
let userCoords = null

// ---- Données depuis l'API
const clubs = ref([])

// Utilitaire: distance
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// Rendu des marqueurs selon filtres
function applyFilters() {
    if (!map || !group) return
    group.clearLayers()
    noResults.value = false

    const source = clubs.value.filter(c =>
        typeof c.lat === 'number' && !Number.isNaN(c.lat) &&
        typeof c.lon === 'number' && !Number.isNaN(c.lon)
    )

    const filtered = source.filter(c => {
        if (!filters.value.radius) return true
        if (!userCoords) return false
        return haversineDistance(userCoords.lat, userCoords.lon, c.lat, c.lon) <= Number(filters.value.radius)
    })

    filtered.forEach(c => {
        const icon = L.divIcon({
            html: `<img src="${c.img}" alt="${c.name}" />`,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        })

        L.marker([c.lat, c.lon], { icon, title: c.name })
            .bindPopup(`
        <strong>${c.name}</strong><br/>
        ${c.city ?? ''}<br/>
        <a href="/clubs/${c.slug}">Voir la fiche</a>
      `)
            .addTo(group)
    })

    if (filtered.length) {
        const bounds = filtered.map(c => [c.lat, c.lon])
        map.fitBounds(bounds, { padding: [30, 30] })
    } else {
        noResults.value = true
    }
}

// Init carte + fetch API
onMounted(async () => {
    const leaflet = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    L = leaflet.default || leaflet

    map = L.map(mapEl.value).setView([50.65, 3.04], 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map)

    group = L.featureGroup().addTo(map)

    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/')
        const data = await res.json()

        clubs.value = (Array.isArray(data) ? data : []).map(team => {
            const lat = parseFloat(team.latitude)
            const lon = parseFloat(team.longitude)
            const img =
                team.image && typeof team.image === 'string' && team.image.trim() !== ''
                    ? team.image
                    : 'src/assets/images/deulemont.jpeg'

            return {
                id: team.id,
                name: team.club_name,
                city: team.club_short_description || '',
                zip: '',
                lat: Number.isFinite(lat) ? lat : NaN,
                lon: Number.isFinite(lon) ? lon : NaN,
                img,
                slug: team.id,
            }
        })
    } catch (err) {
        console.error('Erreur de chargement des clubs:', err)
    }
    applyFilters()
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const { latitude, longitude } = pos.coords
                userCoords = { lat: latitude, lon: longitude }

                L.circleMarker([latitude, longitude], {
                    radius: 8,
                    color: '#006aff',
                    fillColor: '#006aff',
                    fillOpacity: 1
                }).bindPopup('Vous êtes ici').addTo(map)

                applyFilters()
            },
            err => console.warn('Géolocalisation refusée :', err)
        )
    }
})

onBeforeUnmount(() => {
    map && map.remove()
})
</script>

<template>
    <section class="filters-section">
        <!-- Affichage conditionnel -->
        <div v-if="props.showFilters" class="filters">
            <select v-model="filters.radius">
                <option value="">Tout les clubs</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="15">15 km</option>
                <option value="20">20 km</option>
            </select>
            <button @click="applyFilters">Valider les filtres</button>
        </div>

        <div ref="mapEl" class="map" />
        <div v-if="noResults" class="no-results-banner">Aucun club trouvé dans ce rayon</div>
    </section>
</template>
