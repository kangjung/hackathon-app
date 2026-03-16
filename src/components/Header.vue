<template>
  <header class="header">
    <nav class="nav">
      <router-link to="/" class="logo">🚀 Vibe Hackathon</router-link>
      <div class="nav-links">
        <router-link to="/hackathons">해커톤</router-link>
        <router-link to="/camp">팀 모집</router-link>
        <router-link to="/rankings">랭킹</router-link>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid rgba(146, 169, 255, 0.22);
  background: rgba(5, 10, 33, 0.78);
  backdrop-filter: blur(14px);
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.2rem;
}

.logo {
  font-size: 1.2rem;
  font-weight: 800;
  text-decoration: none;
  color: #f6f7ff;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-links a {
  color: #c8d4ff;
  text-decoration: none;
  padding: 0.48rem 0.85rem;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #fff;
  background: rgba(120, 145, 255, 0.22);
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 0.8rem;
  }
}
</style>
