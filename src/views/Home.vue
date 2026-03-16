<template>
  <section class="home">
    <div class="hero-shell">
      <div class="hero-bg hero-bg--left" aria-hidden="true"></div>
      <div class="hero-bg hero-bg--right" aria-hidden="true"></div>

      <div class="hero-top">
        <p class="eyebrow">HACKATHON OPS SUITE</p>
        <span class="status-pill">Live · {{ liveEventsCount }} events</span>
      </div>

      <h1>운영, 팀빌딩, 랭킹을 한 화면에서<br />더 빠르고 세련되게.</h1>
      <p class="lead">
        불필요한 여백은 줄이고 핵심 액션은 전면 배치했습니다.
        지금 진행중인 해커톤부터 팀 모집, 실시간 순위까지 바로 이동하세요.
      </p>

      <div class="quick-actions">
        <router-link to="/hackathons" class="action action--primary">해커톤 탐색하기</router-link>
        <router-link to="/rankings" class="action action--ghost">실시간 랭킹 보기</router-link>
      </div>

      <div class="cards">
        <router-link to="/hackathons" class="entry">
          <p class="entry-kicker">DISCOVER</p>
          <strong>해커톤 보러가기</strong>
          <span>일정/상태/태그 필터로 원하는 대회를 빠르게 탐색</span>
        </router-link>
        <router-link to="/camp" class="entry">
          <p class="entry-kicker">TEAM UP</p>
          <strong>팀 찾기</strong>
          <span>필요 포지션 확인 후 바로 컨택하고 팀 구성</span>
        </router-link>
        <router-link to="/rankings" class="entry">
          <p class="entry-kicker">RANKING</p>
          <strong>랭킹 보기</strong>
          <span>실시간 점수와 상위 팀 변화를 한눈에 확인</span>
        </router-link>
      </div>

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
.cards,
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

.cards {
  margin-top: 1.15rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.entry {
  display: grid;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid #dce6fb;
  border-radius: 16px;
  padding: 0.95rem;
  text-decoration: none;
  color: #0f172a;
  backdrop-filter: blur(6px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.07);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.entry:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 26px rgba(79, 70, 229, 0.2);
  border-color: #becdf7;
}

.entry-kicker {
  margin: 0;
  color: #4f46e5;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  font-weight: 800;
}

.entry span {
  color: #475569;
  font-size: 0.87rem;
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

@media (max-width: 900px) {
  .cards,
  .stats {
    grid-template-columns: 1fr;
  }

  .hero-shell {
    padding: 1.2rem;
  }

  h1 br {
    display: none;
  }
}
</style>
