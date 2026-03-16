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
        <input v-model="newTeam.contact" placeholder="연락 링크(contact.url)" />
        <select v-model="newTeam.hackathonSlug">
          <option value="">해커톤 미연결</option>
          <option v-for="h in store.hackathons" :key="h.slug" :value="h.slug">{{ h.title }}</option>
        </select>
        <label><input type="checkbox" v-model="newTeam.isOpen" /> 모집중</label>
        <button type="submit">저장</button>
      </form>

      <article v-if="selectedTeam" class="detail-card">
        <h2>{{ selectedTeam.name }}</h2>
        <p>{{ selectedTeam.intro }}</p>
        <p>코드: {{ selectedTeam.code }}</p>
        <p>모집 상태: {{ selectedTeam.isOpen ? '모집중' : '마감' }}</p>
        <p>연결 해커톤: {{ selectedTeam.hackathonSlug || '없음' }}</p>
        <a v-if="selectedTeam.contact" :href="selectedTeam.contact" target="_blank" rel="noreferrer">연락하기</a>
      </article>

      <div class="list" v-if="filteredTeams.length">
        <article v-for="team in filteredTeams" :key="team.code">
          <h3>{{ team.name }}</h3>
          <p>{{ team.intro }}</p>
          <p>코드: {{ team.code }} · 상태: {{ team.isOpen ? '모집중' : '마감' }}</p>
          <p v-if="team.hackathonSlug">해커톤: {{ team.hackathonSlug }}</p>
          <a v-if="team.contact" :href="team.contact" target="_blank" rel="noreferrer">연락하기</a>
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
  newTeam.value = { name: '', intro: '', contact: '', hackathonSlug: '', isOpen: true }
  showForm.value = false
}
</script>

<style scoped>
.teams { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
.head { display: flex; justify-content: space-between; align-items: center; }
button { border: none; border-radius: 10px; background: #2f62ff; color: #fff; padding: 0.55rem 0.9rem; cursor: pointer; }
.form { margin: 1rem 0; background: #fff; padding: 1rem; border-radius: 14px; display: grid; gap: 0.6rem; }
input, select { border: 1px solid #d0d5dd; border-radius: 10px; padding: 0.6rem; }
.detail-card { background: #eef3ff; border: 1px solid #d5defa; border-radius: 14px; padding: 1rem; margin-bottom: 1rem; }
.list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.9rem; }
.list article { background: #fff; border: 1px solid #e4e9f6; border-radius: 14px; padding: 1rem; }
</style>