<!-- AdminTeamManager.vue -->
<script setup>
import './AdminTeamManager.css'
import GenericRankingTable from '../../../../components/GenericRankingTable/GenericRankingTable.vue'
import {ref, onMounted, computed, watch} from 'vue'

/* ====== ÉTAT ====== */
const team = ref(null)
const showForm = ref(false)
const editingPlayer = ref(null)
const newPlayer = ref({
    first_name: '',
    last_name: '',
    civility: 'Mr',
    email: '',
    birth_date: '',
    profile_image: null,
})

/* ====== FORMULAIRE ====== */
function resetForm() {
    editingPlayer.value = null
    newPlayer.value = {
        first_name: '',
        last_name: '',
        civility: 'Mr',
        email: '',
        birth_date: '',
        profile_image: null,
    }
}

/* ====== MODAL IMAGE ====== */
const showImageModal = ref(false)
const modalImageUrl = ref('')

function openImageModal(url) {
    modalImageUrl.value = url
    showImageModal.value = true
}

function closeImageModal() {
    showImageModal.value = false
    modalImageUrl.value = ''
}

/* ====== RÉCUP ÉQUIPE ====== */
async function fetchTeam() {
    const token = localStorage.getItem('accessToken')
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/my_team/', {
            headers: {Authorization: `Bearer ${token}`}
        })
        if (!res.ok) throw new Error("Erreur lors de la récupération de l'équipe")
        const payload = await res.json()
        team.value = payload.team
    } catch (err) {
        showSnackbar(err.message, 'error')
    }
}

onMounted(fetchTeam)

/* ====== EDIT / DELETE ====== */
function handleEdit(player) {
    editingPlayer.value = player
    newPlayer.value = {
        first_name: player.first_name,
        last_name: player.last_name,
        civility: player.civility,
        email: player.email,
        birth_date: player.birth_date,
        profile_image: null
    }
    showForm.value = true
    initPreview()
}

async function handleDelete(player) {
    if (!confirm(`Supprimer ${player.first_name} ${player.last_name} ?`)) return
    const token = localStorage.getItem('accessToken')
    try {
        const res = await fetch(`https://ftmo.bob-digital.com/api/players/${player.id}/`, {
            method: 'DELETE',
            headers: {Authorization: `Bearer ${token}`}
        })
        if (!res.ok) throw new Error('Erreur lors de la suppression')
        showSnackbar('Joueur supprimé avec succès', 'success')
        await fetchTeam()
    } catch (err) {
        showSnackbar(err.message, 'error')
    }
}

