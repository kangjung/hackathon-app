<template>
  <section class="home">
    <div class="hero">
      <p class="eyebrow">PREMIUM HACKATHON HUB</p>
      <h1>아이디어를 결과로 연결하는<br />실전형 해커톤 플랫폼</h1>
      <p class="lead">
        참가자와 팀이 바로 도전할 수 있도록 현재 진행 중인 대회, 팀 매칭, 랭킹까지 한 번에 제공합니다.
        실제 상용 공모전 사이트처럼 신뢰감 있고 빠른 탐색 경험에 집중했습니다.
      </p>

      <div class="cta-row">
        <router-link to="/hackathons" class="btn btn-primary">지금 참가 가능한 대회 보기</router-link>
        <router-link to="/teams" class="btn btn-secondary">팀 모집/합류 시작</router-link>
        <router-link to="/rankings" class="btn btn-secondary">글로벌 랭킹 확인</router-link>
      </div>

      <div class="kpis" aria-label="서비스 핵심 지표">
        <article>
          <p>진행중/예정 대회</p>
          <strong>{{ liveEventsCount }}</strong>
        </article>
        <article>
          <p>모집중 팀</p>
          <strong>{{ recruitingTeamsCount }}</strong>
        </article>
        <article>
          <p>등록 프로젝트</p>
          <strong>{{ activeProjectsCount }}</strong>
        </article>
        <article>
          <p>오늘 제출 업데이트</p>
          <strong>{{ todayUpdatesCount }}</strong>
        </article>
      </div>
    </div>

    <section class="section">
      <div class="section-head">
        <h2>추천 해커톤</h2>
        <router-link to="/hackathons">전체 보기</router-link>
      </div>
      <div class="event-grid">
        <article v-for="hackathon in featuredHackathons" :key="hackathon.slug" class="event-card">
          <div class="event-top">
            <span :class="['status', `status-${hackathon.status}`]">{{ hackathon.statusLabel }}</span>
            <small>{{ hackathon.startDate }} ~ {{ hackathon.endDate }}</small>
          </div>
          <h3>{{ hackathon.title }}</h3>
          <p>{{ hackathon.summary || '상세 페이지에서 주제, 트랙, 심사 기준을 확인해보세요.' }}</p>
          <div class="tags" v-if="hackathon.tags?.length">
            <span v-for="tag in hackathon.tags.slice(0, 3)" :key="tag">#{{ tag }}</span>
          </div>
          <router-link :to="`/hackathons/${hackathon.slug}`" class="text-link">상세 보기 →</router-link>
        </article>
      </div>
    </section>

    <section class="section howto">
      <h2>참가까지 3단계</h2>
      <div class="steps">
        <article>
          <span>01</span>
          <h3>대회 탐색</h3>
          <p>카테고리/상태 필터로 내 일정과 기술 스택에 맞는 대회를 선택합니다.</p>
        </article>
        <article>
          <span>02</span>
          <h3>팀 결성</h3>
          <p>필요 포지션 중심으로 팀을 만들거나 기존 팀에 지원해 빠르게 매칭합니다.</p>
        </article>
        <article>
          <span>03</span>
          <h3>제출 & 랭킹 확인</h3>
          <p>마감 전에 프로젝트를 제출하고 실시간 랭킹으로 결과를 추적합니다.</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>명세 체크 현황</h2>
        <small>첨부 메모 기준 주요 흐름 점검</small>
      </div>
      <div class="check-grid">
        <article v-for="item in specChecks" :key="item.name" class="check-card">
          <div class="check-top">
            <strong>{{ item.name }}</strong>
            <span :class="['check-chip', item.done ? 'done' : 'todo']">{{ item.done ? '구현됨' : '미흡' }}</span>
          </div>
          <p>{{ item.description }}</p>
          <router-link :to="item.to">화면 확인</router-link>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>상용 서비스 확장 제안</h2>
        <small>이용자 편의성 중심 우선순위</small>
      </div>
      <div class="roadmap">
        <article v-for="plan in growthPlans" :key="plan.title">
          <h3>{{ plan.title }}</h3>
          <ul>
            <li v-for="item in plan.items" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHackathonStore } from '../stores/hackathon'

const hackathonStore = useHackathonStore()
const { hackathons, teams, leaderboards, submissions } = storeToRefs(hackathonStore)

const liveEventsCount = computed(() =>
  hackathons.value.filter((hackathon) => ['ongoing', 'upcoming'].includes(hackathon.status)).length
)

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

const featuredHackathons = computed(() =>
  hackathons.value
    .slice()
    .sort((a, b) => {
      const priority = { ongoing: 0, upcoming: 1, closed: 2, ended: 3 }
      return (priority[a.status] ?? 9) - (priority[b.status] ?? 9)
    })
    .slice(0, 3)
)

const specChecks = computed(() => [
  {
    name: '메인 이동 버튼 3종',
    description: '해커톤/팀캠프/랭킹으로 즉시 이동 가능한 CTA를 제공합니다.',
    to: '/',
    done: true
  },
  {
    name: '해커톤 목록 + 필터',
    description: '상태/검색/태그 필터와 상세 이동 동선을 제공합니다.',
    to: '/hackathons',
    done: true
  },
  {
    name: '해커톤 상세 7개 섹션',
    description: '개요·평가·일정·상금·팀·제출·리더보드 섹션이 모두 구성되어 있습니다.',
    to: featuredHackathons.value[0] ? `/hackathons/${featuredHackathons.value[0].slug}` : '/hackathons',
    done: true
  },
  {
    name: '팀 모집/지원/승인 플로우',
    description: '팀 생성, 포지션별 지원, 팀장 승인/거절, 모집 마감 처리를 제공합니다.',
    to: '/camp',
    done: true
  },
  {
    name: '글로벌 랭킹 + 기간 필터',
    description: '전체/7일/30일 기준 랭킹 집계를 제공합니다.',
    to: '/rankings',
    done: true
  }
])

