<template>
  <section class="leaderboard">
    <div class="hero">
      <div>
        <p class="eyebrow">RANKING CENTER</p>
        <h1>랭킹 대시보드</h1>
        <p>전체/기간별/해커톤별 순위를 한 번에 비교해보세요.</p>
      </div>

      <div class="controls">
        <select v-model="mode" :disabled="Boolean(targetSlug)">
          <option value="overall">종합 팀 랭킹</option>
          <option value="entry">제출 점수 랭킹</option>
        </select>
        <select v-model="period" :disabled="Boolean(targetSlug) || mode === 'overall'">
          <option value="all">전체 기간</option>
          <option value="7d">최근 7일</option>
          <option value="30d">최근 30일</option>
        </select>
      </div>
    </div>

    <p v-if="targetSlug" class="target">🎯 대상 해커톤: {{ targetSlug }}</p>

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

    <template v-else-if="rows.length">
      <div class="podium" v-if="topThree.length">
        <article v-for="(entry, index) in topThree" :key="entry.teamCode" class="podium-card">
          <p class="place">#{{ index + 1 }}</p>
          <h3>{{ entry.teamName }}</h3>
          <p class="score">{{ mode === 'overall' ? `${entry.totalPoints}점` : `${entry.points}점` }}</p>
        </article>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr v-if="mode === 'overall'">
              <th>순위</th>
              <th>팀</th>
              <th>누적 점수</th>
              <th>평균 점수</th>
              <th>참여 해커톤</th>
            </tr>
            <tr v-else>
              <th>순위</th><th>팀</th><th>점수</th><th>해커톤</th><th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in rows" :key="`${entry.teamCode}-${entry.hackathonSlug || index}`">
              <template v-if="mode === 'overall'">
                <td>{{ index + 1 }}</td>
                <td>{{ entry.teamName }}</td>
                <td>{{ entry.totalPoints }}</td>
                <td>{{ entry.averagePoints }}</td>
                <td>{{ entry.hackathonCount }}</td>
              </template>
              <template v-else>
                <td>{{ entry.pending ? '-' : index + 1 }}</td>
                <td>{{ entry.teamName }}</td>
                <td>{{ entry.pending ? '-' : entry.points }}</td>
                <td>{{ entry.hackathonSlug }}</td>
                <td>{{ entry.pending ? '미제출' : '제출완료' }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

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
const mode = ref('overall')

onMounted(() => {
  store.loadData()
})

const targetSlug = computed(() => route.params.slug)
const rows = computed(() => {
  if (targetSlug.value) return store.getLeaderboardByHackathon(targetSlug.value)
  if (mode.value === 'overall') return store.getOverallTeamRankings()
  return store.getRankingsByPeriod(period.value)
})

const topThree = computed(() => rows.value.slice(0, 3).filter((entry) => !entry.pending))
</script>

<style scoped>
.leaderboard { max-width: 1100px; margin: 2rem auto; padding: 0 1rem; }
.hero { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
.eyebrow { margin: 0; font-size: 0.75rem; color: #90a7ff; letter-spacing: 0.1em; font-weight: 700; }
h1 { margin: 0.2rem 0 0.35rem; }
.target { color: #b4c2fb; margin: 0 0 1rem; }
.controls { display: flex; gap: 0.5rem; align-items: start; }
select {
  border: 1px solid rgba(141, 165, 255, 0.45);
  border-radius: 12px;
  padding: 0.6rem;
  background: rgba(11, 19, 52, 0.8);
  color: #dfe7ff;
}
.podium { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.8rem; margin-bottom: 1rem; }
.podium-card {
  border: 1px solid rgba(144, 166, 255, 0.28);
  border-radius: 14px;
  background: rgba(10, 16, 44, 0.75);
  padding: 0.9rem;
}
.place { margin: 0; color: #89a2ff; font-weight: 700; }
.score { margin: 0; color: #ffdd8d; font-weight: 700; }
.table-wrap { overflow: auto; border-radius: 14px; border: 1px solid rgba(141, 165, 255, 0.2); }
table { width: 100%; border-collapse: collapse; background: rgba(7, 12, 34, 0.86); }
th, td { border-bottom: 1px solid rgba(141, 165, 255, 0.15); padding: 0.75rem; text-align: left; }
th { color: #9eb3ff; font-weight: 600; }
@media (max-width: 768px) {
  .podium { grid-template-columns: 1fr; }
}
</style>
