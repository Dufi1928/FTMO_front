<!-- AdminTeamSettings.vue -->
<script setup>
import './AdminSetting.css'
import { ref, reactive, onMounted } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import ScheduleModal from '../../../../components/ScheduleModal/ScheduleModal.vue'

/* ====== ÉTAT ====== */
const team = reactive({
    id: null,
    club_name: '',
    address: '',
    club_short_description: '',
    club_description_paragraph_1: '',
    club_description_paragraph_2: '',
    email: '',
    image: null,
    image_large: null,
    latitude: '',      // ajouté
    longitude: '',     // ajouté
})

const previews = reactive({ image: null, image_large: null })
const schedules = ref([])
const saving = ref(false)

/* ====== MODALE PLANNING ====== */
const showSchedule = ref(false)
const selectedSchedule = ref(null)

/* ====== SNACKBAR ====== */
const snackbarMessage = ref('')
const snackbarVisible = ref(false)
const snackbarType = ref('success')

function showSnackbar(msg, type = 'success') {
    snackbarMessage.value = msg
    snackbarType.value = type
    snackbarVisible.value = true
    setTimeout(() => (snackbarVisible.value = false), 3000)
}

/* ====== TINYMCE ====== */
const tinymceConfig = {
    height: 250,
    menubar: false,
    plugins: 'link lists',
    toolbar: 'undo redo | bold italic underline | bullist numlist | link',
    content_style: 'body { font-size:14px; }',
    width: '100%',
}

/* ====== API ====== */
async function fetchTeam() {
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/my_team/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        })
        if (!res.ok) throw new Error("Erreur lors de la récupération de l'équipe")
        const payload = await res.json()
        Object.assign(team, payload.team)
        schedules.value = payload.team.schedules ?? []
        previews.image = team.image
        previews.image_large = team.image_large
    } catch (err) {
        showSnackbar(err.message, 'error')
    }
}

onMounted(fetchTeam)

/* ====== IMAGES ====== */
function onImageChange(field, e) {
    const file = e.target.files[0]
    if (!file) return
    team[field] = file
    previews[field] = URL.createObjectURL(file)
}

function isBlobLike(v) {
    return typeof Blob !== 'undefined' && v instanceof Blob;
}


/* ====== SAVE TEAM ====== */
async function saveTeam() {
    saving.value = true
    try {
        // TinyMCE => on a déjà le HTML dans team.club_description_paragraph_*
        const hasNewImage      = isBlobLike(team.image)
        const hasNewImageLarge = isBlobLike(team.image_large)

        const url = `https://ftmo.bob-digital.com/api/teams/${team.id}/`
        const auth = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        let res

        if (!hasNewImage && !hasNewImageLarge) {
            // ✅ Aucun nouveau fichier → JSON PATCH
            res = await fetch(url, {
                method: 'PATCH',
                headers: { ...auth, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    club_name: team.club_name,
                    address: team.address,
                    club_short_description: team.club_short_description,
                    club_description_paragraph_1: team.club_description_paragraph_1,
                    club_description_paragraph_2: team.club_description_paragraph_2,
                    email: team.email || '',
                    latitude: team.latitude || '',     // ajouté
                    longitude: team.longitude || '',   // ajouté
                }),
            })
        } else {
            // ✅ Multipart uniquement si on a (au moins) un nouveau fichier
            const fd = new FormData()
            fd.append('club_name', team.club_name ?? '')
            fd.append('address', team.address ?? '')
            fd.append('club_description_paragraph_1', team.club_description_paragraph_1 ?? '')
            fd.append('club_description_paragraph_2', team.club_description_paragraph_2 ?? '')
            if (team.email) fd.append('email', team.email)
            if (team.latitude !== undefined) fd.append('latitude', String(team.latitude ?? ''))   // ajouté
            if (team.longitude !== undefined) fd.append('longitude', String(team.longitude ?? '')) // ajouté

            // ⚠️ n’ajoute le 3e argument (filename) QUE si c’est un Blob/File
            if (hasNewImage)      fd.append('image', team.image, team.image.name || 'image')
            if (hasNewImageLarge) fd.append('image_large', team.image_large, team.image_large.name || 'image_large')

            // Si tu veux explicitement garder l’URL existante côté backend, tu peux aussi,
            // en plus du File ci-dessus, ajouter la string quand ce n’est PAS un nouveau fichier :
            // else if (typeof team.image === 'string') fd.append('image', team.image)
            // else if (typeof team.image_large === 'string') fd.append('image_large', team.image_large)

            res = await fetch(url, { method: 'PATCH', headers: auth, body: fd })
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.detail || 'Erreur lors de la sauvegarde')
        }

        const updated = await res.json()
        Object.assign(team, updated)
        previews.image = team.image
        previews.image_large = team.image_large
        showSnackbar('Équipe mise à jour avec succès', 'success')
    } catch (err) {
        showSnackbar(err.message, 'error')
    } finally {
        saving.value = false
    }
}

/* ====== PLANNING ====== */
function weekdayLabel(code) {
    const map = {
        mon: 'Lundi',
        tue: 'Mardi',
        wed: 'Mercredi',
        thu: 'Jeudi',
        fri: 'Vendredi',
        sat: 'Samedi',
        sun: 'Dimanche',
    }
    return map[code] || code
}

