<template>
  <div class="hackathons-list">
    <div class="page-header">
      <h1>해커톤 목록</h1>
      <FilterMenu :filters="store.filters" @update:filters="store.filters = $event" />
    </div>

    <StatusState
      v-if="store.isLoading"
      type="loading"
      message="데이터를 불러오는 중입니다..."
    />
    <StatusState
      v-else-if="store.error"
      type="error"
      :message="`오류: ${store.error}`"
      @retry="store.loadData({ force: true })"
    />

    <div class="grid" v-else-if="store.filteredHackathons.length">
      <HackathonCard
        v-for="hackathon in store.filteredHackathons"
        :key="hackathon.slug"
        :hackathon="hackathon"
      />
    </div>

    <StatusState v-else type="empty" message="해당 조건에 맞는 해커톤이 없습니다. 😔" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHackathonStore } from '../stores/hackathon'
import FilterMenu from '../components/FilterMenu.vue'
import HackathonCard from '../components/HackathonCard.vue'
import StatusState from '../components/StatusState.vue'

const store = useHackathonStore()

onMounted(() => {
  store.loadData()
})
</script>

<style scoped>
.hackathons-list { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
</style>