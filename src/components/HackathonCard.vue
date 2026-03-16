<template>
  <router-link :to="`/hackathons/${hackathon.slug}`" class="card">
    <div class="top-row">
      <h3>{{ hackathon.title }}</h3>
      <span class="badge" :class="hackathon.status">{{ hackathon.statusLabel }}</span>
    </div>
    <p>{{ hackathon.summary }}</p>
    <ul>
      <li>🗓 {{ hackathon.startDate }} ~ {{ hackathon.endDate }}</li>
      <li>🏷 {{ hackathon.tags.join(', ') }}</li>
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
.card { background: #fff; border-radius: 16px; padding: 1.2rem; box-shadow: 0 8px 22px rgba(20, 20, 80, 0.08); text-decoration: none; color: #222; display: block; }
.top-row { display: flex; justify-content: space-between; align-items: start; gap: 1rem; }
.badge { border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.8rem; }
.badge.ongoing { background: #e7f7ee; color: #0f8c4b; }
.badge.upcoming { background: #edf3ff; color: #275ad9; }
.badge.closed { background: #f2f2f2; color: #555; }
ul { padding: 0; list-style: none; margin: 1rem 0 0; display: grid; gap: 0.3rem; color: #444; }
</style>