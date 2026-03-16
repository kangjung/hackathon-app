<template>
  <router-link :to="`/hackathons/${hackathon.slug}`" class="card">
    <div class="top-row">
      <h3>{{ hackathon.title }}</h3>
      <span class="badge" :class="hackathon.status">{{ hackathon.statusLabel }}</span>
    </div>
    <p class="summary">{{ hackathon.summary }}</p>
    <ul>
      <li>🗓 {{ hackathon.startDate }} ~ {{ hackathon.endDate }}</li>
      <li>🏷 {{ hackathon.tags.join(', ') || '태그 없음' }}</li>
      <li>👥 {{ hackathon.participants }}명 참여</li>
    </ul>
  </router-link>
</template>

<script setup>
defineProps({
  hackathon: { type: Object, required: true }
})
</script>

<style scoped>
.card {
  background: linear-gradient(160deg, rgba(9, 18, 51, 0.95), rgba(12, 24, 65, 0.85));
  border: 1px solid rgba(146, 170, 255, 0.24);
  border-radius: 16px;
  padding: 1.2rem;
  text-decoration: none;
  color: #e5edff;
  display: block;
  transition: transform 0.18s ease;
}
.card:hover { transform: translateY(-3px); }
.top-row { display: flex; justify-content: space-between; align-items: start; gap: 1rem; }
h3 { margin: 0; }
.summary { color: #b5c4fc; }
.badge { border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.8rem; }
.badge.ongoing { background: #163f35; color: #74f5be; }
.badge.upcoming { background: #1e3367; color: #9dc2ff; }
.badge.closed { background: #32374d; color: #c1c6da; }
ul { padding: 0; list-style: none; margin: 1rem 0 0; display: grid; gap: 0.3rem; color: #cbd8ff; }
</style>
