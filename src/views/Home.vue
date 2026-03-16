<template>
  <section class="home">
    <div class="hero">
      <p class="eyebrow">HACKATHON OPS SUITE</p>
      <h1>해커톤 운영부터 랭킹 분석까지 한 화면에서.</h1>
      <p class="lead">팀 빌딩, 결과물 제출, 실시간 랭킹을 빠르게 확인하고 운영하세요.</p>
      <div class="cards">
        <router-link to="/hackathons" class="entry">
          <strong>해커톤 탐색</strong>
          <span>현재 진행/예정 이벤트와 상세 정보 확인</span>
        </router-link>
        <router-link to="/camp" class="entry">
          <strong>팀 매칭 캠프</strong>
          <span>참가자를 모으고 팀 프로필을 관리</span>
        </router-link>
        <router-link to="/rankings" class="entry">
          <strong>랭킹 대시보드</strong>
          <span>해커톤별 성과와 종합 순위 비교</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.hero {
  border: 1px solid rgba(149, 171, 255, 0.28);
  border-radius: 24px;
  padding: 2rem;
  background: linear-gradient(140deg, rgba(44, 63, 143, 0.35), rgba(8, 18, 54, 0.35));
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 50px rgba(2, 8, 32, 0.35);
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: #90a7ff;
  font-weight: 700;
}

h1 {
  margin: 0.8rem 0;
  line-height: 1.2;
  font-size: clamp(1.6rem, 4vw, 2.5rem);
}

.lead {
  color: #b8c6ff;
  margin-bottom: 1.6rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.entry {
  display: grid;
  gap: 0.4rem;
  background: rgba(10, 16, 44, 0.7);
  border: 1px solid rgba(146, 169, 255, 0.25);
  border-radius: 16px;
  padding: 1.1rem;
  text-decoration: none;
  color: #e9eeff;
}

.entry span {
  color: #b3c2ff;
  font-size: 0.92rem;
}

@media (max-width: 768px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
