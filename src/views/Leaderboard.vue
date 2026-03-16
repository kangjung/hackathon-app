<template>
  <section class="leaderboard">
    <h1>리더보드</h1>
    <p v-if="targetSlug">대상 해커톤: {{ targetSlug }}</p>
    <table>
      <thead>
        <tr><th>순위</th><th>팀</th><th>점수</th><th>해커톤</th></tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in rows" :key="`${entry.hackathonSlug}-${entry.teamCode}`">
          <td>{{ index + 1 }}</td>
          <td>{{ entry.teamName }}</td>
          <td>{{ entry.points }}</td>
          <td>{{ entry.hackathonSlug }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHackathonStore } from '../stores/hackathon'

const route = useRoute()
const store = useHackathonStore()

onMounted(() => {
  if (!store.leaderboards.length) store.loadData()
})

const targetSlug = computed(() => route.params.slug)
const rows = computed(() => {
  if (targetSlug.value) return store.getLeaderboardByHackathon(targetSlug.value)
  return [...store.leaderboards].sort((a, b) => b.points - a.points)
})
</script>

<style scoped>
.leaderboard { max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
table { width: 100%; border-collapse: collapse; background: #fff; }
th, td { border-bottom: 1px solid #e6e8ef; padding: 0.7rem; text-align: left; }
</style>
