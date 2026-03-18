<template>
  <div class="filters">
    <label class="sr-only" for="hackathon-search">해커톤 검색</label>
    <input
      id="hackathon-search"
      :value="filters.search"
      @input="update('search', $event.target.value)"
      placeholder="해커톤 검색"
    />
    <label class="sr-only" for="hackathon-status">상태 필터</label>
    <select id="hackathon-status" :value="filters.status" @change="update('status', $event.target.value)">
      <option value="all">전체</option>
      <option value="ongoing">진행중</option>
      <option value="upcoming">예정</option>
      <option value="ended">종료</option>
      <option value="closed">종료(구버전)</option>
    </select>
    <label class="sr-only" for="hackathon-tag">태그 필터</label>
    <select id="hackathon-tag" :value="filters.tag" @change="update('tag', $event.target.value)">
      <option value="all">전체 태그</option>
      <option v-for="tag in tagOptions" :key="tag" :value="tag">{{ tag }}</option>
    </select>
    <label class="sr-only" for="hackathon-sort">정렬</label>
    <select id="hackathon-sort" :value="filters.sortBy" @change="update('sortBy', $event.target.value)">
      <option value="recommended">추천순</option>
      <option value="participants">인기순</option>
      <option value="deadline">마감 임박순</option>
      <option value="startDate">시작일 빠른순</option>
    </select>
    <label class="favorite-only">
      <input
        type="checkbox"
        :checked="Boolean(filters.favoritesOnly)"
        @change="update('favoritesOnly', $event.target.checked)"
      />
      찜한 해커톤만
    </label>
    <button
      v-if="hasActiveFilters"
      type="button"
      class="reset"
      @click="emit('update:filters', defaultFilters)"
    >
      초기화
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filters: { type: Object, required: true },
  tagOptions: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:filters'])
const defaultFilters = {
  status: 'all',
  search: '',
  tag: 'all',
  favoritesOnly: false,
  sortBy: 'recommended'
}

const hasActiveFilters = computed(
  () =>
    props.filters.status !== defaultFilters.status ||
    props.filters.tag !== defaultFilters.tag ||
    Boolean(props.filters.search?.trim()) ||
    props.filters.favoritesOnly !== defaultFilters.favoritesOnly ||
    props.filters.sortBy !== defaultFilters.sortBy
)

const update = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>

<style scoped>
.filters { display: flex; gap: 0.6rem; flex-wrap: wrap; }
input, select { border: 1px solid #d0d8e6; border-radius: 12px; padding: 0.62rem; min-width: 150px; background: #fff; color: #0f172a; }
.reset { border: 1px solid #cbd5e1; border-radius: 12px; background: #fff; color: #334155; padding: 0.62rem 0.9rem; cursor: pointer; }
.favorite-only {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #d0d8e6;
  border-radius: 12px;
  background: #fff;
  color: #334155;
  padding: 0 0.75rem;
}
.favorite-only input {
  min-width: auto;
  accent-color: #4f46e5;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
