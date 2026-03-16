<template>
  <section class="auth">
    <div class="auth-card">
      <h1>로그인 / 간단 가입</h1>
      <p>해커톤 규칙에 맞춰 로컬 저장소로 계정을 관리합니다.</p>

      <div class="tab-row">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">로그인</button>
        <button :class="{ active: mode === 'signup' }" @click="mode = 'signup'">가입</button>
      </div>

      <form v-if="mode === 'login'" class="form" @submit.prevent="onLogin">
        <input v-model="loginForm.id" placeholder="아이디" required />
        <input v-model="loginForm.password" type="password" placeholder="비밀번호" required />
        <button type="submit">로그인</button>
      </form>

      <form v-else class="form" @submit.prevent="onSignup">
        <input v-model="signupForm.id" placeholder="아이디" required />
        <input v-model="signupForm.password" type="password" placeholder="비밀번호" required />
        <input v-model="signupForm.nickname" placeholder="닉네임" required />
        <input v-model="signupForm.mainPosition" placeholder="주 포지션 (예: Frontend)" required />
        <button type="submit">가입하고 시작하기</button>
      </form>

      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('login')
const message = ref('')

const loginForm = ref({ id: '', password: '' })
const signupForm = ref({ id: '', password: '', nickname: '', mainPosition: '' })

const onLogin = () => {
  message.value = ''

  try {
    authStore.login(loginForm.value)
    router.push('/me')
  } catch (err) {
    message.value = err instanceof Error ? err.message : '로그인에 실패했습니다.'
  }
}

const onSignup = () => {
  message.value = ''

  try {
    authStore.signup(signupForm.value)
    router.push('/me')
  } catch (err) {
    message.value = err instanceof Error ? err.message : '가입에 실패했습니다.'
  }
}
</script>

<style scoped>
.auth { max-width: 560px; margin: 2rem auto; padding: 0 1rem; }
.auth-card { border: 1px solid #dbe4f6; background: #fff; border-radius: 16px; padding: 1.2rem; }
.tab-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.tab-row button { border: 1px solid #dbe4f6; background: #f8faff; color: #334155; }
.tab-row button.active { background: #4f46e5; color: #fff; }
.form { display: grid; gap: 0.6rem; }
input { border: 1px solid #d0d8e6; border-radius: 10px; padding: 0.65rem; }
button { border: none; border-radius: 10px; background: #4f46e5; color: #fff; padding: 0.6rem 0.8rem; cursor: pointer; }
.message { margin-top: 0.75rem; color: #b91c1c; font-weight: 600; }
</style>
