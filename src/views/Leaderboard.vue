<template>
  <section class="leaderboard">
    <div class="header-row">
      <div>
        <h1>{{ targetSlug ? '해커톤 리더보드' : '글로벌 랭킹' }}</h1>
        <p>{{ subtitle }}</p>
      </div>

      <div class="controls" v-if="targetSlug">
        <input v-model="teamKeyword" placeholder="팀 이름 검색" />
        <select v-model="sortMode">
          <option value="score">점수 높은 순</option>
          <option value="name">팀명 순</option>
        </select>
      </div>

      <div class="controls" v-else>
        <select v-model="selectedHackathonSlug">
          <option value="all">전체 해커톤</option>
          <option
            v-for="hackathon in hackathonOptions"
            :key="hackathon.slug"
            :value="hackathon.slug"
          >
            {{ hackathon.title }}
          </option>
        </select>
        <select v-model="period" :disabled="selectedHackathonSlug !== 'all'">
          <option value="all">전체</option>
          <option value="7d">최근 7일</option>
          <option value="30d">최근 30일</option>
        </select>
      </div>
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
            <th>팀명</th>
            <th>점수</th>
            <th>상태</th>
            <th v-if="authStore.isAdmin">평가자 점수</th>
            <th v-if="authStore.isAdmin">참가자 점수</th>
            <th v-if="authStore.isAdmin">웹 URL</th>
            <th v-if="authStore.isAdmin">PDF</th>
          </tr>
          <tr v-else>
            <th>순위</th>
            <th>닉네임</th>
            <th>포인트</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in rows" :key="`${entry.teamCode}-${entry.rank}`">
            <template v-if="targetSlug">
              <td>{{ entry.pending ? '제출 전' : entry.rank }}</td>
              <td>{{ entry.teamName }}</td>
              <td>{{ entry.pending ? '점수 미산출' : entry.points }}</td>
              <td>{{ entry.pending ? '미제출' : '제출완료' }}</td>
              <td v-if="authStore.isAdmin">{{ entry.submission?.evaluatorScore ?? '-' }}</td>
              <td v-if="authStore.isAdmin">{{ entry.submission?.participantScore ?? '-' }}</td>
              <td v-if="authStore.isAdmin">
                <a v-if="entry.submission?.webUrl" :href="entry.submission.webUrl" target="_blank" rel="noreferrer">바로가기</a>
                <span v-else>-</span>
              </td>
              <td v-if="authStore.isAdmin">
                <a v-if="entry.submission?.pdfUrl" :href="entry.submission.pdfUrl" target="_blank" rel="noreferrer">다운로드</a>
                <span v-else>-</span>
              </td>
            </template>
            <template v-else>
              <td>{{ entry.rank }}</td>
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
import { useAuthStore } from '../stores/auth'
import StatusState from '../components/StatusState.vue'

const route = useRoute()
const store = useHackathonStore()
const authStore = useAuthStore()
const period = ref('all')
const teamKeyword = ref('')
const sortMode = ref('score')
const selectedHackathonSlug = ref('all')

onMounted(() => {
  store.loadData()
})

const targetSlug = computed(() => route.params.slug)
const subtitle = computed(() => {
  if (!targetSlug.value) {
    if (selectedHackathonSlug.value !== 'all') {
      const selected = store.hackathons.find((item) => item.slug === selectedHackathonSlug.value)
      return `${selected?.title || '선택한 해커톤'} 참가 팀 랭킹입니다.`
    }
    return '전체 해커톤 기록 기준 유저(팀) 랭킹입니다.'
  }
  if (authStore.isAdmin) {
    return '운영자 모드: 점수 정렬, 평가자/참가자 점수 비교, 제출 링크 검토가 가능합니다.'
  }
  return '참가 팀의 제출 현황과 점수를 확인할 수 있습니다.'
})

const hackathonOptions = computed(() =>
  [...store.hackathons].sort((a, b) => a.title.localeCompare(b.title, 'ko'))
)

const rows = computed(() => {
  if (!targetSlug.value) {
    if (selectedHackathonSlug.value !== 'all') {
      const selectedRows = store.getLeaderboardByHackathon(selectedHackathonSlug.value)
      let rank = 0
      return selectedRows.map((entry) => {
        if (!entry.pending) rank += 1
        return {
          ...entry,
          rank: entry.pending ? '-' : rank,
          nickname: entry.teamName || entry.teamCode
        }
      })
    }
    return store.getGlobalRankings(period.value).map((entry, index) => ({ ...entry, rank: index + 1 }))
  }

  const keyword = teamKeyword.value.trim().toLowerCase()
  const base = store.getLeaderboardByHackathon(targetSlug.value)
    .map((entry) => ({
      ...entry,
      submission: store.getSubmissionByTeam({
        hackathonSlug: targetSlug.value,
        teamCode: entry.teamCode
      })
    }))
    .filter((entry) => !keyword || entry.teamName.toLowerCase().includes(keyword))

  const sorted = [...base].sort((a, b) => {
    if (sortMode.value === 'name') return a.teamName.localeCompare(b.teamName, 'ko')
    if (a.pending && !b.pending) return 1
    if (!a.pending && b.pending) return -1
    return Number(b.points || 0) - Number(a.points || 0)
  })

  let rank = 0
  return sorted.map((entry) => {
    if (!entry.pending && sortMode.value !== 'name') rank += 1
    return {
      ...entry,
      rank: sortMode.value === 'name' ? '-' : rank
    }
  })
})
</script>

<style scoped>
.leaderboard { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
.header-row { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
h1 { margin: 0; color: #0f172a; }
p { margin: 0.35rem 0 0; color: #64748b; }
.controls { display: flex; gap: 0.5rem; }
input, select { border: 1px solid #d0d8e6; border-radius: 12px; padding: 0.58rem 0.7rem; background: #fff; }
.table-wrap { overflow: auto; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #edf2f7; white-space: nowrap; }
th { color: #475569; font-weight: 700; }
a { color: #4338ca; }
</style>
