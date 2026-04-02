<template>
  <section class="detail" v-if="hackathon">
    <p v-if="!authStore.isLoggedIn" class="auth-guide">
      현재 게스트로 둘러보는 중입니다. <router-link to="/auth">로그인</router-link>하면 북마크, 팀 제출이 가능합니다.
    </p>
    <header class="detail-header">
      <div>
        <h1>{{ detailTitle }}</h1>
        <p>{{ overviewSummary || hackathon.summary }}</p>
      </div>
      <button
        class="bookmark-btn"
        :class="{ active: isBookmarked }"
        :disabled="!authStore.isLoggedIn"
        :title="!authStore.isLoggedIn ? '로그인 후 북마크할 수 있습니다.' : ''"
        @click="toggleBookmark"
      >
        {{ isBookmarked ? '★ 북마크됨' : '☆ 북마크' }}
      </button>
    </header>

    <div class="tabs">
      <article>
        <h3>개요/안내</h3>
        <p>{{ overviewSummary || '-' }}</p>
        <p v-if="teamPolicyText">{{ teamPolicyText }}</p>
        <ul v-if="infoNoticeList.length">
          <li v-for="(notice, index) in infoNoticeList" :key="`notice-${index}`">{{ notice }}</li>
        </ul>
        <p class="links" v-if="rulesLink || faqLink">
          <a v-if="rulesLink" :href="rulesLink" target="_blank" rel="noopener">규정</a>
          <a v-if="faqLink" :href="faqLink" target="_blank" rel="noopener">FAQ</a>
        </p>
      </article>

      <article>
        <h3>평가</h3>
        <p>{{ evalMetricText }}</p>
        <p v-if="evalDescription">{{ evalDescription }}</p>
        <p v-if="evalLimitText">{{ evalLimitText }}</p>
      </article>

      <article>
        <h3>일정</h3>
        <p v-if="timezoneText">시간대: {{ timezoneText }}</p>
        <p v-if="nextMilestoneText" class="next-milestone">다음 마일스톤: {{ nextMilestoneText }}</p>
        <ul v-if="scheduleMilestones.length">
          <li v-for="(item, index) in scheduleMilestones" :key="`milestone-${index}`">
            {{ item.name }} — {{ formatDate(item.at) }}
          </li>
        </ul>
        <button
          type="button"
          class="calendar-btn"
          :disabled="!scheduleMilestones.length"
          :title="scheduleMilestones.length ? '' : '일정 정보가 있을 때만 내려받을 수 있습니다.'"
          @click="downloadScheduleCalendar"
        >
          일정 캘린더(.ics) 받기
        </button>
      </article>

      <article>
        <h3>상금</h3>
        <ul v-if="prizeItems.length">
          <li v-for="(item, index) in prizeItems" :key="`prize-${index}`">
            {{ item.place }}: {{ formatMoney(item.amountKRW) }}원
          </li>
        </ul>
        <p v-else>-</p>
      </article>

      <article>
        <h3>팀 캠프</h3>
        <p>현재 {{ teams.length }}팀 모집/참여 중</p>
        <router-link :to="teamsListUrl">팀 목록 확인 / 가입 문의</router-link>
      </article>

      <article>
        <h3>제출하기</h3>
        <p>
          허용 제출 형식:
          {{ submitTypes.length ? submitTypes.join(', ') : '미지정' }}
        </p>
        <ul v-if="submitGuideList.length">
          <li v-for="(guide, index) in submitGuideList" :key="`guide-${index}`">{{ guide }}</li>
        </ul>
        <p v-if="!authStore.isLoggedIn" class="submit-hint">제출은 로그인 후 가능합니다.</p>
        <p v-else-if="!myTeams.length" class="submit-hint">내가 만든 이 해커톤 팀이 있어야 제출할 수 있습니다.</p>
        <button :disabled="!canSubmit" :title="submitButtonTitle" @click="openSubmit">제출하기</button>
      </article>

      <article>
        <h3>리더보드</h3>
        <p>{{ leaderboardNote || '리더보드 점수와 순위를 표시합니다.' }}</p>
        <router-link :to="`/hackathons/${hackathon.slug}/leaderboard`">리더보드 보기</router-link>
      </article>
    </div>

    <SubmitModal
      v-if="showSubmit"
      :teams="myTeams"
      @close="showSubmit = false"
      @submit="onSubmit"
    />
  </section>

  <StatusState
    v-else-if="store.isLoading"
    type="loading"
    message="해커톤 상세를 불러오는 중입니다..."
  />
  <StatusState
    v-else-if="store.error"
    type="error"
    :message="`오류: ${store.error}`"
    @retry="store.loadData({ force: true })"
  />
  <StatusState v-else type="empty" message="존재하지 않는 해커톤입니다." />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHackathonStore } from '../stores/hackathon'
