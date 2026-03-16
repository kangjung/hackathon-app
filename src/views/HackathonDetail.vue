<template>
  <section class="detail" v-if="hackathon">
    <header>
      <h1>{{ hackathon.title }}</h1>
      <p>{{ hackathon.summary }}</p>
    </header>

    <div class="tabs">
      <article><h3>개요/안내</h3><p>{{ detail.overview }}</p><p>{{ detail.guide }}</p></article>
      <article><h3>평가</h3><p>{{ detail.evaluation }}</p></article>
      <article><h3>일정</h3><p>{{ detail.schedule }}</p></article>
      <article><h3>상금</h3><p>{{ detail.prize }}</p></article>
      <article><h3>팀(캠프)</h3><p>현재 {{ teams.length }}팀 모집/참여 중</p><router-link :to="`/camp?hackathon=${hackathon.slug}`">이 해커톤 팀 보기/생성</router-link></article>
      <article>
        <h3>제출(Submit)</h3>
        <p>notes(선택), zip/pdf/csv 제출 메타를 저장합니다.</p>
        <button @click="showSubmit = true">결과물 제출하기</button>
      </article>
      <article>
        <h3>리더보드</h3>
        <p>제출 시 자동 점수 반영됩니다.</p>
        <router-link :to="`/hackathons/${hackathon.slug}/leaderboard`">리더보드 보기</router-link>
      </article>
    </div>

    <SubmitModal
      v-if="showSubmit"
      :teams="teams"
      @close="showSubmit = false"
      @submit="onSubmit"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHackathonStore } from '../stores/hackathon'
import SubmitModal from '../components/SubmitModal.vue'

const route = useRoute()
const store = useHackathonStore()
const showSubmit = ref(false)

onMounted(() => {
  if (!store.hackathons.length) store.loadData()
})

const slug = computed(() => route.params.slug)
const hackathon = computed(() => store.hackathons.find((h) => h.slug === slug.value))
const detail = computed(() => store.getHackathonDetail(slug.value) || {})
const teams = computed(() => store.getTeamsByHackathon(slug.value))

const onSubmit = ({ teamCode, notes, fileType }) => {
  store.submitProject({ hackathonSlug: slug.value, teamCode, notes, fileType })
}
</script>

<style scoped>
.detail { max-width: 1100px; margin: 1.5rem auto; padding: 0 1rem; }
.tabs { margin-top: 1rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.9rem; }
article { background: #fff; border-radius: 14px; border: 1px solid #e4e9f6; padding: 1rem; }
button { border: none; border-radius: 10px; background: #2f62ff; color: #fff; padding: 0.5rem 0.8rem; cursor: pointer; }
a { color: #2f62ff; }
</style>
