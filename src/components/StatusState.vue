<template>
  <div class="state" :class="type">
    <p>{{ message }}</p>
    <button v-if="type === 'error'" @click="$emit('retry')">다시 시도</button>
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'empty' },
  message: { type: String, required: true }
})

defineEmits(['retry'])
</script>

<style scoped>
.state { border-radius: 14px; border: 1px solid #dde6f4; padding: 1.2rem; text-align: center; color: #334155; background: #fff; }
.state.error { border-color: #fecaca; color: #b91c1c; }
button { margin-top: 0.5rem; border: none; border-radius: 10px; background: #4f46e5; color: #fff; padding: 0.45rem 0.8rem; cursor: pointer; }
</style>
