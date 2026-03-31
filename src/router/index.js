import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import HackathonsList from '../views/HackathonsList.vue'
import HackathonDetail from '../views/HackathonDetail.vue'
import Leaderboard from '../views/Leaderboard.vue'
import Teams from '../views/Teams.vue'
import Auth from '../views/Auth.vue'
import MyProfile from '../views/MyProfile.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', component: Home },
  { path: '/hackathons', component: HackathonsList },
  { path: '/hackathons/:slug', component: HackathonDetail, props: true },
  { path: '/hackathons/:slug/leaderboard', component: Leaderboard, props: true },
  { path: '/rankings', component: Leaderboard },
  { path: '/teams', component: Teams },
  { path: '/teams/:teamCode', component: Teams, props: true },
  { path: '/camp', redirect: (to) => ({ path: '/teams', query: to.query }) },
  { path: '/auth', component: Auth },
  { path: '/me', component: MyProfile, meta: { requiresLogin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (!to.meta.requiresLogin) return true

  const authStore = useAuthStore()
  if (authStore.isLoggedIn) return true

  return {
    path: '/auth',
    query: {
      redirect: to.fullPath,
      reason: 'login_required'
    }
  }
})

export default router
