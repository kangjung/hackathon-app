<template>
  <header class="header">
    <nav class="nav">
      <router-link to="/" class="logo">🚀 Vibe Hackathon</router-link>
      <div class="nav-links">
        <router-link to="/hackathons">해커톤</router-link>
        <router-link to="/teams">팀 찾기</router-link>
        <router-link to="/rankings">랭킹</router-link>
        <router-link to="/me">내 정보</router-link>
        <router-link v-if="!authStore.isLoggedIn" to="/auth" class="auth-link">로그인 / 회원가입</router-link>
        <template v-else>
          <span class="session-badge" :class="authStore.isAdmin ? 'admin' : 'user'">
            {{ authStore.isAdmin ? '운영자 로그인' : `${authStore.currentUser?.nickname || authStore.currentUser?.id} 님` }}
          </span>
          <button class="logout" @click="onLogout">로그아웃</button>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const onLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid #dbe4f6;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
}
.nav { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.2rem; }
.logo { font-size: 1.2rem; font-weight: 800; text-decoration: none; color: #1d2c62; }
.nav-links { display: flex; gap: 0.5rem; align-items: center; }
.nav-links a, .logout { color: #334155; text-decoration: none; padding: 0.48rem 0.85rem; border-radius: 999px; transition: all 0.2s ease; border: none; background: transparent; font-size: 1rem; cursor: pointer; }
.nav-links a:hover, .nav-links a.router-link-active, .logout:hover { color: #1e3a8a; background: #e9efff; }
.auth-link { background: #eef2ff; color: #312e81; font-weight: 700; }
.session-badge { font-size: 0.82rem; font-weight: 700; border-radius: 999px; padding: 0.4rem 0.7rem; }
.session-badge.user { background: #dcfce7; color: #166534; }
.session-badge.admin { background: #fee2e2; color: #991b1b; }
@media (max-width: 768px) { .nav { flex-direction: column; gap: 0.8rem; } }
</style>
