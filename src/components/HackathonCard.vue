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
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.2rem; text-decoration: none; color: #0f172a; display: block; transition: transform 0.18s ease; }
.card:hover { transform: translateY(-3px); }
.top-row { display: flex; justify-content: space-between; align-items: start; gap: 1rem; }
h3 { margin: 0; }
.summary { color: #475569; }
.badge { border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.8rem; }
.badge.ongoing { background: #e8faef; color: #0f8c4b; }
.badge.upcoming { background: #eaf0ff; color: #2c55d8; }
.badge.closed { background: #f1f5f9; color: #475569; }
ul { padding: 0; list-style: none; margin: 1rem 0 0; display: grid; gap: 0.3rem; color: #334155; }
</style>