function openScheduleModal(model = null) {
    selectedSchedule.value = model ? { ...model } : null
    showSchedule.value = true
}
function closeScheduleModal() {
    showSchedule.value = false
}
function categoriesLabels(sch) {
    return (sch.categories || []).map(c => c.label).join(', ') || '—'
}
function onScheduleSaved(sch) {
    const idx = schedules.value.findIndex((s) => s.id === sch.id)
    if (idx !== -1) schedules.value[idx] = sch
    else schedules.value.push(sch)
    showSchedule.value = false
    showSnackbar('Créneau enregistré', 'success')
}
async function deleteSchedule(sch) {
    if (!confirm('Supprimer ce créneau ?')) return
    try {
        const res = await fetch(`https://ftmo.bob-digital.com/api/schedules/${sch.id}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        })
        if (!res.ok) throw new Error('Erreur lors de la suppression')
        schedules.value = schedules.value.filter((s) => s.id !== sch.id)
        showSnackbar('Créneau supprimé', 'success')
    } catch (err) {
        showSnackbar(err.message, 'error')
    }
}
</script>

<template>
    <!-- Snackbar -->
    <transition name="fade">
        <div v-if="snackbarVisible" class="snackbar" :class="snackbarType">
            {{ snackbarMessage }}
        </div>
    </transition>

    <div class="admin-team-settings-container">
        <h1 class="page-title">Paramètres de l’équipe</h1>
        <p class="page-subtitle">Modifier le contenu, les images et le planning.</p>

        <!-- FORMULAIRE -->
        <section class="card">
            <h2>Informations générales</h2>
            <form @submit.prevent="saveTeam" class="grid-two">
                <!-- Nom -->
                <div class="form-group">
                    <label>Nom du club *</label>
                    <input v-model="team.club_name" required />
                </div>
                <!-- Email -->
                <div class="form-group">
                    <label>Email</label>
                    <input v-model="team.email" type="email" />
                </div>
                <!-- Short desc -->
                <div class="form-group full">
                    <label>Adresse</label>
                    <textarea rows="3" v-model="team.address" />
                </div>

                <!-- NOTICE LAT/LNG -->
                <div class="form-group full">
                        <div class="info-box">
                        <strong >Important :</strong>
                        Ces deux champs sont nécessaires pour que votre club soit visible
                        sur la carte “Clubs près de chez vous”.
                        Vous pouvez trouver la latitude et la longitude sur Google Maps :
                        recherchez votre adresse, faites un clic droit sur l’emplacement,
                        puis copiez les coordonnées affichées (par ex. “48.8566, 2.3522”).
                        La première valeur est la latitude, la seconde la longitude.
                    </div>
                </div>

                <!-- Latitude/Longitude -->
                <div class="form-group">
                    <label>Latitude</label>
                    <input v-model="team.latitude" type="number" step="0.000001" placeholder="77" />
                </div>
                <div class="form-group">
                    <label>Longitude</label>
                    <input v-model="team.longitude" type="number" step="0.000001" placeholder="7.0" />
                </div>
                <!-- P1 -->
                <div class="form-group full">
                    <label>Paragraphe 1</label>
                    <Editor api-key="zaytdfkjtelofi3kn6saryli13midod7kcck8jeuve4a8iim" v-model="team.club_description_paragraph_1" :init="tinymceConfig" />
                </div>
                <!-- P2 -->
                <div class="form-group full">
                    <label>Paragraphe 2</label>
                    <Editor api-key="zaytdfkjtelofi3kn6saryli13midod7kcck8jeuve4a8iim" v-model="team.club_description_paragraph_2" :init="tinymceConfig" />
                </div>
                <!-- Images -->
                <div class="form-group">
                    <label>Image carrée</label>
                    <input class="paragraph" type="file" accept="image/*" @change="onImageChange('image', $event)" />
                    <img v-if="previews.image" :src="previews.image" class="img-preview" />
                </div>
                <div class="form-group">
                    <label>Image large</label>
                    <input class="paragraph" type="file" accept="image/*" @change="onImageChange('image_large', $event)" />
                    <img v-if="previews.image_large" :src="previews.image_large" class="img-preview-large" />
                </div>
                <!-- Actions -->
                <div class="modal-actions full">
                    <button :disabled="saving" type="submit" class="btn-primary">
                        {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
                    </button>
                </div>
            </form>
        </section>

        <!-- PLANNING -->
        <section class="card">
            <div class="flex-between">
                <h2>Plannings hebdomadaires</h2>
                <button class="btn-secondary" @click="openScheduleModal()">Ajouter</button>
            </div>
            <table class="schedule-table">
                <thead>
                <tr>
                    <th>Jour</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Public</th>
                    <th class="actions">Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="sch in schedules" :key="sch.id">
                    <td>{{ weekdayLabel(sch.weekday) }}</td>
                    <td>{{ sch.start_time?.slice(0,5) }}</td>
                    <td>{{ sch.end_time?.slice(0,5) }}</td>
                    <td>{{ categoriesLabels(sch) }}</td> <!-- ✅ -->
                    <td class="actions">
                        <button class="table-button edit" @click="openScheduleModal(sch)">Modifier</button>
                        <button class="table-button delete" @click="deleteSchedule(sch)">Supprimer</button>
                    </td>
                </tr>
                </tbody>
            </table>
        </section>

        <ScheduleModal
            v-if="showSchedule"
            :model="selectedSchedule"
            @close="closeScheduleModal"
            @saved="onScheduleSaved"
        />
    </div>
</template>
