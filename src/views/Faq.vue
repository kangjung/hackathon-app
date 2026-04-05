<template>
  <section class="faq-page">
    <header class="hero">
      <p class="eyebrow">FAQ</p>
      <h1>자주 묻는 질문</h1>
      <p>
        Vibe Hackathon을 처음 이용하는 분들이 자주 물어보는 질문을 정리했습니다.
        더 궁금한 점이 있으면 알림 탭 또는 운영진 계정으로 문의해 주세요.
      </p>
    </header>

    <section class="faq-list" aria-label="자주 묻는 질문 목록">
      <article v-for="item in faqItems" :key="item.question" class="faq-item">
        <h2>{{ item.question }}</h2>
        <p>{{ item.answer }}</p>
      </article>
    </section>
  </section>
</template>

<script setup>
const faqItems = [
  {
    question: '회원가입 없이도 해커톤 정보를 볼 수 있나요?',
    answer:
      '네. 해커톤 목록, 상세 정보, 랭킹, 팀 모집 글은 비로그인 상태에서도 확인할 수 있습니다. 다만 팀 지원, 제출, 알림 기능은 로그인이 필요합니다.'
  },
  {
    question: '팀을 만들려면 어떤 준비가 필요하나요?',
    answer:
      '팀 이름, 목표 해커톤, 필요한 포지션(예: 프론트엔드/백엔드/디자인)만 정리하면 바로 팀을 생성할 수 있습니다. 모집 마감일을 함께 설정하면 지원자 관리가 쉬워집니다.'
  },
  {
    question: '랭킹은 어떤 기준으로 계산되나요?',
    answer:
      '공개 리더보드 점수와 최근 제출 상태를 바탕으로 실시간 정렬됩니다. 동일 점수일 경우 최신 업데이트 프로젝트가 먼저 노출됩니다.'
  },
  {
    question: '알림은 어디서 확인하나요?',
    answer:
      '로그인 후 상단의 알림 메뉴에서 확인할 수 있습니다. 지원 상태 변경, 제출 마감 임박, 운영 공지 같은 중요한 이벤트를 모아 보여줍니다.'
  },
  {
    question: '운영진에게 문의하려면 어떻게 해야 하나요?',
    answer:
      '프로필 페이지의 운영자 계정 안내를 확인하거나, 공지에 표시된 연락 채널을 통해 문의하시면 됩니다. 빠른 답변이 필요하면 팀 코드와 해커톤명을 함께 전달해 주세요.'
  }
]
</script>

<style scoped>
.faq-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.6rem 1rem 2.5rem;
}
.hero {
  border: 1px solid #dbe6ff;
  border-radius: 22px;
  padding: 1.6rem;
  background: linear-gradient(160deg, #ffffff 0%, #eef3ff 100%);
  box-shadow: 0 16px 38px rgba(37, 99, 235, 0.12);
}
.eyebrow {
  margin: 0;
  color: #3730a3;
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
}
h1 {
  margin: 0.45rem 0 0.65rem;
  color: #0f172a;
}
.hero p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}
.faq-list {
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
}
.faq-item {
  border: 1px solid #dbe4f6;
  border-radius: 14px;
  background: #fff;
  padding: 1rem;
}
.faq-item h2 {
  margin: 0;
  color: #1e3a8a;
  font-size: 1.05rem;
}
.faq-item p {
  margin: 0.5rem 0 0;
  color: #334155;
  line-height: 1.55;
}
</style>
