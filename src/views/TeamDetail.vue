<template>
  <section class="team-detail" v-if="team">
    <div class="back-row">
      <router-link to="/teams">← 팀 목록으로</router-link>
    </div>

    <article class="detail-card">
      <div class="detail-header">
        <h1>{{ team.name }}</h1>
        <span class="status-chip" :class="store.isRecruitmentClosed(team) ? 'closed' : 'open'">
          {{ getRecruitStatusText(team) }}
        </span>
      </div>

      <p class="intro">{{ team.intro }}</p>
      <p class="meta"><strong>코드</strong><span>{{ team.code }}</span></p>
      <p class="meta"><strong>모집 현황</strong><span>{{ getRecruitProgressText(team) }}</span></p>
      <p class="meta" v-if="team.hackathonSlug"><strong>연결 해커톤</strong><span>{{ team.hackathonSlug }}</span></p>
      <div class="meta">
        <strong>모집 포지션</strong>
        <div class="position-chips" v-if="team.positions?.length">
          <span v-for="position in team.positions" :key="`${position.role}-${position.count}`" class="position-chip">
            {{ position.role }} · {{ position.count }}명 {{ store.isRoleClosed(team, position.role) ? '(마감)' : '' }}
          </span>
        </div>
        <span v-else>{{ getEmptyPositionLabel(team) }}</span>
      </div>

      <div class="apply-box" v-if="!canManageTeam(team)">
        <div class="apply-controls">
          <select v-model="applyRole">
            <option disabled value="">지원 포지션 선택</option>
            <option v-for="position in getOpenPositions(team)" :key="position.role" :value="position.role">
              {{ position.role }} ({{ position.remaining }}명 남음)
            </option>
          </select>
          <textarea v-model="applyMessage" rows="3" placeholder="팀장에게 남길 한마디 (선택)"></textarea>
          <button
            type="button"
            :disabled="!authStore.isLoggedIn"
            :title="!authStore.isLoggedIn ? '로그인 후 가입 신청할 수 있습니다.' : ''"
            @click="submitJoinRequest(team)"
          >
            가입 신청
          </button>
        </div>
      </div>

      <div class="requests-box" v-if="canManageTeam(team)">
        <h3>가입 신청 관리</h3>
        <div v-if="pendingRequests(team).length" class="request-list">
          <article v-for="request in pendingRequests(team)" :key="request.id" class="request-card">
            <div>
              <strong>{{ request.nickname }}</strong>
              <p class="request-meta">@{{ request.userId }} · {{ request.role || '포지션 미선택' }} · {{ formatDate(request.createdAt) }}</p>
              <p class="request-message">{{ request.message || '메시지 없음' }}</p>
            </div>
            <div class="request-actions">
              <button type="button" class="approve" @click="reviewRequest(team, request.id, 'accepted')">승인</button>
              <button type="button" class="reject" @click="reviewRequest(team, request.id, 'rejected')">거절</button>
            </div>
          </article>
        </div>
        <p v-else class="hint">대기 중인 신청이 없습니다.</p>
      </div>

      <a v-if="team.contact" :href="team.contact" target="_blank" rel="noreferrer" class="contact-link">가입 문의 ↗</a>
    </article>
  </section>

  <StatusState
    v-else-if="store.isLoading"
    type="loading"
    message="팀 정보를 불러오는 중입니다..."
  />
  <StatusState
    v-else-if="store.error"
    type="error"
    :message="`오류: ${store.error}`"
    @retry="store.loadData({ force: true })"
  />
  <StatusState v-else type="empty" message="존재하지 않는 팀입니다." />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHackathonStore } from '../stores/hackathon'
import { useAuthStore } from '../stores/auth'
import { formatDateTimeKorean } from '../utils/dateTime'
import StatusState from '../components/StatusState.vue'

const route = useRoute()
const store = useHackathonStore()
const authStore = useAuthStore()

const applyMessage = ref('')
const applyRole = ref('')

onMounted(() => {
  store.loadData()
})

const team = computed(() => store.getTeamByCode(route.params.teamCode))

const canManageTeam = (targetTeam) =>
  authStore.isLoggedIn && authStore.currentUser?.id && targetTeam.ownerId === authStore.currentUser.id

const formatDate = (value) => formatDateTimeKorean(value)

const getRecruitStatusText = (targetTeam) => {
  if (store.isRecruitmentClosed(targetTeam)) {
    return targetTeam.recruitDeadline ? '마감(기간 종료)' : '마감'
  }
  if (!targetTeam.recruitDeadline) return '모집중'
  return `모집중 · ${formatDateTimeKorean(targetTeam.recruitDeadline)} 마감`
}

