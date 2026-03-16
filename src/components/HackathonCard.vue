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
.card { background: linear-gradient(180deg, #fff, #f8fbff); border: 1px solid #dbe4f3; border-radius: 16px; padding: 1.2rem; text-decoration: none; color: #0f172a; display: block; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06); }
.card:hover { transform: translateY(-4px); box-shadow: 0 16px 28px rgba(37, 99, 235, 0.14); border-color: #c7d8f6; }
.top-row { display: flex; justify-content: space-between; align-items: start; gap: 1rem; }
h3 { margin: 0; font-size: 1.03rem; line-height: 1.35; }
.summary { color: #475569; margin: 0.7rem 0 0.9rem; min-height: 3em; }
.badge { border-radius: 999px; padding: 0.25rem 0.7rem; font-size: 0.8rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.badge.ongoing { background: #e8faef; color: #0f8c4b; }
.badge.upcoming { background: #eaf0ff; color: #2c55d8; }
.badge.closed { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
ul { padding: 0; list-style: none; margin: 0; display: grid; gap: 0.35rem; color: #334155; font-size: 0.94rem; }
</style>