import { useAuthStore } from '../stores/auth'
import { formatDateTimeKorean } from '../utils/dateTime'
import SubmitModal from '../components/SubmitModal.vue'
import StatusState from '../components/StatusState.vue'

const route = useRoute()
const store = useHackathonStore()
const authStore = useAuthStore()
const showSubmit = ref(false)

onMounted(() => {
  store.loadData()
})

const slug = computed(() => route.params.slug)
const hackathon = computed(() => store.hackathons.find((h) => h.slug === slug.value))
const detail = computed(() => store.getHackathonDetail(slug.value) || {})
const sections = computed(() => detail.value.sections || {})
const teams = computed(() => store.getTeamsByHackathon(slug.value))
const myTeams = computed(() => {
  if (!authStore.currentUser?.id) return []
  return store.getMyTeamsByHackathon({ hackathonSlug: slug.value, userId: authStore.currentUser.id })
})
const canSubmit = computed(() => authStore.isLoggedIn && myTeams.value.length > 0)
const submitButtonTitle = computed(() => {
  if (!authStore.isLoggedIn) return '로그인 후 제출할 수 있습니다.'
  if (!myTeams.value.length) return '내가 만든 팀이 있어야 제출할 수 있습니다.'
  return ''
})
const isBookmarked = computed(() => authStore.isHackathonBookmarked(slug.value))

const detailTitle = computed(() => detail.value.title || hackathon.value?.title || '')
const overviewSummary = computed(() => sections.value.overview?.summary || '')
const teamPolicyText = computed(() => {
  const policy = sections.value.overview?.teamPolicy
  if (!policy) return ''
  return `개인 참가 ${policy.allowSolo ? '가능' : '불가'} / 최대 ${policy.maxTeamSize || '-'}인`
})
const infoNoticeList = computed(() => sections.value.info?.notice || [])
const rulesLink = computed(() => sections.value.info?.links?.rules || '')
const faqLink = computed(() => sections.value.info?.links?.faq || '')

const evalMetricText = computed(() => {
  const metric = sections.value.eval?.metricName
  return metric ? `지표: ${metric}` : '평가 지표 정보 없음'
})
const evalDescription = computed(() => sections.value.eval?.description || '')
const evalLimitText = computed(() => {
  const limits = sections.value.eval?.limits
  if (!limits) return ''
  const chunks = []
  if (limits.maxRuntimeSec) chunks.push(`최대 실행시간 ${limits.maxRuntimeSec}초`)
  if (limits.maxSubmissionsPerDay) chunks.push(`일일 제출 ${limits.maxSubmissionsPerDay}회`)
  return chunks.join(' / ')
})