const getRecruitProgressText = (targetTeam) => {
  const current = Number(targetTeam.memberCount) || targetTeam.members?.length || 0
  if (targetTeam.maxMembers) {
    const remaining = Math.max(targetTeam.maxMembers - current, 0)
    return `${current}/${targetTeam.maxMembers}명 · ${remaining}명 모집중`
  }
  return `${current}명 참여중`
}

const getEmptyPositionLabel = (targetTeam) => (store.isRecruitmentClosed(targetTeam) ? '마감' : '모집 포지션 미정')

const getOpenPositions = (targetTeam) =>
  (targetTeam.positions || [])
    .map((position) => ({
      ...position,
      remaining: Math.max(Number(position.count || 0) - store.getAcceptedRoleCount(targetTeam, position.role), 0)
    }))
    .filter((position) => position.remaining > 0)

const pendingRequests = (targetTeam) =>
  (targetTeam.joinRequests || []).filter((request) => request.status === 'pending')

const submitJoinRequest = (targetTeam) => {
  if (!authStore.isLoggedIn) {
    alert('가입 신청은 로그인 후 가능합니다.')
    return
  }

  try {
    store.applyToTeam({
      teamCode: targetTeam.code,
      userId: authStore.currentUser?.id,
      nickname: authStore.currentUser?.nickname,
      message: applyMessage.value,
      role: applyRole.value
    })
    applyMessage.value = ''
    applyRole.value = ''
    alert('가입 신청이 접수되었습니다. 팀장의 확인을 기다려주세요.')
  } catch (error) {
    alert(error instanceof Error ? error.message : '가입 신청 중 오류가 발생했습니다.')
  }
}

const reviewRequest = (targetTeam, requestId, decision) => {
  try {
    store.reviewJoinRequest({
      teamCode: targetTeam.code,
      requestId,
      reviewerId: authStore.currentUser?.id,
      decision
    })
    alert(decision === 'accepted' ? '신청을 승인했습니다.' : '신청을 거절했습니다.')
  } catch (error) {
    alert(error instanceof Error ? error.message : '신청 처리 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped>
.team-detail { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
.back-row { margin-bottom: 0.8rem; }
.back-row a { color: #3730a3; text-decoration: none; font-weight: 700; }
.detail-card { background: #eef2ff; border: 1px solid #d9e2ff; border-radius: 14px; padding: 1rem; box-shadow: 0 12px 28px rgba(59, 130, 246, 0.13); }
.detail-header { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; }
h1 { margin: 0; }
.status-chip { border-radius: 999px; padding: 0.2rem 0.55rem; font-size: 0.74rem; font-weight: 700; white-space: nowrap; }
.status-chip.open { background: #e7f9ef; color: #0f8c4b; }
.status-chip.closed { background: #f3f4f6; color: #475569; }
.intro { color: #334155; }
.meta { color: #475569; font-size: 0.9rem; margin: 0.25rem 0; display: grid; gap: 0.25rem; }
.meta strong { font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; color: #1e1b4b; font-weight: 800; }
.position-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.position-chip { font-size: 0.78rem; padding: 0.18rem 0.5rem; border-radius: 999px; background: #e0e7ff; color: #312e81; font-weight: 700; }
.apply-box, .requests-box { margin-top: 0.9rem; padding: 0.75rem; border-radius: 12px; border: 1px solid #c7d2fe; background: #fff; }
.apply-controls { display: grid; gap: 0.55rem; grid-template-columns: minmax(170px, 210px) minmax(0, 1fr) auto; align-items: end; }
.apply-controls textarea { min-height: 72px; resize: vertical; }
.request-list { display: grid; gap: 0.5rem; margin-top: 0.65rem; }
.request-card { padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 10px; display: flex; justify-content: space-between; gap: 0.5rem; align-items: flex-start; }
.request-meta { margin: 0.2rem 0; color: #64748b; font-size: 0.8rem; }
.request-message { margin: 0; color: #334155; }
.request-actions { display: flex; gap: 0.35rem; }
.request-actions .approve { background: #16a34a; }
.request-actions .reject { background: #dc2626; }
.hint { color: #64748b; }
.contact-link { display: inline-block; margin-top: 0.8rem; color: #4338ca; font-weight: 700; text-decoration: none; }
@media (max-width: 760px) {
  .apply-controls { grid-template-columns: 1fr; align-items: stretch; }
}
</style>
