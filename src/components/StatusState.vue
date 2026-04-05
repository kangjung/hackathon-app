<template>
  <div class="state" :class="type">
    <div class="state-icon" aria-hidden="true">{{ icon }}</div>
    <p class="state-title">{{ title }}</p>
    <p class="state-message">{{ message }}</p>
    <router-link v-if="actionTo" :to="actionTo" class="state-link">{{ actionText }}</router-link>
    <button v-else-if="type === 'error'" @click="$emit('retry')">다시 시도</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'empty' },
  message: { type: String, required: true },
  title: { type: String, default: '' }
})

defineEmits(['retry'])

const icon = computed(() => {
  if (props.type === 'loading') return '⏳'
  if (props.type === 'error') return '⚠️'
  return '📭'
})

const title = computed(() => {
  if (props.title) return props.title
  if (props.type === 'loading') return '데이터를 준비하고 있어요'
  if (props.type === 'error') return '문제가 발생했어요'
  return '아직 표시할 내용이 없어요'
})

const actionText = computed(() => {
  if (props.type === 'error') return '다시 시도'
  return '해커톤 둘러보기'
})

const actionTo = computed(() => {
  if (props.type !== 'empty') return ''
  return '/hackathons'
})
</script>

<style scoped>
.state { border-radius: 14px; border: 1px solid #dde6f4; padding: 1.2rem; text-align: center; color: #334155; background: #fff; display: grid; justify-items: center; }
.state.error { border-color: #fecaca; color: #b91c1c; }
.state-icon { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: #eef2ff; font-size: 1.2rem; margin-bottom: 0.4rem; }
.state.error .state-icon { background: #fee2e2; }
.state-title { margin: 0; font-weight: 800; color: #0f172a; }
.state-message { margin: 0.25rem 0 0; color: #475569; }
.state-link,
button { margin-top: 0.65rem; border: none; border-radius: 10px; background: #4f46e5; color: #fff; padding: 0.45rem 0.8rem; cursor: pointer; text-decoration: none; }
</style>
