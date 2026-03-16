<template>
  <section class="profile">
    <h1>내 정보</h1>

    <StatusState
      v-if="!authStore.isLoggedIn"
      type="empty"
      message="로그인이 필요합니다. 가입/로그인 후 내 정보를 확인하세요."
    />

    <template v-else>
      <div class="card">
        <p><strong>아이디</strong> {{ authStore.currentUser?.id }}</p>
        <p><strong>닉네임</strong> {{ authStore.currentUser?.nickname }}</p>
        <p><strong>주 포지션</strong> {{ authStore.currentUser?.mainPosition }}</p>
        <p><strong>누적 포인트</strong> {{ myPoints }}점</p>
        <p><strong>글로벌 랭킹</strong> {{ myRankText }}</p>
      </div>

      <div class="grid">
        <article>
          <h3>참가 중인 팀</h3>
          <ul v-if="myTeams.length">
            <li v-for="team in myTeams" :key="team.code">{{ team.name }} ({{ team.code }})</li>
          </ul>
          <p v-else>아직 내가 만든 팀이 없습니다.</p>
        </article>

        <article>
          <h3>참가 해커톤</h3>
          <ul v-if="myHackathons.length">
            <li v-for="hackathon in myHackathons" :key="hackathon.slug">
              <router-link :to="`/hackathons/${hackathon.slug}`">{{ hackathon.title }}</router-link>
            </li>
          </ul>
          <p v-else>아직 연결된 해커톤이 없습니다.</p>
        </article>

        <article>
          <h3>북마크한 해커톤</h3>
          <ul v-if="bookmarkedHackathons.length">
            <li v-for="hackathon in bookmarkedHackathons" :key="hackathon.slug">
              <router-link :to="`/hackathons/${hackathon.slug}`">{{ hackathon.title }}</router-link>
            </li>
          </ul>
          <p v-else>북마크한 해커톤이 없습니다.</p>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useHackathonStore } from '../stores/hackathon'
import StatusState from '../components/StatusState.vue'

const authStore = useAuthStore()
const hackathonStore = useHackathonStore()

onMounted(() => {
  hackathonStore.loadData()
})

const myTeams = computed(() => {
  const nickname = authStore.currentUser?.nickname
  if (!nickname) return []

  return hackathonStore.teams.filter((team) => {
    const owner = team.ownerNickname || ''
    return owner === nickname
  })
})

const myHackathons = computed(() => {
  const slugSet = new Set(myTeams.value.map((team) => team.hackathonSlug).filter(Boolean))
  return hackathonStore.hackathons.filter((hackathon) => slugSet.has(hackathon.slug))
})

const bookmarkedHackathons = computed(() => {
  const bookmarkedSlugs = authStore.currentUser?.bookmarkedHackathons || []
  const bookmarkSet = new Set(bookmarkedSlugs)
  return hackathonStore.hackathons.filter((hackathon) => bookmarkSet.has(hackathon.slug))
})

const myPoints = computed(() => {
  const nickname = authStore.currentUser?.nickname
  if (!nickname) return 0

  const rankRow = hackathonStore.getGlobalRankings('all').find((row) => row.nickname === nickname)
  return rankRow?.points || 0
})

const myRankText = computed(() => {
  const nickname = authStore.currentUser?.nickname
  if (!nickname) return '-'

  const ranking = hackathonStore.getGlobalRankings('all')
  const rankIndex = ranking.findIndex((row) => row.nickname === nickname)
  return rankIndex >= 0 ? `${rankIndex + 1}위` : '랭킹 없음'
})
</script>

<style scoped>
.profile { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
.card { border: 1px solid #dbe4f6; border-radius: 14px; background: #fff; padding: 1rem; }
.card p { margin: 0.35rem 0; }
.grid { margin-top: 1rem; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.85rem; }
article { border: 1px solid #e2e8f0; border-radius: 14px; padding: 0.9rem; background: #fff; }
ul { margin: 0; padding-left: 1rem; }
a { color: #4338ca; text-decoration: none; }
@media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
</style>
