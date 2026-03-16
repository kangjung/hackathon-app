<template>
  <section class="leaderboard">
    <div class="header-row">
      <div>
        <h1>{{ targetSlug ? '해커톤 리더보드' : '글로벌 랭킹' }}</h1>
        <p>{{ targetSlug ? '해당 해커톤 참가 팀의 제출/미제출 현황입니다.' : '전체 해커톤 기록 기준 유저(팀) 랭킹입니다.' }}</p>
      </div>

      <select v-if="!targetSlug" v-model="period">
        <option value="all">전체</option>
        <option value="7d">최근 7일</option>
        <option value="30d">최근 30일</option>
      </select>
    </div>

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

    <div class="table-wrap" v-else-if="rows.length">
      <table>
        <thead>
          <tr v-if="targetSlug">
            <th>순위</th>
            <th>닉네임</th>
            <th>points</th>
            <th>상태</th>
          </tr>
          <tr v-else>
            <th>rank</th>
            <th>nickname</th>
            <th>points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in rows" :key="`${entry.teamCode}-${index}`">
            <template v-if="targetSlug">
              <td>{{ entry.pending ? '-' : index + 1 }}</td>
              <td>{{ entry.teamName }}</td>
              <td>{{ entry.pending ? '-' : entry.points }}</td>
              <td>{{ entry.pending ? '미제출' : '제출완료' }}</td>
            </template>
            <template v-else>
              <td>{{ index + 1 }}</td>
              <td>{{ entry.nickname }}</td>
              <td>{{ entry.points }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

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
  return store.getGlobalRankings(period.value)
})
</script>

<style scoped>
.leaderboard { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
.header-row { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; }
h1 { margin: 0; color: #0f172a; }
p { margin: 0.35rem 0 0; color: #64748b; }
select { border: 1px solid #d0d8e6; border-radius: 12px; padding: 0.58rem 0.7rem; background: #fff; }
.table-wrap { overflow: auto; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #edf2f7; }
th { color: #475569; font-weight: 700; }
</style>
