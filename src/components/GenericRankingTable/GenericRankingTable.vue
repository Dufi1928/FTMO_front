<template>
    <div class="ranking-table-container">
        <!-- Si vous souhaitez conserver un SectionHeader, vous pouvez le réactiver ici -->
        <!--
        <SectionHeader
          v-if="title || linkText"
          :background="background"
          :title="title"
          :linkText="linkText"
          :linkUrl="linkUrl"
        />
        -->

        <div class="ranking-table-wrapper"  id="rank-scroll" :style="{ width }">
            <!-- Bloc « pinned » : colonnes marquées pinned = true -->
            <div class="rank-pinned">
                <table class="ranking-table ranking-left">
                    <thead>
                    <tr class="ranking-table-row row-height-50" >
                        <th v-for="col in pinnedColumns" :key="col.field">
                            {{ col.label }}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(row, rowIndex) in sortedRows" :key="rowIndex" :class="rowHeightClass">
                        <td
                            v-for="col in pinnedColumns"
                            :key="col.field"
                            :class="computeCellClass(col, row)"
                            :style="computeCellStyle(col)"
                        >
                            <span v-if="col.html" v-html="col.html(row)" />
                            <span v-else-if="col.formatter">
            {{ col.formatter(row[col.field], row) }}
          </span>
                            <span v-else>
            {{ row[col.field] }}
          </span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <!-- Bloc « scrollable » : colonnes non pinnées -->
            <div class="rank-scroll">
                <table class="ranking-table ranking-main">
                    <thead>
                    <tr class="ranking-table-row row-height-50"  >
                        <th
                            v-for="col in scrollableColumns"
                            :key="col.field"
                            @click="col.sortable ? sortBy(col.field) : null"
                            :class="{ sortable: col.sortable }"
                        >
                            {{ col.label }}
                            <span v-if="col.sortable && sortKey === col.field">
            {{ sortAsc ? '▲' : '▼' }}
          </span>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(row, rowIndex) in sortedRows" :key="rowIndex" :class="rowHeightClass">
                        <td
                            v-for="col in scrollableColumns"
                            :key="col.field"
                            :class="computeCellClass(col, row)"
                            :style="computeCellStyle(col)"
                        >
                            <span v-if="col.html" v-html="col.html(row)" />
                            <span v-else-if="col.formatter">
            {{ col.formatter(row[col.field], row) }}
          </span>
                            <span v-else>
            {{ row[col.field] }}
          </span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, defineProps, ref } from 'vue'
import './GenericRankingTable.css'

const props = defineProps({
    // Chaque colonne peut maintenant comporter, en plus de field/label/pinned/sortable/formatter :
    //   - color      : string CSS (ex. '#12B221' ou 'green'), qui sera passée en style sur le <td>
    //   - cellClass  : string (nom de classe CSS), qui sera appliqué au <td>

    columns: {
        type: Array,
        required: true,
        default: () => []
    },
    rows: {
        type: Array,
        required: true,
        default: () => []
    },
    // Props optionnelles pour un éventuel header
    title: {
        type: String,
        default: ''
    },
    row_height: {
        type: String,
        default: '70'
    },
    linkText: {
        type: String,
        default: ''
    },
    linkUrl: {
        type: String,
        default: ''
    },
    background: {
        type: String,
        default: '#FFFFFF'
    },
    width: {
        type: String,
        default: '80%'  // largeur par défaut
    }
})
const rowHeightClass = computed(() => `row-height-${props.row_height.replace('px', '')}`)

// --- TRI ---
const sortKey = ref(null)
const sortAsc = ref(true)

function sortBy(field) {
    if (sortKey.value === field) {
        sortAsc.value = !sortAsc.value
    } else {
        sortKey.value = field
        sortAsc.value = true
    }
}

// Colonnes « pinned » (fixes à gauche). Si aucune n'est marquée, on prend la première.
const pinnedColumns = computed(() => {
    const pin = props.columns.filter(c => c.pinned)
    return pin.length ? pin : [props.columns[0]]
})

// Colonnes scrollables (toutes les autres)
const scrollableColumns = computed(() =>
    props.columns.filter(c => !pinnedColumns.value.includes(c))
)

// Lignes triées dynamiquement (ou non si sortKey est null)
const sortedRows = computed(() => {
    if (!sortKey.value) {
        return props.rows
    }
    return [...props.rows].sort((a, b) => {
        const va = a[sortKey.value]
        const vb = b[sortKey.value]
        if (typeof va === 'number' && typeof vb === 'number') {
            return sortAsc.value ? va - vb : vb - va
        }
        const sa = va ? String(va).toLowerCase() : ''
        const sb = vb ? String(vb).toLowerCase() : ''
        if (sa < sb) return sortAsc.value ? -1 : 1
        if (sa > sb) return sortAsc.value ? 1 : -1
        return 0
    })
})

// Calcul d'une classe CSS additionnelle en fonction de la colonne et de la valeur row[col.field]
// Vous pouvez y garder vos règles existantes, ou les adapter.
function computeCellClass(col, row) {
    // Exemple : si vous voulez colorer en vert tout « set win » positif
    // et en rouge tout negatif sur un champ nommé exactement 'diff'
    if (col.field === 'diff') {
        return row.diff > 0 ? 'positive' : row.diff < 0 ? 'negative' : ''
    }
    // Ici, si la colonne définit une cellClass, on l'ajoute
    if (col.cellClass) {
        return col.cellClass
    }
    return ''
}

// Calcul du style inline pour la cellule, basé sur col.color
function computeCellStyle(col) {
    return col.color ? { color: col.color } : {}
}


</script>
