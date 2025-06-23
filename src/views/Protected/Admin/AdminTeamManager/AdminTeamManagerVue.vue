<script setup>
import './AdminTeamManager.css'
import GenericRankingTable from '../../../../components/GenericRankingTable/GenericRankingTable.vue'
import { ref, onMounted, computed } from 'vue'


const team = ref(null)
const showForm = ref(false)
const editingPlayer = ref(null)

const newPlayer = ref({
    first_name: '',
    last_name: '',
    civility: 'Mr',
    email: '',
    birth_date: '',
})

function resetForm() {
    editingPlayer.value = null
    newPlayer.value = {
        first_name: '',
        last_name: '',
        civility: 'Mr',
        email: '',
        birth_date: '',
    }
}

async function fetchTeam() {
    const token = localStorage.getItem('accessToken')
    try {
        const res = await fetch('https://ftmo.bob-digital.com/api/teams/my_team/', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        if (!res.ok) throw new Error('Erreur lors de la récupération de l\'équipe')
        let teamsss = await res.json()
        team.value = await teamsss.team
    } catch (err) {
        showSnackbar(err.message, 'error')
    }
}

onMounted(async () => {
    await fetchTeam()
})

function handleEdit(player) {
    editingPlayer.value = player
    newPlayer.value = { ...player }
    showForm.value = true
}

async function handleDelete(player) {
    if (!confirm(`Supprimer ${player.first_name} ${player.last_name} ?`)) return
    const token = localStorage.getItem('accessToken')
    try {
        const res = await fetch(`https://ftmo.bob-digital.com/api/players/${player.id}/`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (!res.ok) throw new Error('Erreur lors de la suppression')
        showSnackbar('Joueur supprimé avec succès', 'success')
        await fetchTeam()
    } catch (err) {
        showSnackbar(err.message, 'error')
    }
}

async function submitPlayer() {
    const token = localStorage.getItem('accessToken')
    const url = editingPlayer.value
        ? `https://ftmo.bob-digital.com/api/players/${editingPlayer.value.id}/`
        : 'https://ftmo.bob-digital.com/api/players/'

    const method = editingPlayer.value ? 'PUT' : 'POST'

    try {
        const res = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...newPlayer.value,
                team: team.value.id
            })
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.detail || 'Erreur lors de la sauvegarde')
        }
        showSnackbar('Joueur mis a jour avec succès', 'success')

        showForm.value = false
        resetForm()
        await fetchTeam()
    } catch (err) {
        showSnackbar(err.message, 'error')
    }
}

// Gestion des clics dans le tableau pour les boutons HTML injectés
function handleTableClick(event) {
    const target = event.target
    const action = target.dataset.action
    const id = parseInt(target.dataset.id)

    if (!action || isNaN(id)) return

    const player = team.value.players.find(p => p.id === id)
    if (!player) return

    if (action === 'edit') {
        handleEdit(player)
    } else if (action === 'delete') {
        handleDelete(player)
    }
}

const columns = [
    { field: 'first_name', label: 'Prénom', pinned: true },
    { field: 'last_name', label: 'Nom' },
    { field: 'civility', label: 'Civilité' },
    { field: 'email', label: 'Email' },
    { field: 'birth_date', label: 'Date de naissance' },
    {
        field: 'actions',
        label: 'Actions',
        html: (row) => `
      <button class="table-button edit" data-id="${row.id}" data-action="edit">Modifier</button>
      <button class="table-button delete" data-id="${row.id}" data-action="delete">Supprimer</button>
    `
    }
]
const searchQuery = ref('')

const filteredPlayers = computed(() => {
    if (!team.value || !searchQuery.value.trim()) return team.value?.players || []
    const q = searchQuery.value.toLowerCase()
    return team.value.players.filter(player =>
        Object.values(player).some(val =>
            String(val).toLowerCase().includes(q)
        )
    )
})
const snackbarMessage = ref('')
const snackbarVisible = ref(false)
const snackbarType = ref('success') // 'success' | 'error'

function showSnackbar(message, type = 'success') {
    snackbarMessage.value = message
    snackbarType.value = type
    snackbarVisible.value = true
    setTimeout(() => {
        snackbarVisible.value = false
    }, 3000)
}


</script>

<template>
    <transition name="fade">
        <div v-if="snackbarVisible" class="snackbar" :class="snackbarType">
            {{ snackbarMessage }}
        </div>
    </transition>

    <div class="admin-team-anager-container">
        <transition name="slide-left" mode="out-in">
            <div v-if="!showForm" key="table-view">
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
                <button class="table-button add" @click="showForm = true">Ajouter un joueur</button>
            </div>

            <div v-else key="form-view" class="full-form">
                <h2>{{ editingPlayer ? 'Modifier' : 'Ajouter' }} un Joueur</h2>
                <form @submit.prevent="submitPlayer" class="modal-form">
                    <input v-model="newPlayer.first_name" placeholder="Prénom" required />
                    <input v-model="newPlayer.last_name" placeholder="Nom" required />
                    <select v-model="newPlayer.civility">
                        <option>Mr</option>
                        <option>Mme</option>
                    </select>
                    <input v-model="newPlayer.email" placeholder="Email" type="email" />
                    <input v-model="newPlayer.birth_date" type="date" />
                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">
                            {{ editingPlayer ? 'Enregistrer' : 'Ajouter' }}
                        </button>
                        <button type="button" @click="showForm = false" class="btn-secondary">
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </transition>
    </div>
</template>
