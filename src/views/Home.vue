<template>
  <section class="home">
    <div class="hero-shell">
      <div class="hero-bg hero-bg--left" aria-hidden="true"></div>
      <div class="hero-bg hero-bg--right" aria-hidden="true"></div>

      <div class="hero-top">
        <p class="eyebrow">HACKATHON OPS SUITE</p>
        <span class="status-pill">Live · {{ liveEventsCount }} events</span>
      </div>

      <h1>내 역할에 맞는 버튼부터, 지금 바로 시작하세요.</h1>
      <p class="lead">
        메인 화면에서 참가자 · 팀리더 · 운영자 여정을 각각 분리해 보여줍니다.
        역할을 선택하고 카드 순서대로 눌러서 빠르게 목적지로 이동하세요.
      </p>

      <div class="quick-actions">
        <router-link to="/auth" class="action action--primary">내 역할 선택하기</router-link>
        <router-link to="/hackathons" class="action action--ghost">진행중 해커톤 확인</router-link>
      </div>

      <section class="journeys" aria-label="역할별 사용자 여정">
        <article
          v-for="journey in roleJourneys"
          :key="journey.role"
          class="journey-column"
        >
          <header class="journey-header">
            <p class="journey-label">{{ journey.badge }}</p>
            <h2>{{ journey.role }}</h2>
            <p>{{ journey.summary }}</p>
          </header>

          <ol class="journey-steps">
            <li
              v-for="step in journey.steps"
              :key="`${journey.role}-${step.order}`"
              class="step-card"
            >
              <span class="step-index">STEP {{ step.order }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
              <router-link :to="step.to" class="step-cta">{{ step.cta }}</router-link>
            </li>
          </ol>
        </article>
      </section>

      <div class="stats">
        <article>
          <p>활성 프로젝트</p>
          <strong>{{ activeProjectsCount }}</strong>
        </article>
        <article>
          <p>모집중 팀</p>
          <strong>{{ recruitingTeamsCount }}</strong>
        </article>
        <article>
          <p>오늘 업데이트</p>
          <strong>{{ todayUpdatesCount }}건</strong>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHackathonStore } from '../stores/hackathon'

const hackathonStore = useHackathonStore()
const { hackathons, teams, leaderboards, submissions } = storeToRefs(hackathonStore)

const roleJourneys = [
  {
    badge: 'PARTICIPANT FLOW',
    role: '참가자',
    summary: '관심 대회를 찾고 팀에 합류한 뒤 제출/순위까지 빠르게 확인합니다.',
    steps: [
      {
        order: 1,
        title: '로그인/회원가입',
        description: '계정을 만들고 내 프로필을 준비해 매칭 정확도를 높입니다.',
        cta: '계정 시작하기',
        to: '/auth'
      },
      {
        order: 2,
        title: '해커톤 탐색',
        description: '일정·상태·태그 기준으로 참가할 해커톤을 선택합니다.',
        cta: '해커톤 둘러보기',
        to: '/hackathons'
      },
      {
        order: 3,
        title: '팀 찾기/지원',
        description: '모집중 팀의 필요 포지션을 확인하고 바로 컨택합니다.',
        cta: '팀 모집 보기',
        to: '/teams'
      },
      {
        order: 4,
        title: '결과 추적',
        description: '제출 이후 랭킹 변화를 실시간으로 체크하며 개선 포인트를 찾습니다.',
        cta: '실시간 랭킹 보기',
        to: '/rankings'
      }
    ]
  },
  {
    badge: 'TEAM LEADER FLOW',
    role: '팀리더',
    summary: '팀을 생성하고 멤버를 구성해 제출과 랭킹 관리까지 주도합니다.',
    steps: [
      {
        order: 1,
        title: '리더 계정 준비',
        description: '팀 소개와 연락 채널을 포함해 리더 프로필을 먼저 완성합니다.',
        cta: '리더로 로그인',
        to: '/auth'
      },
      {
        order: 2,
        title: '대회 선택 및 팀 생성',
        description: '참가할 대회를 정한 뒤 팀 코드와 목표를 설정합니다.',
        cta: '대회 상세 보기',
        to: '/hackathons'
      },
      {
        order: 3,
        title: '포지션별 멤버 모집',
        description: '필요 역할을 공개하고 지원자와 소통해 팀을 완성합니다.',
        cta: '팀 모집 열기',
        to: '/camp'
      },
      {
        order: 4,
        title: '중간 점검/제출 관리',
        description: '팀 진행 상황을 점검하고 제출 마감 전에 산출물을 정리합니다.',
        cta: '내 팀 관리하기',
        to: '/me'
      },
      {
        order: 5,
        title: '결과 공유',
        description: '순위와 피드백을 확인하고 팀 회고를 진행합니다.',
        cta: '랭킹 확인하기',
        to: '/rankings'
      }
    ]
  },
  {
    badge: 'OPERATOR FLOW',
    role: '운영자',
    summary: '대회 운영 전 과정을 한 화면에서 모니터링하고 빠르게 대응합니다.',
    steps: [
      {
        order: 1,
        title: '운영자 로그인',
        description: '권한 계정으로 접속해 운영자 관점의 핵심 메뉴를 엽니다.',
        cta: '운영자 로그인',
        to: '/auth'
      },
      {
        order: 2,
        title: '대회 상태 점검',
        description: '진행중/예정/종료 상태를 확인하고 공지 대상을 구분합니다.',
        cta: '대회 목록 점검',
        to: '/hackathons'
      },
      {
        order: 3,
        title: '팀/모집 모니터링',
        description: '모집중 팀 수와 포지션 불균형을 보고 운영 지원 우선순위를 정합니다.',
        cta: '팀 현황 보기',
        to: '/teams'
      },
      {
        order: 4,
        title: '제출/심사 진행 관리',
        description: '제출 현황을 추적하고 심사 단계 전환 시점을 관리합니다.',
        cta: '제출 데이터 확인',
        to: '/rankings'
      },
      {
        order: 5,
        title: '결과 발표 및 후속 운영',
        description: '최종 순위를 공지하고 다음 프로그램 안내까지 연결합니다.',
        cta: '최종 랭킹 발표',
        to: '/rankings'
      }
    ]
  }
]

