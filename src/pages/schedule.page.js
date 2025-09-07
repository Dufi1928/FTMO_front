// src/pages/schedule.page.js
import Schedule from '../views/Schedule/Schedule.vue'

// Option 1: laisser vps déduire le chemin depuis le nom du fichier (schedule.page.js => /schedule)
export { Page }
const Page = Schedule

// Option 2 (équivalente) : forcer la route avec une constante
// export const route = '/schedule'
// export { Page }
// const Page = Schedule
