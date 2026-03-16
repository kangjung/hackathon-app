import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import HackathonsList from '../views/HackathonsList.vue'
import HackathonDetail from '../views/HackathonDetail.vue'
import Leaderboard from '../views/Leaderboard.vue'
import Teams from '../views/Teams.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/hackathons', component: HackathonsList },
  { path: '/hackathons/:slug', component: HackathonDetail, props: true },
  { path: '/hackathons/:slug/leaderboard', component: Leaderboard, props: true },
  { path: '/rankings', component: Leaderboard },
  { path: '/teams', component: Teams },
  { path: '/teams/:teamCode', component: Teams, props: true },
  { path: '/camp', component: Teams }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
