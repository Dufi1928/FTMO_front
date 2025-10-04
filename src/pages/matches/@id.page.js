export { Page, passToClient }

import matchDetails from '../../views/MatchesResultsDetails/MatchResultsDetails.vue'
const Page = matchDetails

const passToClient = ['routeParams'] // ✅ uniquement ce dont tu as besoin
