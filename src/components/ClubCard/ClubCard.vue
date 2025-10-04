<script setup>
import { defineProps, computed } from 'vue'
import './ClubCard.css'

const props = defineProps({
    slug: { type: [Number, String], required: true }, // accepte String(team.id)
    title: { type: String, required: true },
    image: { type: String, default: 'src/assets/images/deulemont.jpeg' },
    address: { type: String, required: true },
    // on reçoit maintenant le tableau complet des créneaux
    schedules: { type: Array, default: () => [] }
})

const weekdayMap = {
    mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Ven', sat: 'Sam', sun: 'Dim'
}

function pad2(n) { return String(n).padStart(2, '0') }
function fmtTime(isoOrHHMMSS) {
    if (!isoOrHHMMSS) return ''
    const onlyTime = /^\d{2}:\d{2}(:\d{2})?$/.test(isoOrHHMMSS)
    if (onlyTime) {
        const [h, m] = isoOrHHMMSS.split(':')
        return `${pad2(h)}:${pad2(m)}`
    }
    const d = new Date(isoOrHHMMSS)
    if (isNaN(d.getTime())) return ''
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

// Liste des libellés d’audiences uniques (toutes catégories confondues)
const audienceBadges = computed(() => {
    const set = new Set()
    for (const s of props.schedules) {
        for (const c of (s.categories || [])) {
            // on affiche le label s’il existe, sinon le code
            set.add((c && (c.label || c.code)) || '')
        }
    }
    const arr = [...set].filter(Boolean)
    return arr.length ? arr : ['Tous publics']
})

// Créneaux formatés "Lun 18:00–20:00 — Juniors, Séniors"
const slots = computed(() => {
    const formatted = []
    for (const s of props.schedules) {
        const day = weekdayMap[s.weekday] || s.weekday || ''
        const start = fmtTime(s.start_time)
        const end = fmtTime(s.end_time)
        const cats = (s.categories || []).map(c => c.label || c.code).filter(Boolean)
        const catsTxt = cats.length ? ` — ${cats.join(', ')}` : ''
        const base = [day, start && end ? `${start}–${end}` : ''].filter(Boolean).join(' ')
        if (base) formatted.push(base + catsTxt)
    }
    return formatted
})

// Un rendu compact : on montre 3 lignes max puis “+N autres”
const slotsCompact = computed(() => {
    if (!slots.value.length) return 'Horaires non communiqués'
    const first = slots.value.slice(0, 3).join(' • ')
    const rest = slots.value.length - 3
    return rest > 0 ? `${first} • +${rest} autres` : first
})
</script>

<template>
    <div class="club-card-line-container">
        <div class="club-card-img">
            <img :src="image" :alt="title" />
        </div>

        <div class="club-card-content">
            <h2 class="club-card-title">{{ title }}</h2>

            <div class="club-card-info">
                <p>
                    <img src="../../assets/icons/location_icon.svg" alt="Adresse" />
                    {{ address }}
                </p>
                <br>
                <p>
                    <img src="../../assets/icons/clock_icon.svg" alt="Horaires" />
                    {{ slotsCompact }}
                </p>
            </div>
        </div>

        <div class="club-card-button">
            <a :href="`/clubs/${slug}`">Voir la fiche</a>
        </div>
    </div>
</template>
