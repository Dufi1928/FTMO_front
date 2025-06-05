import { createApp } from 'vue'
import { createPinia } from 'pinia'
import HomeView from './views/Home/HomeView.vue'

const app = createApp(HomeView)
app.use(createPinia())
app.mount('#app')
