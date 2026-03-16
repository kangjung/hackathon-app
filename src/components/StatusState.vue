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
.state {
  border-radius: 14px;
  border: 1px solid rgba(146, 169, 255, 0.24);
  padding: 1.2rem;
  text-align: center;
  color: #cad9ff;
  background: rgba(9, 16, 43, 0.8);
}
.state.error { border-color: #7f1d1d; color: #ffb4b4; }
button {
  margin-top: 0.5rem;
  border: none;
  border-radius: 10px;
  background: #5878ff;
  color: #fff;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}
</style>
