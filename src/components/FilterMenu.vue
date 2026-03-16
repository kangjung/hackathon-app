<template>
  <div class="filters">
    <input
      :value="filters.search"
      @input="update('search', $event.target.value)"
      placeholder="해커톤 검색"
    />
    <select :value="filters.status" @change="update('status', $event.target.value)">
      <option value="all">전체</option>
      <option value="ongoing">진행중</option>
      <option value="upcoming">예정</option>
      <option value="closed">종료</option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  filters: { type: Object, required: true }
})
const emit = defineEmits(['update:filters'])

const update = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>

<style scoped>
.filters { display: flex; gap: 0.6rem; flex-wrap: wrap; }
input, select { border: 1px solid #d0d8e6; border-radius: 12px; padding: 0.62rem; min-width: 150px; background: #fff; color: #0f172a; }
</style>
