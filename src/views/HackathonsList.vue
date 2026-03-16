<template>
  <div class="hackathons-list">
    <div class="page-header">
      <h1>해커톤 목록</h1>
      <FilterMenu :filters="store.filters" @update:filters="store.filters = $event" />
    </div>

    <div class="grid" v-if="store.filteredHackathons.length">
      <HackathonCard
        v-for="hackathon in store.filteredHackathons"
        :key="hackathon.slug"
        :hackathon="hackathon"
      />
    </div>

    <div v-else class="empty-state">
      <p>해당 조건에 맞는 해커톤이 없습니다. 😔</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHackathonStore } from '../stores/hackathon'
import FilterMenu from '../components/FilterMenu.vue'
import HackathonCard from '../components/HackathonCard.vue'

const store = useHackathonStore()

onMounted(() => {
  if (!store.hackathons.length) store.loadData()
})
</script>

<style scoped>
.hackathons-list { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
.empty-state { text-align: center; padding: 4rem; color: #666; }
</style>
