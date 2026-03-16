<template>
  <header class="header">
    <nav class="nav">
      <router-link to="/" class="logo"> 🚀 Vibe Hackathon Platform </router-link>
      <div class="nav-links">
        <router-link to="/hackathons">해커톤</router-link>
        <router-link to="/camp">팀 모집</router-link>
        <router-link to="/rankings">랭킹</router-link>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 0; }
.nav { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
.logo { font-size: 1.4rem; font-weight: bold; text-decoration: none; color: white; }
.nav-links a { color: white; text-decoration: none; margin-left: 2rem; opacity: 0.9; }
.nav-links a:hover,
.nav-links a.router-link-active { opacity: 1; text-decoration: underline; }
@media (max-width: 768px) {
  .nav { flex-direction: column; gap: 1rem; }
  .nav-links { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
  .nav-links a { margin-left: 0; }
}
</style>