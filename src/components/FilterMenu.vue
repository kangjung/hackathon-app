<template>
  <div class="filters-wrap">
    <div class="filters" role="group" aria-label="해커톤 필터">
      <div class="field search-field">
        <label class="sr-only" for="hackathon-search">해커톤 검색</label>
        <input
          id="hackathon-search"
          :value="filters.search"
          @input="update('search', $event.target.value)"
          placeholder="해커톤명으로 검색"
        />
        <button
          v-if="filters.search?.trim()"
          type="button"
          class="inline-clear"
          @click="update('search', '')"
        >
          지우기
        </button>
      </div>

      <label class="sr-only" for="hackathon-status">상태 필터</label>
      <select id="hackathon-status" :value="filters.status" @change="update('status', $event.target.value)">
        <option value="all">전체 상태</option>
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
        필터 초기화
      </button>
    </div>

    <div v-if="activeFilterChips.length" class="active-filters" aria-live="polite">
      <span class="label">적용된 필터</span>
      <button
        v-for="chip in activeFilterChips"
        :key="chip.key"
        type="button"
        class="chip"
        @click="clearFilter(chip.key)"
      >
        {{ chip.label }} ✕
      </button>
    </div>
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

const statusLabelMap = {
  ongoing: '진행중',
  upcoming: '예정',
  ended: '종료',
  closed: '종료(구버전)'
}

const sortLabelMap = {
  participants: '인기순',
  deadline: '마감 임박순',
  startDate: '시작일 빠른순'
}

const hasActiveFilters = computed(
  () =>
    props.filters.status !== defaultFilters.status ||
    props.filters.tag !== defaultFilters.tag ||
    Boolean(props.filters.search?.trim()) ||
    props.filters.favoritesOnly !== defaultFilters.favoritesOnly ||
    props.filters.sortBy !== defaultFilters.sortBy
)

const activeFilterChips = computed(() => {
  const chips = []
  const search = props.filters.search?.trim()
  if (search) chips.push({ key: 'search', label: `검색: ${search}` })
  if (props.filters.status !== 'all') {
    chips.push({ key: 'status', label: `상태: ${statusLabelMap[props.filters.status] || props.filters.status}` })
  }
  if (props.filters.tag !== 'all') chips.push({ key: 'tag', label: `태그: #${props.filters.tag}` })
  if (props.filters.favoritesOnly) chips.push({ key: 'favoritesOnly', label: '찜만 보기' })
  if (props.filters.sortBy !== 'recommended') {
    chips.push({ key: 'sortBy', label: `정렬: ${sortLabelMap[props.filters.sortBy] || props.filters.sortBy}` })
  }
  return chips
})

const update = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}

const clearFilter = (key) => {
  update(key, defaultFilters[key])
}
</script>

<style scoped>
.filters-wrap { display: grid; gap: 0.55rem; }
.filters { display: flex; gap: 0.6rem; flex-wrap: wrap; }
input, select { border: 1px solid #d0d8e6; border-radius: 12px; padding: 0.62rem; min-width: 150px; background: #fff; color: #0f172a; }
.search-field { position: relative; }
.search-field input { padding-right: 4.2rem; }
.inline-clear {
  position: absolute;
  right: 0.35rem;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  border-radius: 8px;
  padding: 0.2rem 0.45rem;
  font-size: 0.75rem;
  color: #475569;
  background: #f1f5f9;
  cursor: pointer;
}
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
.active-filters { display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap; }
.label { font-size: 0.82rem; color: #64748b; }
.chip {
  border: 1px solid #dbe4fb;
  background: #f8faff;
  color: #334155;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  cursor: pointer;
  font-size: 0.78rem;
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
