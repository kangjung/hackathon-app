<template>
  <section class="teams">
    <p class="auth-guide" :class="authStore.isLoggedIn ? 'ok' : 'warn'">
      {{ authStore.isLoggedIn ? '로그인 상태입니다. 팀 생성/가입 신청 기능을 사용할 수 있습니다.' : '팀 생성/가입 신청은 로그인 후 가능합니다. 지금은 조회만 가능합니다.' }}
    </p>
    <p v-if="ownerPendingRequestCount > 0" class="owner-alert">
      내가 운영하는 팀에 확인하지 않은 가입 신청이 {{ ownerPendingRequestCount }}건 있습니다.
      <router-link to="/notifications">알림에서 바로 확인</router-link>
    </p>
    <div class="head">
      <h1>팀 모집</h1>
      <button
        :disabled="!authStore.isLoggedIn"
        :title="!authStore.isLoggedIn ? '로그인 후 팀 모집글을 만들 수 있습니다.' : ''"
        @click="showForm = !showForm"
      >
        팀 모집글 생성
      </button>
    </div>

    <div class="team-filters">
      <input
        v-model.trim="teamFilters.search"
        type="search"
        placeholder="팀명/소개/포지션 검색"
      />
      <select v-model="teamFilters.status">
        <option value="all">전체 상태</option>
        <option value="open">모집중</option>
        <option value="closed">모집 마감</option>
      </select>
      <button
        v-if="hasActiveTeamFilters"
        type="button"
        class="reset-filters"
        @click="resetTeamFilters"
      >
        필터 초기화
      </button>
    </div>
    <p class="filter-result">총 {{ store.teams.length }}팀 중 {{ filteredTeams.length }}팀 표시</p>

    <StatusState
      v-if="store.isLoading"
      type="loading"
      message="팀 목록을 불러오는 중입니다..."
    />
    <StatusState
      v-else-if="store.error"
      type="error"
      :message="`오류: ${store.error}`"
      @retry="store.loadData({ force: true })"
    />

    <template v-else>
      <form v-if="showForm" class="form" @submit.prevent="createTeam">
        <input v-model="newTeam.name" placeholder="팀명(필수)" required />
        <input v-model="newTeam.intro" placeholder="소개(필수)" required />
        <div class="positions-section">
          <p class="positions-title">모집 포지션</p>
          <div v-for="(position, index) in newTeam.positions" :key="index" class="position-row">
            <select v-model="position.role" required>
              <option disabled value="">포지션 선택</option>
              <option v-for="option in positionOptions" :key="option" :value="option">{{ option }}</option>
              <option value="기타">기타(직접 입력)</option>
            </select>
            <input
              v-if="position.role === '기타'"
              v-model="position.customRole"
              placeholder="직접 입력"
              required
            />
            <input v-model.number="position.count" type="number" min="1" placeholder="인원" required />
            <button type="button" class="row-remove" @click="removePosition(index)">삭제</button>
          </div>
          <button type="button" class="add-position" @click="addPosition">+ 포지션 추가</button>
        </div>
        <input v-model.number="newTeam.maxMembers" type="number" min="2" placeholder="팀 최대 인원(선택)" />
        <input v-model="newTeam.contact" placeholder="연락 링크(contact.url)" />
        <input v-model="newTeam.recruitDeadline" type="datetime-local" placeholder="모집 마감일(선택)" />
        <select v-model="newTeam.hackathonSlug">
          <option value="">해커톤 미연결</option>
          <option v-for="h in store.hackathons" :key="h.slug" :value="h.slug">{{ h.title }}</option>
        </select>
        <label><input type="checkbox" v-model="newTeam.isOpen" /> 모집중(isOpen)</label>
        <button type="submit">저장</button>
      </form>

      <article v-if="selectedTeam" class="detail-card">
        <div class="detail-header">
          <h2>{{ selectedTeam.name }}</h2>
          <button
            v-if="canManageTeam(selectedTeam)"
            type="button"
            class="toggle-btn"
            @click="toggleRecruitment(selectedTeam)"
          >
            {{ store.isRecruitmentClosed(selectedTeam) ? '모집 재오픈' : '모집 마감 처리' }}
          </button>
        </div>
        <p>{{ selectedTeam.intro }}</p>
        <p class="meta"><strong>코드</strong><span>{{ selectedTeam.code }}</span></p>
        <p class="meta"><strong>모집 상태</strong><span>{{ getRecruitStatusText(selectedTeam) }}</span></p>
        <p class="meta"><strong>모집 현황</strong><span>{{ getRecruitProgressText(selectedTeam) }}</span></p>
        <div class="meta">
          <strong>모집 포지션</strong>
          <div class="position-chips" v-if="selectedTeam.positions?.length">
            <span v-for="position in selectedTeam.positions" :key="`${position.role}-${position.count}`" class="position-chip">
              {{ position.role }} · {{ position.count }}명 {{ store.isRoleClosed(selectedTeam, position.role) ? '(마감)' : '' }}
            </span>
          </div>
          <span v-else>-</span>
        </div>
        <p class="meta"><strong>해커톤</strong><span>{{ selectedTeam.hackathonSlug || '없음' }}</span></p>

        <div class="apply-box" v-if="!canManageTeam(selectedTeam)">
          <div class="apply-controls">
            <select v-model="applyRole">
              <option disabled value="">지원 포지션 선택</option>
              <option v-for="position in getOpenPositions(selectedTeam)" :key="position.role" :value="position.role">
                {{ position.role }} ({{ position.remaining }}명 남음)
              </option>
            </select>
            <textarea v-model="applyMessage" rows="3" placeholder="팀장에게 남길 한마디 (선택)"></textarea>
            <button
              type="button"
              :disabled="!authStore.isLoggedIn"
              :title="!authStore.isLoggedIn ? '로그인 후 가입 신청할 수 있습니다.' : ''"
              @click="submitJoinRequest(selectedTeam)"
            >
              가입 신청
            </button>
          </div>
          <p v-if="!authStore.isLoggedIn" class="hint">로그인해야 가입 신청을 보낼 수 있습니다.</p>
          <p class="hint">기존 문의 링크는 그대로 유지됩니다.</p>
        </div>

        <div class="requests-box" v-if="canManageTeam(selectedTeam)">
          <h3>가입 신청 관리</h3>
          <p class="hint">팀장이 신청을 승인/거절할 수 있습니다.</p>
          <div v-if="pendingRequests(selectedTeam).length" class="request-list">
            <article v-for="request in pendingRequests(selectedTeam)" :key="request.id" class="request-card">
              <div>
                <strong>{{ request.nickname }}</strong>
                <p class="request-meta">@{{ request.userId }} · {{ request.role || '포지션 미선택' }} · {{ formatDate(request.createdAt) }}</p>
                <p class="request-message">{{ request.message || '메시지 없음' }}</p>
              </div>
              <div class="request-actions">
                <button type="button" class="approve" @click="reviewRequest(selectedTeam, request.id, 'accepted')">승인</button>
                <button type="button" class="reject" @click="reviewRequest(selectedTeam, request.id, 'rejected')">거절</button>
              </div>
            </article>
          </div>
          <p v-else class="hint">대기 중인 신청이 없습니다.</p>
        </div>

        <div class="edit-box" v-if="canManageTeam(selectedTeam)">
          <h3>모집 공고 수정</h3>
          <div class="edit-grid">
            <input v-model="editTeam.name" placeholder="팀명" />
            <input v-model="editTeam.intro" placeholder="소개" />
            <input v-model.number="editTeam.maxMembers" type="number" min="2" placeholder="팀 최대 인원" />
            <input v-model="editTeam.contact" placeholder="연락 링크" />
            <input v-model="editTeam.recruitDeadline" type="datetime-local" placeholder="모집 마감일" />
          </div>
          <div class="positions-section">
            <p class="positions-title">모집 포지션 수정</p>
            <div v-for="(position, index) in editTeam.positions" :key="`edit-${index}`" class="position-row">
              <select v-model="position.role" required>
                <option disabled value="">포지션 선택</option>
                <option v-for="option in positionOptions" :key="option" :value="option">{{ option }}</option>
                <option value="기타">기타(직접 입력)</option>
              </select>
              <input v-if="position.role === '기타'" v-model="position.customRole" placeholder="직접 입력" required />
              <input v-model.number="position.count" type="number" min="1" placeholder="인원" required />
              <button type="button" class="row-remove" @click="removeEditPosition(index)">삭제</button>
            </div>
            <button type="button" class="add-position" @click="addEditPosition">+ 포지션 추가</button>
          </div>
          <button type="button" @click="saveTeamEdit(selectedTeam)">모집 공고 저장</button>
        </div>

        <a v-if="selectedTeam.contact" :href="selectedTeam.contact" target="_blank" rel="noreferrer">가입 문의</a>
      </article>

      <div class="list" v-if="filteredTeams.length">
        <article v-for="team in filteredTeams" :key="team.code" class="team-card">
          <div class="team-card-head">
            <h3>{{ team.name }}</h3>
            <span class="status-chip" :class="store.isRecruitmentClosed(team) ? 'closed' : 'open'">{{ getRecruitStatusText(team) }}</span>
          </div>
          <p class="intro">{{ team.intro }}</p>
          <p class="meta"><strong>코드</strong><span>{{ team.code }}</span></p>
          <p class="meta"><strong>모집 현황</strong><span>{{ getRecruitProgressText(team) }}</span></p>
          <div class="meta">
            <strong>모집 포지션</strong>
            <div class="position-chips" v-if="team.positions?.length">
              <span v-for="position in team.positions" :key="`${position.role}-${position.count}`" class="position-chip">
                {{ position.role }} · {{ position.count }}명 {{ store.isRoleClosed(team, position.role) ? '(마감)' : '' }}
              </span>
            </div>
            <span v-else>-</span>
          </div>
          <p class="meta" v-if="team.hackathonSlug"><strong>해커톤</strong><span>{{ team.hackathonSlug }}</span></p>
        <div class="card-actions">
          <template v-if="!canManageTeam(team)">
            <select
              v-model="getCardApplyDraft(team.code).role"
              class="inline-apply-role"
              :disabled="!getOpenPositions(team).length"
              :title="!authStore.isLoggedIn ? '로그인 후 지원할 수 있습니다.' : ''"
            >
              <option disabled value="">지원 포지션 선택</option>
              <option
                v-for="position in getOpenPositions(team)"
                :key="`${team.code}-${position.role}`"
                :value="position.role"
              >
                {{ position.role }} ({{ position.remaining }}명 남음)
              </option>
            </select>
            <input
              v-model="getCardApplyDraft(team.code).message"
              class="inline-apply-message"
              :disabled="!getOpenPositions(team).length"
              :title="!authStore.isLoggedIn ? '로그인 후 메시지를 남길 수 있습니다.' : ''"
              placeholder="한마디 (선택)"
            />
          </template>
          <router-link class="detail-link" :to="`/teams/${team.code}`">상세 보기</router-link>
            <button
              v-if="!canManageTeam(team)"
              type="button"
              class="apply-btn"
              :disabled="!authStore.isLoggedIn || !getOpenPositions(team).length"
              :title="!authStore.isLoggedIn ? '로그인 후 가입 신청할 수 있습니다.' : ''"
              @click="submitJoinRequest(team, getCardApplyDraft(team.code))"
            >
              가입 신청
            </button>
            <button
              v-if="canManageTeam(team)"
              type="button"
              class="toggle-btn"
              @click="toggleRecruitment(team)"
            >
              {{ store.isRecruitmentClosed(team) ? '재오픈' : '모집 마감' }}
            </button>
            <a v-if="team.contact" :href="team.contact" target="_blank" rel="noreferrer" class="contact-link">가입 문의 ↗</a>
          </div>
        </article>
      </div>
      <StatusState v-else type="empty" message="조건에 맞는 팀이 없습니다." />
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHackathonStore } from '../stores/hackathon'
import { formatDateTimeKorean } from '../utils/dateTime'
import { useAuthStore } from '../stores/auth'
import StatusState from '../components/StatusState.vue'
import { POSITION_OPTIONS } from '../constants/positions'

