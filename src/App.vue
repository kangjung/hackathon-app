<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <p>© {{ currentYear }} Vibe Hackathon Platform · Discover, build, and win together.</p>
    </footer>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'

const currentYear = new Date().getFullYear()
</script>
