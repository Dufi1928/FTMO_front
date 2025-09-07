<script setup>
import {ref, watch, onMounted} from 'vue'
import './ScheduleModal.css'

const props = defineProps({
    model: {type: Object, default: null},   // {id, weekday, start_time, end_time, categories[]}
})
const emit = defineEmits(['close', 'saved'])

const form = ref({
    id: null,
    weekday: 'mon',
    start_time: '',
    end_time: '',
    category_ids: [] // ✅ IDs, pas des objets
})

watch(() => props.model, (val) => {
    if (val) {
        form.value = {
            id: val.id ?? null,
            weekday: val.weekday ?? 'mon',
            start_time: (val.start_time || '').slice(0, 5), // "HH:MM"
            end_time: (val.end_time || '').slice(0, 5),
            category_ids: (val.categories || []).map(c => c.id) // ✅ extraire les ids
        }
    } else {
        form.value = {id: null, weekday: 'mon', start_time: '', end_time: '', category_ids: []}
    }
}, {immediate: true})

const weekdays = [
    {code: 'mon', label: 'Lundi'},
    {code: 'tue', label: 'Mardi'},
    {code: 'wed', label: 'Mercredi'},
    {code: 'thu', label: 'Jeudi'},
    {code: 'fri', label: 'Vendredi'},
    {code: 'sat', label: 'Samedi'},
    {code: 'sun', label: 'Dimanche'},
]

const categoriesOptions = ref([]) // [{id, code, label}]

async function loadCategories() {
    const res = await fetch('https://ftmo.bob-digital.com/api/audience-categories/', {
        headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`},
    })
    if (!res.ok) throw new Error('Impossible de charger les catégories')
    categoriesOptions.value = await res.json()
}

onMounted(loadCategories)

async function save() {
    const token = localStorage.getItem('accessToken')
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }

    const payload = {
        weekday: form.value.weekday,
        start_time: form.value.start_time, // "HH:MM"
        end_time: form.value.end_time,
        category_ids: form.value.category_ids,
    }

    const base = 'https://ftmo.bob-digital.com/api/schedules/'
    const url = form.value.id ? `${base}${form.value.id}/` : base
    const method = form.value.id ? 'PATCH' : 'POST'

    const res = await fetch(url, {method, headers, body: JSON.stringify(payload)})
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Erreur lors de la sauvegarde du créneau')
    }

    const saved = await res.json()
    emit('saved', saved) // ✅ renvoyer l’objet retourné par l’API
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
                    <input type="time" v-model="form.start_time" required/>
                </div>

                <div class="form-group">
                    <label>Fin</label>
                    <input type="time" v-model="form.end_time" required/>
                </div>

                <div class="form-group">
                    <label>Catégories</label>
                    <select v-model="form.category_ids" multiple>
                        <option v-for="c in categoriesOptions" :key="c.id" :value="c.id">
                            {{ c.label }}
                        </option>
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
