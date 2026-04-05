<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="panel">
      <h3>결과물 제출</h3>
      <p>팀 리더가 기획서/웹/PDF 링크를 제출하면 리더보드에 반영됩니다.</p>
      <select :value="teamCode" @change="onTeamSelectChange">
        <option disabled value="">내 팀 선택</option>
        <option v-for="team in teams" :key="team.code" :value="team.code">{{ team.name }}</option>
      </select>
      <input v-model="planningUrl" placeholder="기획서 URL 또는 설명 텍스트" required />
      <input v-model="webUrl" type="url" placeholder="웹 페이지 URL (예: Vercel)" required />
      <input v-model="pdfUrl" type="url" placeholder="솔루션 PDF URL" required />
      <textarea v-model="notes" placeholder="추가 메모 (선택)"></textarea>
      <div class="actions">
        <button class="ghost" @click="$emit('close')">취소</button>
        <button :disabled="!isValid" :title="submitButtonTitle" @click="submit">저장/제출</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

defineProps({
  teams: { type: Array, required: true }
})
const emit = defineEmits(['close', 'submit'])

const teamCode = ref('')
const planningUrl = ref('')
const webUrl = ref('')
const pdfUrl = ref('')
const notes = ref('')

const isValid = computed(() =>
  Boolean(teamCode.value && planningUrl.value.trim() && webUrl.value.trim() && pdfUrl.value.trim())
)

const submitButtonTitle = computed(() => {
  if (!teamCode.value) return '팀을 선택해주세요.'
  if (!planningUrl.value.trim() || !webUrl.value.trim() || !pdfUrl.value.trim()) {
    return '필수 제출 항목을 모두 입력해주세요.'
  }
  return ''
})

const onTeamSelectChange = (event) => {
  teamCode.value = String(event?.target?.value || '').trim()
}

const submit = () => {
  if (!isValid.value) return
  emit('submit', {
    teamCode: teamCode.value,
    planningUrl: planningUrl.value.trim(),
    webUrl: webUrl.value.trim(),
    pdfUrl: pdfUrl.value.trim(),
    notes: notes.value.trim()
  })
  emit('close')
}
</script>

<style scoped>
.backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); display: grid; place-items: center; z-index: 40; }
.panel { background: white; width: min(500px, 92vw); border-radius: 16px; padding: 1rem; display: grid; gap: 0.7rem; }
input, select, textarea { border: 1px solid #d0d5dd; border-radius: 10px; padding: 0.6rem; }
.actions { display: flex; justify-content: flex-end; gap: 0.6rem; }
button { border: none; background: #2f62ff; color: white; border-radius: 10px; padding: 0.6rem 1rem; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
button.ghost { background: #eef2ff; color: #2b3f7c; }
</style>
