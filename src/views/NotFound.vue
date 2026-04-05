<template>
  <section class="not-found">
    <p class="code">404</p>
    <h1>페이지를 찾을 수 없습니다.</h1>
    <p>요청하신 경로가 없거나 이동된 것 같습니다.</p>
    <div class="actions">
      <router-link to="/" class="primary">홈으로 이동</router-link>
      <router-link to="/hackathons" class="secondary">해커톤 목록</router-link>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  max-width: 720px;
  margin: 3rem auto;
  padding: 2rem 1rem;
  text-align: center;
}
.code {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #4f46e5;
}
h1 {
  margin: 0.6rem 0;
  color: #0f172a;
}
p {
  margin: 0;
  color: #64748b;
}
.actions {
  margin-top: 1.1rem;
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
a {
  text-decoration: none;
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  font-weight: 700;
}
.primary {
  background: #2563eb;
  color: #fff;
}
.secondary {
  border: 1px solid #c7d2fe;
  color: #3730a3;
  background: #eef2ff;
}
</style>
