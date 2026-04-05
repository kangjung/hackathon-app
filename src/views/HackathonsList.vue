<template>
  <div class="hackathons-list">
    <div class="page-header">
      <h1>해커톤 목록</h1>
      <FilterMenu
        :filters="store.filters"
        :tag-options="availableTags"
        @update:filters="store.filters = $event"
      />
    </div>
    <p class="result-meta">
      총 {{ store.stats.totalHackathons }}개 중 <strong>{{ store.filteredHackathons.length }}개</strong> 표시
      <span class="favorite-meta">· 찜 {{ store.favoriteHackathonSlugs.length }}개</span>
      <span v-if="activeFilterCount" class="filter-meta">· 필터 {{ activeFilterCount }}개 적용중</span>
    </p>
    <p class="auth-meta">
      {{ authStore.isLoggedIn ? '로그인됨: 찜/북마크가 계정에 저장됩니다.' : '게스트 상태: 찜은 이 브라우저에만 임시 저장됩니다.' }}
    </p>

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

    <div v-else class="empty-helper">
      <StatusState type="empty" message="해당 조건에 맞는 해커톤이 없습니다. 😔" />
      <button type="button" class="clear-btn" @click="resetFilters">필터 모두 해제하고 다시 보기</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useHackathonStore } from '../stores/hackathon'
import { useAuthStore } from '../stores/auth'
import FilterMenu from '../components/FilterMenu.vue'
import HackathonCard from '../components/HackathonCard.vue'
import StatusState from '../components/StatusState.vue'

const store = useHackathonStore()
const authStore = useAuthStore()
const availableTags = computed(() =>
  [...new Set(store.hackathons.flatMap((hackathon) => hackathon.tags || []))].sort((a, b) =>
    a.localeCompare(b, 'ko')
  )
)

const defaultFilters = {
  status: 'all',
  search: '',
  tag: 'all',
  favoritesOnly: false,
  sortBy: 'recommended'
}

const activeFilterCount = computed(() => {
  let count = 0
  if (store.filters.status !== defaultFilters.status) count += 1
  if (store.filters.search?.trim()) count += 1
  if (store.filters.tag !== defaultFilters.tag) count += 1
  if (store.filters.favoritesOnly !== defaultFilters.favoritesOnly) count += 1
  if (store.filters.sortBy !== defaultFilters.sortBy) count += 1
  return count
})

const resetFilters = () => {
  store.filters = { ...defaultFilters }
}

onMounted(() => {
  store.loadData()
})
</script>

<style scoped>
.hackathons-list { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem; }
.result-meta { margin: -0.4rem 0 1rem; color: #475569; }
.auth-meta { margin: -0.6rem 0 0.9rem; color: #64748b; font-size: 0.9rem; }
.result-meta strong { color: #1e293b; }
.favorite-meta { color: #7c3aed; font-weight: 600; margin-left: 0.3rem; }
.filter-meta { color: #2563eb; margin-left: 0.3rem; font-weight: 600; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
.empty-helper { display: grid; gap: 0.7rem; justify-items: start; }
.clear-btn {
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #3730a3;
  padding: 0.55rem 0.9rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
}
</style>