const timezoneText = computed(() => sections.value.schedule?.timezone || '')
const scheduleMilestones = computed(() => sections.value.schedule?.milestones || [])
const nextMilestoneText = computed(() => {
  const now = Date.now()
  const next = scheduleMilestones.value
    .filter((item) => item?.at)
    .map((item) => ({ ...item, timestamp: new Date(item.at).getTime() }))
    .filter((item) => !Number.isNaN(item.timestamp) && item.timestamp >= now)
    .sort((a, b) => a.timestamp - b.timestamp)[0]

  if (!next) return ''
  return `${next.name} (${formatDate(next.at)})`
})
const prizeItems = computed(() => sections.value.prize?.items || [])
const submitTypes = computed(() => sections.value.submit?.allowedArtifactTypes || [])
const submitGuideList = computed(() => sections.value.submit?.guide || [])
const leaderboardNote = computed(() => sections.value.leaderboard?.note || '')
const teamsListUrl = computed(
  () => sections.value.teams?.listUrl || `/camp?hackathon=${hackathon.value?.slug || ''}`
)

const formatMoney = (amount) => Number(amount || 0).toLocaleString('ko-KR')
const formatDate = (value) => {
  if (!value) return '-'
  return formatDateTimeKorean(value, value)
}

const toggleBookmark = () => {
  if (!authStore.isLoggedIn) return
  authStore.toggleHackathonBookmark(slug.value)
}

const openSubmit = () => {
  if (!canSubmit.value) return
  showSubmit.value = true
}

const toIcsDate = (date) => {
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const ss = String(date.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`
}

const escapeIcsText = (text) =>
  String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')

const buildCalendarContent = () => {
  const baseTitle = detailTitle.value || hackathon.value?.title || slug.value
  const nowStamp = toIcsDate(new Date())
  const events = scheduleMilestones.value
    .filter((item) => item?.name && item?.at)
    .map((item, index) => {
      const start = new Date(item.at)
      if (Number.isNaN(start.getTime())) return null
      const end = new Date(start.getTime() + 60 * 60 * 1000)
      const uid = `${slug.value}-${index}-${start.getTime()}@vibe-hackathon`

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART:${toIcsDate(start)}`,
        `DTEND:${toIcsDate(end)}`,
        `SUMMARY:${escapeIcsText(`${baseTitle} · ${item.name}`)}`,
        `DESCRIPTION:${escapeIcsText(baseTitle)}`,
        'END:VEVENT'
      ].join('\n')
    })
    .filter(Boolean)

  if (!events.length) return ''

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VibeHackathon//Schedule//KR',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR'
  ].join('\n')
}

const downloadScheduleCalendar = () => {
  const calendarContent = buildCalendarContent()
  if (!calendarContent) return

  const blob = new Blob([calendarContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${slug.value || 'hackathon'}-schedule.ics`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

const onSubmit = ({ teamCode, planningUrl, webUrl, pdfUrl, notes }) => {
  if (!authStore.isLoggedIn) return
  const allowed = myTeams.value.some((team) => team.code === teamCode)
  if (!allowed) return
  store.submitProject({ hackathonSlug: slug.value, teamCode, planningUrl, webUrl, pdfUrl, notes })
}
</script>

<style scoped>
.detail { max-width: 1100px; margin: 1.5rem auto; padding: 0 1rem; }
.auth-guide { margin: 0 0 0.8rem; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; border-radius: 10px; padding: 0.6rem 0.75rem; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.tabs { margin-top: 1rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.9rem; }
article { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 1rem; }
ul { margin: 0.5rem 0 0; padding-left: 1rem; }
.links { display: flex; gap: 0.75rem; }
button { border: none; border-radius: 10px; background: #4f46e5; color: #fff; padding: 0.5rem 0.8rem; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.submit-hint { color: #475569; font-size: 0.9rem; }
a { color: #4338ca; }
.bookmark-btn { white-space: nowrap; background: #e2e8f0; color: #1e293b; }
.bookmark-btn.active { background: #f59e0b; color: #fff; }
.next-milestone { margin: 0.3rem 0 0.5rem; color: #1d4ed8; font-weight: 600; }
.calendar-btn { margin-top: 0.8rem; width: 100%; background: #1d4ed8; }
</style>
