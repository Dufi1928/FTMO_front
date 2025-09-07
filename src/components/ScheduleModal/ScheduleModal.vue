<script setup>
import { ref, watch } from 'vue'
import './ScheduleModal.css'

// Props : modèle existant (ou null) + callbacks
const props = defineProps({
    model: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

// Formulaire local (copie du modèle)
const form = ref({
    id: null,
    weekday: 'mon',
    start_time: '',
    end_time: '',
    categories: []
})

// Quand on reçoit un modèle → préremplir
watch(() => props.model, (val) => {
    if (val) form.value = { ...val }
    else {
        form.value = {
            id: null,
            weekday: 'mon',
            start_time: '',
            end_time: '',
            categories: []
        }
    }
}, { immediate: true })

// Map des jours
const weekdays = [
    { code: 'mon', label: 'Lundi' },
    { code: 'tue', label: 'Mardi' },
    { code: 'wed', label: 'Mercredi' },
    { code: 'thu', label: 'Jeudi' },
    { code: 'fri', label: 'Vendredi' },
    { code: 'sat', label: 'Samedi' },
    { code: 'sun', label: 'Dimanche' },
]

// Simples catégories pour démo
const categoriesOptions = [
    { code: 'junior', label: 'Jeunes / Juniors' },
    { code: 'senior', label: 'Adultes / Séniors' },
    { code: 'veteran', label: 'Vétérans' },
]

// Sauvegarde → remonte l’évènement
function save() {
    emit('saved', { ...form.value })
}
</script>

<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <h2>{{ form.id ? 'Modifier' : 'Ajouter' }} un créneau</h2>

            <form @submit.prevent="save" class="form">
                <div class="form-group">
                    <label>Jour</label>
                    <select v-model="form.weekday">
                        <option v-for="d in weekdays" :key="d.code" :value="d.code">{{ d.label }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Début</label>
                    <input type="time" v-model="form.start_time" required />
                </div>

                <div class="form-group">
                    <label>Fin</label>
                    <input type="time" v-model="form.end_time" required />
                </div>

                <div class="form-group">
                    <label>Catégorie</label>
                    <select v-model="form.categories" multiple>
                        <option v-for="c in categoriesOptions" :key="c.code" :value="c">{{ c.label }}</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" @click="$emit('close')">Annuler</button>
                    <button type="submit" class="btn-primary">Enregistrer</button>
                </div>
            </form>
        </div>
    </div>
</template>

