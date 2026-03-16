<template>
  <section class="teams">
    <div class="head">
      <h1>팀 모집 (camp)</h1>
      <button @click="showForm = !showForm">팀 모집글 생성</button>
    </div>

    <StatusState
      v-if="store.isLoading"
      type="loading"
      message="팀 목록을 불러오는 중입니다..."
    />
    <StatusState
      v-else-if="store.error"
      type="error"
      :message="`오류: ${store.error}`"
      @retry="store.loadData({ force: true })"
    />

    <template v-else>
      <form v-if="showForm" class="form" @submit.prevent="createTeam">
        <input v-model="newTeam.name" placeholder="팀명(필수)" required />
        <input v-model="newTeam.intro" placeholder="소개(필수)" required />
        <input v-model="newTeam.lookingFor" placeholder="모집 포지션(예: FE 1명, 디자이너 1명)" />
        <input v-model="newTeam.contact" placeholder="연락 링크(contact.url)" />
        <select v-model="newTeam.hackathonSlug">
          <option value="">해커톤 미연결</option>
          <option v-for="h in store.hackathons" :key="h.slug" :value="h.slug">{{ h.title }}</option>
        </select>
        <label><input type="checkbox" v-model="newTeam.isOpen" /> 모집중(isOpen)</label>
        <button type="submit">저장</button>
      </form>

      <article v-if="selectedTeam" class="detail-card">
        <h2>{{ selectedTeam.name }}</h2>
        <p>{{ selectedTeam.intro }}</p>
        <p>코드: {{ selectedTeam.code }}</p>
        <p>모집 상태: {{ selectedTeam.isOpen ? '모집중' : '마감' }}</p>
        <p>모집 포지션: {{ selectedTeam.lookingFor || '-' }}</p>
        <p>연결 해커톤: {{ selectedTeam.hackathonSlug || '없음' }}</p>
        <a v-if="selectedTeam.contact" :href="selectedTeam.contact" target="_blank" rel="noreferrer">연락하기</a>
      </article>

      <div class="list" v-if="filteredTeams.length">
        <article v-for="team in filteredTeams" :key="team.code" class="team-card">
          <div class="team-card-head">
            <h3>{{ team.name }}</h3>
            <span class="status-chip" :class="team.isOpen ? 'open' : 'closed'">{{ team.isOpen ? '모집중' : '마감' }}</span>
          </div>
          <p class="intro">{{ team.intro }}</p>
          <p class="meta">코드: {{ team.code }}</p>
          <p class="meta">모집 포지션: {{ team.lookingFor || '-' }}</p>
          <p class="meta" v-if="team.hackathonSlug">해커톤: {{ team.hackathonSlug }}</p>
          <a v-if="team.contact" :href="team.contact" target="_blank" rel="noreferrer" class="contact-link">연락하기 ↗</a>
        </article>
      </div>
      <StatusState v-else type="empty" message="조건에 맞는 팀이 없습니다." />
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHackathonStore } from '../stores/hackathon'
import StatusState from '../components/StatusState.vue'

const store = useHackathonStore()
const route = useRoute()
const showForm = ref(false)

const newTeam = ref({
  name: '',
  intro: '',
  lookingFor: '',
  contact: '',
  hackathonSlug: '',
  isOpen: true
})

onMounted(() => {
  store.loadData()
})

const filteredTeams = computed(() => {
  const hackathon = route.query.hackathon
  if (!hackathon) return store.teams
  return store.teams.filter((t) => t.hackathonSlug === hackathon)
})

const selectedTeam = computed(() => {
  const teamCode = route.params.teamCode
  if (!teamCode) return null
  return store.getTeamByCode(teamCode)
})

const createTeam = () => {
  store.addTeam({
    code: `team-${Date.now().toString().slice(-6)}`,
    ...newTeam.value
  })
  newTeam.value = { name: '', intro: '', lookingFor: '', contact: '', hackathonSlug: '', isOpen: true }
  showForm.value = false
}
</script>

<style scoped>
.teams { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
button { border: none; border-radius: 10px; background: #4f46e5; color: #fff; padding: 0.6rem 0.95rem; cursor: pointer; font-weight: 700; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.25); }
.form { margin: 1rem 0; background: #fff; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 14px; display: grid; gap: 0.6rem; }
input, select { border: 1px solid #d0d8e6; border-radius: 10px; padding: 0.6rem; background: #fff; color: #0f172a; }
.detail-card { background: #eef2ff; border: 1px solid #d9e2ff; border-radius: 14px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 12px 28px rgba(59, 130, 246, 0.13); }
.list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.9rem; }
.team-card { background: linear-gradient(180deg, #fff, #f9fbff); border: 1px solid #e2e8f0; border-radius: 14px; padding: 1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06); }
.team-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.6rem; }
.team-card h3 { margin: 0; }
.status-chip { border-radius: 999px; padding: 0.2rem 0.55rem; font-size: 0.74rem; font-weight: 700; white-space: nowrap; }
.status-chip.open { background: #e7f9ef; color: #0f8c4b; }
.status-chip.closed { background: #f3f4f6; color: #475569; }
.intro { color: #334155; margin: 0.6rem 0; min-height: 2.8em; }
.meta { color: #475569; font-size: 0.9rem; margin: 0.25rem 0; }
.contact-link { display: inline-block; margin-top: 0.65rem; color: #4338ca; font-weight: 700; text-decoration: none; }
</style>
