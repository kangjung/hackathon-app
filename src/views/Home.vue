<template>
  <section class="home">
    <div class="hero">
      <p class="eyebrow">HACKATHON OPS SUITE</p>
      <h1>해커톤 운영부터 랭킹까지, 핵심 기능만 빠르게.</h1>
      <p class="lead">문서 기준 흐름에 맞춰 목록, 팀 모집, 제출, 리더보드까지 바로 이동할 수 있습니다.</p>
      <div class="cards">
        <router-link to="/hackathons" class="entry">
          <p class="entry-kicker">DISCOVER</p>
          <strong>해커톤 보러가기</strong>
          <span>일정/상태/태그 필터로 빠르게 탐색</span>
        </router-link>
        <router-link to="/camp" class="entry">
          <p class="entry-kicker">TEAM UP</p>
          <strong>팀 찾기</strong>
          <span>필요 포지션과 소개를 보고 바로 컨택</span>
        </router-link>
        <router-link to="/rankings" class="entry">
          <p class="entry-kicker">RANKING</p>
          <strong>랭킹 보기</strong>
          <span>실시간 점수와 상위 팀 현황 확인</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home { max-width: 1100px; margin: 0 auto; padding: 2.2rem 1rem; }
.hero { border: 1px solid #dce6fb; border-radius: 24px; padding: 2rem; background: linear-gradient(160deg, #ffffff, #eef3ff); box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08); }
.eyebrow { margin: 0; font-size: 0.75rem; letter-spacing: 0.12em; color: #4f46e5; font-weight: 700; }
h1 { margin: 0.8rem 0; line-height: 1.2; font-size: clamp(1.6rem, 4vw, 2.4rem); color: #0f172a; }
.lead { color: #475569; margin-bottom: 1.5rem; }
.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.entry {
  display: grid;
  gap: 0.45rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
  border: 1px solid #dce6fb;
  border-radius: 16px;
  padding: 1.15rem;
  text-decoration: none;
  color: #0f172a;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.entry:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px rgba(79, 70, 229, 0.16);
  border-color: #becdf7;
}
.entry-kicker { margin: 0; color: #4f46e5; font-size: 0.75rem; letter-spacing: 0.08em; font-weight: 800; }
.entry span { color: #475569; font-size: 0.9rem; }
@media (max-width: 768px) { .cards { grid-template-columns: 1fr; } }
</style>
