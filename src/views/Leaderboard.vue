<template>
  <section class="leaderboard">
    <div class="header-row">
      <h1>리더보드</h1>
      <select v-model="period" :disabled="Boolean(targetSlug)">
        <option value="all">전체</option>
        <option value="7d">최근 7일</option>
        <option value="30d">최근 30일</option>
      </select>
    </div>

    <p v-if="targetSlug">대상 해커톤: {{ targetSlug }}</p>

    <StatusState
      v-if="store.isLoading"
      type="loading"
      message="리더보드를 불러오는 중입니다..."
    />
    <StatusState
      v-else-if="store.error"
      type="error"
      :message="`오류: ${store.error}`"
      @retry="store.loadData({ force: true })"
    />

    <table v-else-if="rows.length">
      <thead>
        <tr><th>순위</th><th>팀</th><th>점수</th><th>해커톤</th><th>상태</th></tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in rows" :key="`${entry.hackathonSlug}-${entry.teamCode}`">
          <td>{{ entry.pending ? '-' : index + 1 }}</td>
          <td>{{ entry.teamName }}</td>
          <td>{{ entry.pending ? '-' : entry.points }}</td>
          <td>{{ entry.hackathonSlug }}</td>
          <td>{{ entry.pending ? '미제출' : '제출완료' }}</td>
        </tr>
      </tbody>
    </table>

    <StatusState v-else type="empty" message="표시할 랭킹 데이터가 없습니다." />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHackathonStore } from '../stores/hackathon'
import StatusState from '../components/StatusState.vue'

const route = useRoute()
const store = useHackathonStore()
const period = ref('all')

onMounted(() => {
  store.loadData()
})

const targetSlug = computed(() => route.params.slug)
const rows = computed(() => {
  if (targetSlug.value) return store.getLeaderboardByHackathon(targetSlug.value)
  return store.getRankingsByPeriod(period.value)
})
</script>

<style scoped>
.leaderboard { max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
select { border: 1px solid #d0d5dd; border-radius: 10px; padding: 0.5rem; }
table { width: 100%; border-collapse: collapse; background: #fff; }
th, td { border-bottom: 1px solid #e6e8ef; padding: 0.7rem; text-align: left; }
</style>
