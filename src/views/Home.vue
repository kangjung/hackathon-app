<template>
  <section class="home">
    <h1>해커톤 운영을 한 번에</h1>
    <p>목록, 팀 모집, 제출, 리더보드를 로컬 데이터 기반으로 운영합니다.</p>
    <div class="cards">
      <router-link to="/hackathons" class="entry">해커톤 보러가기</router-link>
      <router-link to="/camp" class="entry">팀 찾기</router-link>
      <router-link to="/rankings" class="entry">랭킹 보기</router-link>
    </div>
  </section>
</template>

<style scoped>
.home { max-width: 900px; margin: 2rem auto; padding: 0 1rem; text-align: center; }
.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 1.2rem; }
.entry { display: block; background: #fff; border: 1px solid #dce4f5; border-radius: 14px; padding: 1.4rem; text-decoration: none; color: #1c2959; font-weight: 700; }
@media (max-width: 768px) { .cards { grid-template-columns: 1fr; } }
</style>