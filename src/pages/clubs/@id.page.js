export { Page, passToClient }

import ClubDetail from '../../views/Club/ClubDetailView.vue'
const Page = ClubDetail

const passToClient = ['routeParams'] // ✅ uniquement ce dont tu as besoin
