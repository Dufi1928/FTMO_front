<template>
    <!-- Carte plein écran -->
    <div ref="mapEl" class="map" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Carte Leaflet :
 *   • 12 communes (photos + bague rouge)
 *   • 📍 Position actuelle de l’utilisateur (point bleu)
 * Sans appel réseau externe : coordonnées pré‑calculées.
 *
 * ➜ Remplace chaque « img » par ta propre photo carrée (32 px).
 */

const mapEl = ref(null)
let map

const COMMUNES = [
    { name: 'Beaucamps‑Ligny',          lat: 50.6053,   lon: 2.9175,   img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Bois‑Grenier',             lat: 50.64985,  lon: 2.87409,  img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Capinghem',                lat: 50.645,    lon: 2.96278,  img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Deûlémont',                lat: 50.734823, lon: 2.944911, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Ennetières‑en‑Weppes',     lat: 50.6353,   lon: 2.9422,   img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Erquinghem‑Lys',           lat: 50.676011, lon: 2.84505,  img: 'src/assets/images/deulemont.jpeg' },
    { name: 'La Chapelle‑d’Armentières',lat: 50.6736,   lon: 2.8961,   img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Lompret',                  lat: 50.669529, lon: 2.990453, img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Radinghem‑en‑Weppes',      lat: 50.61884,  lon: 2.90924,  img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Sailly‑lez‑Lannoy',        lat: 50.65,     lon: 3.21667,  img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Verlinghem',               lat: 50.68291,  lon: 2.99907,  img: 'src/assets/images/deulemont.jpeg' },
    { name: 'Wervicq‑Sud',              lat: 50.7731,   lon: 3.0486,   img: 'src/assets/images/deulemont.jpeg' }
]

onMounted(async () => {
    if (typeof window === 'undefined') return

    const leaflet = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    const L = leaflet.default || leaflet

    // Icône générique Leaflet (si aucune photo)
    const defaultIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    })

    // Vue initiale centrée sur la métropole lilloise
    map = L.map(mapEl.value).setView([50.65, 3.04], 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map)

    const group = L.featureGroup().addTo(map)

    // 1) Marqueurs des communes
    COMMUNES.forEach(c => {
        const center = L.latLng(c.lat, c.lon)

        const icon = c.img
            ? L.divIcon({
                html: `<img src="${c.img}" alt="${c.name}" />`,
                className: 'custom-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            })
            : defaultIcon

        L.marker(center, { icon, title: c.name })
            .bindPopup(`<strong>${c.name}</strong>`)
            .addTo(group)
    })

    // 2) Position actuelle (si acceptée par l’utilisateur)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const { latitude, longitude } = pos.coords
                const me = L.circleMarker([latitude, longitude], {
                    radius: 8,
                    color: '#006aff',     // contour bleu
                    fillColor: '#006aff', // remplissage bleu
                    fillOpacity: 1
                }).bindPopup('Vous êtes ici').addTo(group)

                // Ajuste la vue pour inclure la position
                map.fitBounds(group.getBounds(), { padding: [30, 30] })
            },
            err => console.warn('Géolocalisation refusée / impossible :', err)
        )
    }

    // Ajustement initial (sans la position si pas encore chargée)
    map.fitBounds(group.getBounds(), { padding: [30, 30] })
})

onBeforeUnmount(() => { map && map.remove() })
</script>

<style>
.map {
    height: 100vh;
    width: 100vw;
}

/* Marqueur : photo centrée dans une bague rouge */
.custom-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #d00;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
    overflow: hidden;
}

.custom-marker img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 50%;
}
</style>
