<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="panel">
      <h3>결과물 제출</h3>
      <p>파일 타입과 메모를 작성하면 리더보드 점수가 갱신됩니다.</p>
      <select v-model="teamCode">
        <option disabled value="">팀 선택</option>
        <option v-for="team in teams" :key="team.code" :value="team.code">{{ team.name }}</option>
      </select>
      <select v-model="fileType">
        <option value="zip">ZIP</option>
        <option value="pdf">PDF</option>
        <option value="csv">CSV</option>
      </select>
      <textarea v-model="notes" placeholder="메모 (선택)"></textarea>
      <div class="actions">
        <button class="ghost" @click="$emit('close')">취소</button>
        <button @click="submit">저장/제출</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  teams: { type: Array, required: true }
})
const emit = defineEmits(['close', 'submit'])

const teamCode = ref('')
const fileType = ref('zip')
const notes = ref('')

const submit = () => {
  if (!teamCode.value) return
  emit('submit', {
    teamCode: teamCode.value,
    notes: notes.value,
    fileType: fileType.value
  })
  emit('close')
}
</script>

<style scoped>
.backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); display: grid; place-items: center; z-index: 40; }
.panel { background: white; width: min(500px, 92vw); border-radius: 16px; padding: 1rem; display: grid; gap: 0.7rem; }
select, textarea { border: 1px solid #d0d5dd; border-radius: 10px; padding: 0.6rem; }
.actions { display: flex; justify-content: flex-end; gap: 0.6rem; }
button { border: none; background: #2f62ff; color: white; border-radius: 10px; padding: 0.6rem 1rem; cursor: pointer; }
button.ghost { background: #eef2ff; color: #2b3f7c; }
</style>
