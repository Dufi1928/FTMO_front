

<script setup>
import './MapClubsByPosition.css'
import {ref, onMounted, onBeforeUnmount} from 'vue'

const mapEl = ref(null)
let map, group
const noResults = ref(false)

const clubs = [
    { name: 'Club de Beaucamps‑Ligny', city: 'Beaucamps‑Ligny', zip: '59134', lat: 50.6053, lon: 2.9175, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Bois‑Grenier', city: 'Bois‑Grenier', zip: '59280', lat: 50.64985, lon: 2.87409, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Capinghem', city: 'Capinghem', zip: '59160', lat: 50.645, lon: 2.96278, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Deûlémont', city: 'Deûlémont', zip: '59890', lat: 50.734823, lon: 2.944911, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Ennetières‑en‑Weppes', city: 'Ennetières‑en‑Weppes', zip: '59320', lat: 50.6353, lon: 2.9422, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Erquinghem‑Lys', city: 'Erquinghem‑Lys', zip: '59193', lat: 50.676011, lon: 2.84505, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de La Chapelle‑d’Armentières', city: 'La Chapelle‑d’Armentières', zip: '59930', lat: 50.6736, lon: 2.8961, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Lompret', city: 'Lompret', zip: '59840', lat: 50.669529, lon: 2.990453, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Radinghem‑en‑Weppes', city: 'Radinghem‑en‑Weppes', zip: '59320', lat: 50.61884, lon: 2.90924, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Sailly‑lez‑Lannoy', city: 'Sailly‑lez‑Lannoy', zip: '59390', lat: 50.65, lon: 3.21667, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Verlinghem', city: 'Verlinghem', zip: '59237', lat: 50.68291, lon: 2.99907, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Club de Wervicq‑Sud', city: 'Wervicq‑Sud', zip: '59117', lat: 50.7731, lon: 3.0486, img: 'src/assets/images/deulemont.jpeg' }
]

const filters = ref({ radius: '' })
let userCoords = null

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function applyFilters() {
    if (!map || !group) return
    group.clearLayers()
    noResults.value = false

    const filtered = clubs.filter(c => {
        return !filters.value.radius || (userCoords && haversineDistance(userCoords.lat, userCoords.lon, c.lat, c.lon) <= Number(filters.value.radius))
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
            .bindPopup(`<strong>${c.name}</strong><br>${c.city}`)
            .addTo(group)
    })

    if (filtered.length) {
        const bounds = filtered.map(c => [c.lat, c.lon])
        map.fitBounds(bounds, { padding: [30, 30] })
    } else {
        noResults.value = true
    }
}

onMounted(async () => {
    const leaflet = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    const L = leaflet.default || leaflet

    map = L.map(mapEl.value).setView([50.65, 3.04], 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map)

    group = L.featureGroup().addTo(map)
    applyFilters()

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const {latitude, longitude} = pos.coords
                userCoords = {lat: latitude, lon: longitude}

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
        <div class="filters">
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