const growthPlans = [
  {
    title: 'P0 · 운영 안정성',
    items: [
      '로그/분석 대시보드: 페이지 이탈·제출 실패 원인 추적',
      '권한 분리 강화: 운영자/심사위원/참가자 역할별 접근 제어',
      '모집·제출 마감 자동화: 일정 기반 자동 잠금 + 알림'
    ]
  },
  {
    title: 'P1 · 사용자 편의성',
    items: [
      '개인화 추천: 관심 태그·북마크 기반 대회/팀 추천',
      '신청함/알림센터: 팀 신청 상태, 심사 결과, 마감 리마인드 통합',
      '제출 가이드 위저드: 단계별 체크리스트 + 실시간 유효성 검사'
    ]
  },
  {
    title: 'P2 · 상용화 성장 기능',
    items: [
      '결제/후원 연동: 유료 대회 등록, 기업 스폰서 패키지',
      '기업 채용 연계: 수상·참가 이력 기반 인재풀 공개 프로필',
      'API/외부 연동: GitHub, Slack, Discord와 자동 동기화'
    ]
  }
]

onMounted(() => {
  hackathonStore.loadData()
})
</script>

<style scoped>
.home { max-width: 1180px; margin: 0 auto; padding: 1.5rem 1rem 2.5rem; }
.hero {
  border: 1px solid #dbe6ff;
  border-radius: 24px;
  padding: 2rem;
  background: linear-gradient(150deg, #ffffff 0%, #eef3ff 100%);
  box-shadow: 0 18px 45px rgba(30, 64, 175, 0.12);
}
.eyebrow { margin: 0; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.12em; color: #3730a3; }
h1 { margin: 0.7rem 0; font-size: clamp(2rem, 4vw, 3rem); line-height: 1.14; color: #0f172a; }
.lead { margin: 0; max-width: 760px; color: #334155; }
.cta-row { margin-top: 1.25rem; display: flex; gap: 0.7rem; flex-wrap: wrap; }
.btn {
  text-decoration: none;
  border-radius: 12px;
  padding: 0.68rem 1.05rem;
  font-weight: 700;
}
.btn-primary { color: #fff; background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%); }
.btn-secondary { color: #334155; border: 1px solid #cfdaf9; background: #fff; }
.kpis { margin-top: 1.3rem; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; }
.kpis article { border: 1px solid #dce6fb; border-radius: 14px; padding: 0.8rem; background: rgba(255, 255, 255, 0.8); }
.kpis p { margin: 0; color: #64748b; font-size: 0.8rem; }
.kpis strong { display: block; margin-top: 0.2rem; color: #0f172a; font-size: 1.2rem; }
.section { margin-top: 1.4rem; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
.section-head h2, .howto h2 { margin: 0; color: #0f172a; }
.section-head a { color: #3730a3; text-decoration: none; font-weight: 700; }
.event-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.8rem; }
.event-card { border: 1px solid #dbe4f6; border-radius: 16px; padding: 0.9rem; background: #fff; }
.event-top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.status { font-size: 0.74rem; font-weight: 700; border-radius: 999px; padding: 0.25rem 0.55rem; }
.status-ongoing { background: #dcfce7; color: #166534; }
.status-upcoming { background: #dbeafe; color: #1d4ed8; }
.status-closed, .status-ended { background: #f1f5f9; color: #334155; }
.event-card h3 { margin: 0.65rem 0 0.4rem; color: #0f172a; }
.event-card p { margin: 0; color: #475569; font-size: 0.9rem; }
.tags { margin-top: 0.65rem; display: flex; flex-wrap: wrap; gap: 0.35rem; }
.tags span { background: #eef2ff; color: #3730a3; padding: 0.2rem 0.5rem; border-radius: 999px; font-size: 0.75rem; }
.text-link { display: inline-block; margin-top: 0.7rem; color: #1e3a8a; text-decoration: none; font-weight: 700; }
.steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.8rem; margin-top: 0.75rem; }
.steps article { border: 1px solid #dbe4f6; border-radius: 16px; padding: 0.95rem; background: #fff; }
.steps span { font-size: 0.78rem; font-weight: 800; color: #4f46e5; }
.steps h3 { margin: 0.3rem 0 0.35rem; color: #0f172a; }
.steps p { margin: 0; color: #475569; font-size: 0.9rem; }
.check-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.8rem; }
.check-card { border: 1px solid #dbe4f6; border-radius: 16px; padding: 0.9rem; background: #fff; }
.check-top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.check-card p { margin: 0.45rem 0 0.6rem; color: #475569; font-size: 0.9rem; }
.check-card a { color: #312e81; font-weight: 700; text-decoration: none; }
.check-chip { font-size: 0.72rem; border-radius: 999px; padding: 0.22rem 0.52rem; font-weight: 800; }
.check-chip.done { background: #dcfce7; color: #166534; }
.check-chip.todo { background: #fee2e2; color: #991b1b; }
.roadmap { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.8rem; }
.roadmap article { border: 1px solid #dbe4f6; border-radius: 16px; background: #fff; padding: 0.95rem; }
.roadmap h3 { margin: 0; color: #0f172a; font-size: 1rem; }
.roadmap ul { margin: 0.6rem 0 0; padding-left: 1rem; color: #475569; }
.roadmap li + li { margin-top: 0.35rem; }
small { color: #64748b; font-weight: 600; }
@media (max-width: 980px) {
  .kpis, .event-grid, .steps, .check-grid, .roadmap { grid-template-columns: 1fr; }
  .hero { padding: 1.25rem; }
}
</style>