const liveEventsCount = computed(() => hackathons.value.length)

const activeProjectsCount = computed(() => {
  const submittedProjects = submissions.value.length
  if (submittedProjects > 0) return submittedProjects
  return leaderboards.value.length
})

const recruitingTeamsCount = computed(() =>
  teams.value.filter((team) => !hackathonStore.isRecruitmentClosed(team)).length
)

const todayUpdatesCount = computed(() => {
  const today = new Date()
  const isSameDay = (date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  return submissions.value.filter((submission) => {
    const submittedAt = new Date(submission.submittedAt)
    if (Number.isNaN(submittedAt.getTime())) return false
    return isSameDay(submittedAt)
  }).length
})

onMounted(() => {
  hackathonStore.loadData()
})
</script>

<style scoped>
.home {
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.2rem 1rem 1.6rem;
}

.hero-shell {
  position: relative;
  overflow: hidden;
  border: 1px solid #d7e2fb;
  border-radius: 28px;
  padding: 1.5rem;
  background: radial-gradient(circle at 15% 10%, #ffffff 0%, #f4f7ff 45%, #edf2ff 100%);
  box-shadow: 0 20px 55px rgba(45, 72, 152, 0.12);
}

.hero-bg {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(10px);
}

.hero-bg--left {
  width: 320px;
  height: 320px;
  left: -120px;
  top: -140px;
  background: rgba(56, 189, 248, 0.18);
}

.hero-bg--right {
  width: 360px;
  height: 360px;
  right: -140px;
  bottom: -200px;
  background: rgba(99, 102, 241, 0.2);
}

.hero-top,
h1,
.lead,
.quick-actions,
.journeys,
.stats {
  position: relative;
  z-index: 1;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  color: #4338ca;
  font-weight: 800;
}

.status-pill {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(67, 56, 202, 0.1);
  color: #3730a3;
  font-size: 0.78rem;
  font-weight: 700;
}

h1 {
  margin: 0.85rem 0 0.6rem;
  line-height: 1.15;
  letter-spacing: -0.01em;
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  color: #0f172a;
}

.lead {
  max-width: 760px;
  color: #334155;
  margin: 0;
}

.quick-actions {
  margin-top: 1.1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border-radius: 12px;
  padding: 0.68rem 1rem;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action:hover {
  transform: translateY(-2px);
}

.action--primary {
  color: #fff;
  background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.3);
}

.action--ghost {
  color: #334155;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #d5ddf3;
}

.journeys {
  margin-top: 1.2rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.journey-column {
  border: 1px solid #dce6fb;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(6px);
  padding: 0.9rem;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.07);
}

.journey-header h2 {
  margin: 0.15rem 0 0.3rem;
  font-size: 1.2rem;
  color: #0f172a;
}

.journey-header p {
  margin: 0;
  color: #475569;
  font-size: 0.86rem;
}

.journey-label {
  margin: 0;
  color: #4f46e5;
  font-size: 0.72rem;
  letter-spacing: 0.09em;
  font-weight: 800;
}

.journey-steps {
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

.step-card {
  border: 1px solid #e3eafc;
  border-radius: 14px;
  background: #fff;
  padding: 0.75rem;
}

.step-index {
  display: inline-flex;
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #6366f1;
}

.step-card h3 {
  margin: 0.3rem 0;
  font-size: 0.95rem;
  color: #0f172a;
}

.step-card p {
  margin: 0;
  color: #475569;
  font-size: 0.82rem;
}

.step-cta {
  margin-top: 0.55rem;
  display: inline-flex;
  text-decoration: none;
  color: #3730a3;
  font-weight: 700;
  font-size: 0.8rem;
}

.stats {
  margin-top: 0.95rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.stats article {
  background: rgba(255, 255, 255, 0.66);
  border: 1px solid #dce3f5;
  border-radius: 14px;
  padding: 0.7rem 0.85rem;
}

.stats p {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
}

.stats strong {
  display: block;
  margin-top: 0.15rem;
  color: #0f172a;
  font-size: 1.1rem;
}

@media (max-width: 1080px) {
  .journeys {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .hero-shell {
    padding: 1.2rem;
  }
}
</style>
