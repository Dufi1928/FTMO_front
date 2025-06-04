import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/Login/LoginView.vue'
import DashboardView from '../views/Protected/Admin/Dashboard/DashboardView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/protected/admin/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
