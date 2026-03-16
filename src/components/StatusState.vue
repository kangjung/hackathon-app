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
.state { background: #fff; border-radius: 12px; border: 1px solid #e4e9f6; padding: 1.2rem; text-align: center; color: #445; }
.state.error { border-color: #fecaca; color: #b91c1c; }
button { margin-top: 0.5rem; border: none; border-radius: 10px; background: #2f62ff; color: #fff; padding: 0.45rem 0.8rem; cursor: pointer; }
</style>