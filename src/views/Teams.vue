<template>
  <section class="teams">
    <div class="head">
      <h1>팀 모집 (camp)</h1>
      <button @click="showForm = !showForm">팀 모집글 생성</button>
    </div>

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

    <div class="list">
      <article v-for="team in filteredTeams" :key="team.code">
        <h3>{{ team.name }}</h3>
        <p>{{ team.intro }}</p>
        <p>코드: {{ team.code }} · 상태: {{ team.isOpen ? '모집중' : '마감' }}</p>
        <p v-if="team.hackathonSlug">해커톤: {{ team.hackathonSlug }}</p>
        <a v-if="team.contact" :href="team.contact" target="_blank" rel="noreferrer">연락하기</a>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHackathonStore } from '../stores/hackathon'

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
  if (!store.teams.length) store.loadData()
})

const filteredTeams = computed(() => {
  const hackathon = route.query.hackathon
  if (!hackathon) return store.teams
  return store.teams.filter((t) => t.hackathonSlug === hackathon)
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
.list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.9rem; }
article { background: #fff; border: 1px solid #e4e9f6; border-radius: 14px; padding: 1rem; }
</style>