/* ====== CREATE / UPDATE ====== */
async function submitPlayer() {
    if (!team.value) {
        showSnackbar("Équipe non chargée – réessayez", "error")
        return
    }

    const isEdit = !!editingPlayer.value
    const url = isEdit
        ? `https://ftmo.bob-digital.com/api/players/${editingPlayer.value.id}/`
        : 'https://ftmo.bob-digital.com/api/players/'

    const method = isEdit ? 'PATCH' : 'POST'   // PATCH = partiel

    const fd = new FormData()
    fd.append('first_name', newPlayer.value.first_name)
    fd.append('last_name', newPlayer.value.last_name)
    fd.append('civility', newPlayer.value.civility)
    if (newPlayer.value.email) fd.append('email', newPlayer.value.email)
    if (newPlayer.value.birth_date) fd.append('birth_date', newPlayer.value.birth_date)
    fd.append('team', team.value.id)

    if (newPlayer.value.profile_image) {
        fd.append(
            'profile_image',
            newPlayer.value.profile_image,
            newPlayer.value.profile_image.name   // nom de fichier correct
        )
    }
    try {
        const res = await fetch(url, {
            method,
            headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`},
            body: fd
        })

        if (!res.ok) {
            const err = await res.json()
            throw new Error(err.detail || 'Erreur lors de la sauvegarde')
        }

        showSnackbar(
            isEdit ? 'Joueur mis à jour avec succès' : 'Joueur ajouté avec succès',
            'success'
        )
        showForm.value = false
        initPreview()
        resetForm()
        await fetchTeam()

    } catch (err) {
        showSnackbar(err.message, 'error')
    }
}

/* ====== GESTION DES CLICS TABLE ====== */
function handleTableClick(event) {
    const tgt = event.target
    const action = tgt.dataset.action
    if (action === 'view') {
        return openImageModal(tgt.dataset.url)
    }
    const id = parseInt(tgt.dataset.id)
    if (isNaN(id)) return
    const player = team.value.players.find(p => p.id === id)
    if (!player) return
    if (action === 'edit') handleEdit(player)
    if (action === 'delete') handleDelete(player)
}

/* ====== COLONNES ====== */
const columns = [
    {
        field: 'first_name',
        label: 'Prénom',
        pinned: true,
        html: row => {
            const imgHtml = row.profile_image
                ? `<img src="${row.profile_image}" class="player-avatar" data-action="view" data-url="${row.profile_image}"/>`
                : (() => {
                    const i1 = (row.first_name || '')[0] || ''
                    const i2 = (row.last_name || '')[0] || ''
                    const initials = (i1 + i2).toUpperCase()
                    return `<div class="avatar-initials" data-action="view" data-url=""><span>${initials}</span></div>`
                })()
            return `<div class="cell-with-avatar">${imgHtml}<span>${row.first_name}</span></div>`
        }
    },
    {field: 'last_name', label: 'Nom'},
    {field: 'civility', label: 'Civilité'},
    {field: 'email', label: 'Email'},
    {field: 'birth_date', label: 'Date de naissance'},
    {
        field: 'actions',
        label: 'Actions',
        html: row => `
      <button class="table-button edit"   data-id="${row.id}" data-action="edit">Modifier</button>
      <button class="table-button delete" data-id="${row.id}" data-action="delete">Supprimer</button>
    `
    }
]

/* ====== FILTRE ====== */
const searchQuery = ref('')
const filteredPlayers = computed(() => {
    if (!team.value) return []
    const list = team.value.players ?? []
    if (!searchQuery.value.trim()) return list
    const q = searchQuery.value.toLowerCase()
    return team.value.players.filter(p =>
        Object.values(p).some(v =>
            String(v).toLowerCase().includes(q)
        )
    )
})
const previewUrl = ref(null)

function initPreview() {
    previewUrl.value = editingPlayer.value ? editingPlayer.value.profile_image : null
}

watch(showForm, visible => {
    if (visible) {
        initPreview()                             // ← remet previewUrl
    } else if (previewUrl.value?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl.value)     // ← libère blob
    }
})


function onPickPhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    newPlayer.value.profile_image = file
    previewUrl.value = URL.createObjectURL(file)   // aperçu immédiat
}

function triggerFileSelect() {
    fileInputRef.value?.click()
}

const fileInputRef = ref(null)

/* ====== SNACKBAR ====== */
const snackbarMessage = ref('')
const snackbarVisible = ref(false)
const snackbarType = ref('success')

function showSnackbar(msg, type = 'success') {
    snackbarMessage.value = msg
    snackbarType.value = type
    snackbarVisible.value = true
    setTimeout(() => snackbarVisible.value = false, 3000)
}
</script>

<template>
    <!-- Snackbar -->
    <transition name="fade">
        <div v-if="snackbarVisible" class="snackbar" :class="snackbarType">
            {{ snackbarMessage }}
        </div>
    </transition>

    <!-- Modal Aperçu -->
    <transition name="fade">
        <div v-if="showImageModal" class="modal-overlay" @click="closeImageModal">
            <div class="modal" @click.stop>
                <img :src="modalImageUrl" class="modal-photo" v-if="modalImageUrl"/>
                <button class="btn-secondary" @click="closeImageModal">Fermer</button>
            </div>
        </div>
    </transition>

    <div class="admin-team-anager-container">
        <transition name="slide-left" mode="out-in">
            <!-- Table View -->
            <div v-if="!showForm" key="table">
                <h1 class="page-title" v-if="team">Mon Équipe : {{ team.club_name }}</h1>
                <p class="page-subtitle">Interface de gestion de l'équipe.</p>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Rechercher un joueur..."
                    class="search-input"
                />
                <GenericRankingTable
                    row_height="80"
                    :columns="columns"
                    :rows="filteredPlayers"
                    @click="handleTableClick"
                    width="100%"
                />
                <button class="table-button add" @click="showForm = true">
                    Ajouter un joueur
                </button>
            </div>

            <!-- Form View -->
            <div v-else key="form" class="full-form">
                <h2>{{ editingPlayer ? 'Modifier' : 'Ajouter' }} un Joueur</h2>
                <form @submit.prevent="submitPlayer" class="modal-form">

                    <!-- AVATAR + OVERLAY PENCIL -->
                    <div class="form-group photo-group">
                        <div class="avatar-wrapper" @click="triggerFileSelect">
                            <!-- soit l'image, soit des initiales -->
                            <img
                                v-if="previewUrl"
                                :src="previewUrl"
                                alt="avatar"
                                class="avatar-preview"
                            />
                            <div v-else class="avatar-initials--large">
                                {{ (newPlayer.first_name[0] || '') + (newPlayer.last_name[0] || '') }}
                            </div>

                            <!-- overlay crayon -->
                            <div class="avatar-overlay">
                                <svg viewBox="0 0 24 24" class="pencil-icon">
                                    <path
                                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71
               7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41
               0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <!-- input fichier caché -->
                        <input
                            ref="fileInputRef"
                            type="file"
                            accept="image/*"
                            class="file-hidden"
                            @change="onPickPhoto"
                        />
                    </div>

                    <!-- CHAMPS TEXTE NORMAUX -->
                    <div class="form-group"><label>Prénom *</label>
                        <input v-model="newPlayer.first_name" required/>
                    </div>
                    <div class="form-group"><label>Nom *</label>
                        <input v-model="newPlayer.last_name" required/>
                    </div>
                    <div class="form-group"><label>Civilité</label>
                        <select v-model="newPlayer.civility">
                            <option>Mr</option>
                            <option>Mme</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Email</label>
                        <input v-model="newPlayer.email" type="email"/>
                    </div>
                    <div class="form-group"><label>Date de naissance</label>
                        <input v-model="newPlayer.birth_date" type="date"/>
                    </div>

                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">{{
                                editingPlayer ? 'Enregistrer' : 'Ajouter'
                            }}
                        </button>
                        <button type="button" class="btn-secondary" @click="showForm = false">Annuler</button>
                    </div>
                </form>
            </div>
        </transition>
    </div>
</template>