const store = useHackathonStore()
const route = useRoute()
const authStore = useAuthStore()
const showForm = ref(false)
const positionOptions = POSITION_OPTIONS
const applyMessage = ref('')
const applyRole = ref('')
const cardApplyDrafts = ref({})
const teamFilters = ref({ search: '', status: 'all' })

const defaultPosition = () => ({ role: '', customRole: '', count: 1 })

const editTeam = ref({
  name: '',
  intro: '',
  maxMembers: null,
  contact: '',
  recruitDeadline: '',
  positions: [defaultPosition()]
})

const newTeam = ref({
  name: '',
  intro: '',
  positions: [defaultPosition()],
  maxMembers: null,
  contact: '',
  hackathonSlug: '',
  recruitDeadline: '',
  isOpen: true
})

onMounted(() => {
  store.loadData()
})

const filteredTeams = computed(() => {
  const hackathon = route.query.hackathon
  const keyword = teamFilters.value.search.toLowerCase()

  return store.teams
    .filter((team) => {
      if (hackathon && team.hackathonSlug !== hackathon) return false
      if (teamFilters.value.status === 'open' && store.isRecruitmentClosed(team)) return false
      if (teamFilters.value.status === 'closed' && !store.isRecruitmentClosed(team)) return false

      if (!keyword) return true
      const searchableText = [
        team.name,
        team.intro,
        ...(team.positions || []).map((position) => position.role)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(keyword)
    })
    .sort((a, b) => Number(store.isRecruitmentClosed(a)) - Number(store.isRecruitmentClosed(b)))
})

const hasActiveTeamFilters = computed(
  () => teamFilters.value.status !== 'all' || Boolean(teamFilters.value.search)
)

const ownerPendingRequestCount = computed(() => {
  const userId = authStore.currentUser?.id
  if (!userId) return 0

  return store.teams
    .filter((team) => team.ownerId === userId)
    .reduce(
      (total, team) => total + (team.joinRequests || []).filter((request) => request.status === 'pending').length,
      0
    )
})

const resetTeamFilters = () => {
  teamFilters.value = { search: '', status: 'all' }
}

const selectedTeam = computed(() => {
  const teamCode = route.params.teamCode
  if (!teamCode) return null
  return store.getTeamByCode(teamCode)
})

const canManageTeam = (team) =>
  authStore.isLoggedIn && authStore.currentUser?.id && team.ownerId === authStore.currentUser.id

const addPosition = () => {
  newTeam.value.positions.push(defaultPosition())
}

const removePosition = (index) => {
  if (newTeam.value.positions.length === 1) {
    newTeam.value.positions = [defaultPosition()]
    return
  }
  newTeam.value.positions.splice(index, 1)
}

const getRecruitStatusText = (team) => {
  if (store.isRecruitmentClosed(team)) {
    return team.recruitDeadline ? '마감(기간 종료)' : '마감'
  }
  if (!team.recruitDeadline) return '모집중'
  return `모집중 · ${formatDateTimeKorean(team.recruitDeadline)} 마감`
}

const getRecruitProgressText = (team) => {
  const current = Number(team.memberCount) || team.members?.length || 0
  if (team.maxMembers) {
    const remaining = Math.max(team.maxMembers - current, 0)
    return `${current}/${team.maxMembers}명 · ${remaining}명 모집중`
  }
  return `${current}명 참여중`
}

const formatDate = (value) => formatDateTimeKorean(value)

const getOpenPositions = (team) =>
  (team.positions || [])
    .map((position) => ({
      ...position,
      remaining: Math.max(Number(position.count || 0) - store.getAcceptedRoleCount(team, position.role), 0)
    }))
    .filter((position) => position.remaining > 0)

const pendingRequests = (team) =>
  (team.joinRequests || []).filter((request) => request.status === 'pending')

const getCardApplyDraft = (teamCode) => {
  const safeTeamCode = String(teamCode || '').trim()
  if (!safeTeamCode) return { role: '', message: '' }

  if (!cardApplyDrafts.value[safeTeamCode]) {
    cardApplyDrafts.value[safeTeamCode] = { role: '', message: '' }
  }
  return cardApplyDrafts.value[safeTeamCode]
}

const submitJoinRequest = (team, form = {}) => {
  if (!authStore.isLoggedIn) {
    alert('가입 신청은 로그인 후 가능합니다.')
    return
  }

  const selectedRole = String(form.role ?? applyRole.value).trim()
  const selectedMessage = String(form.message ?? applyMessage.value).trim()

  try {
    store.applyToTeam({
      teamCode: team.code,
      userId: authStore.currentUser?.id,
      nickname: authStore.currentUser?.nickname,
      message: selectedMessage,
      role: selectedRole
    })
    applyMessage.value = ''
    applyRole.value = ''
    if (team?.code && cardApplyDrafts.value[team.code]) {
      cardApplyDrafts.value[team.code] = { role: '', message: '' }
    }
    alert('가입 신청이 접수되었습니다. 팀장의 확인을 기다려주세요.')
  } catch (error) {
    alert(error instanceof Error ? error.message : '가입 신청 중 오류가 발생했습니다.')
  }
}

const reviewRequest = (team, requestId, decision) => {
  try {
    store.reviewJoinRequest({
      teamCode: team.code,
      requestId,
      reviewerId: authStore.currentUser?.id,
      decision
    })
    alert(decision === 'accepted' ? '신청을 승인했습니다.' : '신청을 거절했습니다.')
  } catch (error) {
    alert(error instanceof Error ? error.message : '신청 처리 중 오류가 발생했습니다.')
  }
}

const addEditPosition = () => {
  editTeam.value.positions.push(defaultPosition())
}

const removeEditPosition = (index) => {
  if (editTeam.value.positions.length === 1) {
    editTeam.value.positions = [defaultPosition()]
    return
  }
  editTeam.value.positions.splice(index, 1)
}

const syncEditTeam = (team) => {
  editTeam.value = {
    name: team?.name || '',
    intro: team?.intro || '',
    maxMembers: team?.maxMembers || null,
    contact: team?.contact || '',
    recruitDeadline: team?.recruitDeadline || '',
    positions: (team?.positions || []).length
      ? team.positions.map((position) => ({ role: position.role, customRole: '', count: position.count }))
      : [defaultPosition()]
  }
}

watch(
  selectedTeam,
  (team) => {
    if (team && canManageTeam(team)) {
      syncEditTeam(team)
    }
    if (!team || canManageTeam(team)) return
    applyRole.value = ''
    applyMessage.value = ''
  },
  { immediate: true }
)

const saveTeamEdit = (team) => {
  try {
    const positions = editTeam.value.positions
      .map((position) => ({
        role: position.role === '기타' ? position.customRole.trim() : position.role,
        count: Number(position.count) > 0 ? Number(position.count) : 1
      }))
      .filter((position) => position.role)

    store.updateTeamRecruitmentPost({
      teamCode: team.code,
      ownerId: authStore.currentUser?.id,
      payload: {
        ...editTeam.value,
        positions
      }
    })
    alert('모집 공고를 수정했습니다.')
  } catch (error) {
    alert(error instanceof Error ? error.message : '모집 공고 수정 중 오류가 발생했습니다.')
  }
}

const toggleRecruitment = (team) => {
  try {
    store.setTeamRecruitmentOpen({
      teamCode: team.code,
      ownerId: authStore.currentUser?.id,
      isOpen: store.isRecruitmentClosed(team)
    })
  } catch (error) {
    alert(error instanceof Error ? error.message : '모집 상태 변경 중 오류가 발생했습니다.')
  }
}

const createTeam = () => {
  if (!authStore.isLoggedIn) {
    alert('팀 생성은 로그인 후 가능합니다.')
    return
  }

  const positions = newTeam.value.positions
    .map((position) => ({
      role: position.role === '기타' ? position.customRole.trim() : position.role,
      count: Number(position.count) > 0 ? Number(position.count) : 1
    }))
    .filter((position) => position.role)

  store.addTeam({
    code: `team-${Date.now().toString().slice(-6)}`,
    ...newTeam.value,
    ownerId: authStore.currentUser?.id || '',
    ownerNickname: authStore.currentUser?.nickname || '',
    members: [authStore.currentUser?.id].filter(Boolean),
    memberCount: 1,
    maxMembers: Number(newTeam.value.maxMembers) > 1 ? Number(newTeam.value.maxMembers) : null,
    joinRequests: [],
    positions,
    lookingFor: positions.map((position) => `${position.role} ${position.count}명`).join(', ')
  })
  newTeam.value = {
    name: '',
    intro: '',
    positions: [defaultPosition()],
    maxMembers: null,
    contact: '',
    hackathonSlug: '',
    recruitDeadline: '',
    isOpen: true
  }
  showForm.value = false
}
</script>

<style scoped>
.teams { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
.auth-guide { margin: 0 0 0.7rem; border-radius: 10px; padding: 0.6rem 0.75rem; font-weight: 600; }
.auth-guide.warn { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
.auth-guide.ok { background: #ecfdf5; border: 1px solid #86efac; color: #166534; }
.owner-alert { margin: 0 0 0.7rem; border-radius: 10px; padding: 0.55rem 0.75rem; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a; }
.owner-alert a { margin-left: 0.25rem; color: #1d4ed8; font-weight: 700; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
button { border: none; border-radius: 10px; background: #4f46e5; color: #fff; padding: 0.6rem 0.95rem; cursor: pointer; font-weight: 700; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.25); }
button:disabled { cursor: not-allowed; opacity: 0.55; box-shadow: none; }
.team-filters { margin: 0.3rem 0 0.2rem; display: flex; gap: 0.6rem; flex-wrap: wrap; }
.team-filters input,
.team-filters select { border: 1px solid #d0d8e6; border-radius: 10px; padding: 0.62rem; min-width: 200px; background: #fff; color: #0f172a; }
.reset-filters { background: #fff; color: #334155; border: 1px solid #cbd5e1; box-shadow: none; }
.filter-result { margin: 0.1rem 0 0.8rem; color: #475569; }
.form { margin: 1rem 0; background: #fff; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 14px; display: grid; gap: 0.6rem; }
input, select, textarea { border: 1px solid #d0d8e6; border-radius: 10px; padding: 0.6rem; background: #fff; color: #0f172a; }
.positions-section { border: 1px dashed #c7d2fe; border-radius: 12px; padding: 0.75rem; display: grid; gap: 0.5rem; }
.positions-title { margin: 0; font-weight: 700; color: #312e81; }
.position-row { display: flex; gap: 0.45rem; align-items: center; }
.position-row > * { flex: 1; }
.position-row .row-remove { flex: 0 0 auto; }
.row-remove { background: #e2e8f0; color: #334155; box-shadow: none; }
.add-position { background: #eef2ff; color: #4338ca; box-shadow: none; }
.detail-card { background: #eef2ff; border: 1px solid #d9e2ff; border-radius: 14px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 12px 28px rgba(59, 130, 246, 0.13); }
.detail-header { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; }
.list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.9rem; }
.team-card { background: linear-gradient(180deg, #fff, #f9fbff); border: 1px solid #e2e8f0; border-radius: 14px; padding: 1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06); }
.team-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.6rem; }
.team-card h3 { margin: 0; }
.status-chip { border-radius: 999px; padding: 0.2rem 0.55rem; font-size: 0.74rem; font-weight: 700; white-space: nowrap; }
.status-chip.open { background: #e7f9ef; color: #0f8c4b; }
.status-chip.closed { background: #f3f4f6; color: #475569; }
.intro { color: #334155; margin: 0.6rem 0; min-height: 2.8em; }
.meta { color: #475569; font-size: 0.9rem; margin: 0.25rem 0; display: grid; gap: 0.25rem; }
.meta strong { font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; color: #1e1b4b; font-weight: 800; }
.position-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.position-chip { font-size: 0.78rem; padding: 0.18rem 0.5rem; border-radius: 999px; background: #e0e7ff; color: #312e81; font-weight: 700; }
.contact-link { display: inline-block; color: #4338ca; font-weight: 700; text-decoration: none; }
.detail-link { display: inline-block; background: #e0e7ff; color: #312e81; border-radius: 10px; padding: 0.45rem 0.7rem; text-decoration: none; font-weight: 700; }
.card-actions { margin-top: 0.65rem; display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: center; }
.inline-apply-role { min-width: 170px; }
.inline-apply-message { min-width: 160px; }
.apply-btn { background: #2563eb; }
.toggle-btn { background: #0f766e; }
.apply-box, .requests-box, .edit-box { margin-top: 0.9rem; padding: 0.75rem; border-radius: 12px; border: 1px solid #c7d2fe; background: #fff; }
.apply-controls { display: grid; gap: 0.55rem; grid-template-columns: minmax(170px, 210px) minmax(0, 1fr) auto; align-items: end; }
.apply-controls textarea { min-height: 72px; resize: vertical; }
.apply-controls button { white-space: nowrap; height: fit-content; }
.edit-grid { display: grid; gap: 0.45rem; margin-bottom: 0.55rem; }
.requests-box h3 { margin: 0; }
.hint { margin: 0.4rem 0 0; color: #475569; font-size: 0.85rem; }
.request-list { display: grid; gap: 0.5rem; margin-top: 0.65rem; }
.request-card { padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 10px; display: flex; justify-content: space-between; gap: 0.5rem; align-items: flex-start; }
.request-meta { margin: 0.2rem 0; color: #64748b; font-size: 0.8rem; }
.request-message { margin: 0; color: #334155; }
.request-actions { display: flex; gap: 0.35rem; }
.request-actions .approve { background: #16a34a; }
.request-actions .reject { background: #dc2626; }
@media (max-width: 760px) {
  .apply-controls { grid-template-columns: 1fr; align-items: stretch; }
  .apply-controls button { justify-self: stretch; }
}
</style>
