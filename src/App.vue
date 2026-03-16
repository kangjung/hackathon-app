<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <p>&copy; 2026 Vibe Hackathon Platform. Vercel 배포.</p>
    </footer>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
</script>
