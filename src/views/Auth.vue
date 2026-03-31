<template>
  <section class="auth">
    <div class="auth-card">
      <h1>로그인 / 간단 가입</h1>
      <p>일반 이용자와 운영자 로그인을 분리했습니다.</p>
      <p v-if="redirectReason === 'login_required'" class="notice">
        요청하신 기능은 로그인 후 사용할 수 있어요. 로그인하면 원래 페이지로 이동합니다.
      </p>

      <div class="tab-row role-tab-row">
        <button :class="{ active: accountType === 'user' }" @click="switchAccountType('user')">일반 이용자</button>
        <button :class="{ active: accountType === 'admin' }" @click="switchAccountType('admin')">운영자</button>
      </div>

      <div class="tab-row" v-if="accountType === 'user'">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">로그인</button>
        <button :class="{ active: mode === 'signup' }" @click="mode = 'signup'">가입</button>
      </div>

      <form v-if="accountType === 'admin'" class="form" @submit.prevent="onAdminLogin">
        <input v-model="adminForm.id" placeholder="운영자 아이디" required />
        <input v-model="adminForm.password" type="password" placeholder="운영자 비밀번호" required />
        <button type="submit">운영자 로그인</button>
        <p class="helper">데모 계정: admin / admin1234</p>
      </form>

      <form v-else-if="mode === 'login'" class="form" @submit.prevent="onLogin">
        <input v-model="loginForm.id" placeholder="아이디" required />
        <input v-model="loginForm.password" type="password" placeholder="비밀번호" required />
        <button type="submit">로그인</button>
      </form>

      <form v-else class="form" @submit.prevent="onSignup">
        <input v-model="signupForm.id" placeholder="아이디" required />
        <input v-model="signupForm.password" type="password" placeholder="비밀번호" required />
        <input v-model="signupForm.nickname" placeholder="닉네임" required />
        <select v-model="signupForm.mainPosition" required>
          <option disabled value="">주 포지션 선택</option>
          <option v-for="position in positionOptions" :key="position" :value="position">{{ position }}</option>
          <option value="기타">기타(직접 입력)</option>
        </select>
        <input
          v-if="signupForm.mainPosition === '기타'"
          v-model="signupForm.customMainPosition"
          placeholder="주 포지션 직접 입력"
          required
        />
        <button type="submit">가입하고 시작하기</button>
      </form>

      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { POSITION_OPTIONS } from '../constants/positions'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const accountType = ref('user')
const mode = ref('login')
const message = ref('')

const loginForm = ref({ id: '', password: '' })
const adminForm = ref({ id: 'admin', password: '' })
const positionOptions = POSITION_OPTIONS
const signupForm = ref({ id: '', password: '', nickname: '', mainPosition: '', customMainPosition: '' })
const redirectReason = computed(() => String(route.query.reason || ''))
const redirectAfterAuth = computed(() => {
  const raw = String(route.query.redirect || '')
  return raw.startsWith('/') ? raw : '/me'
})

const switchAccountType = (type) => {
  accountType.value = type
  if (type === 'admin') mode.value = 'login'
  message.value = ''
}

const onLogin = () => {
  message.value = ''

  try {
    authStore.login({ ...loginForm.value, role: 'user' })
    router.push(redirectAfterAuth.value)
  } catch (err) {
    message.value = err instanceof Error ? err.message : '로그인에 실패했습니다.'
  }
}

const onAdminLogin = () => {
  message.value = ''

  try {
    authStore.login({ ...adminForm.value, role: 'admin' })
    router.push('/hackathons')
  } catch (err) {
    message.value = err instanceof Error ? err.message : '운영자 로그인에 실패했습니다.'
  }
}

const onSignup = () => {
  message.value = ''

  try {
    const mainPosition = signupForm.value.mainPosition === '기타'
      ? signupForm.value.customMainPosition.trim()
      : signupForm.value.mainPosition

    authStore.signup({ ...signupForm.value, mainPosition })
    router.push(redirectAfterAuth.value)
  } catch (err) {
    message.value = err instanceof Error ? err.message : '가입에 실패했습니다.'
  }
}
</script>

<style scoped>
.auth { max-width: 560px; margin: 2rem auto; padding: 0 1rem; }
.auth-card { border: 1px solid #dbe4f6; background: #fff; border-radius: 16px; padding: 1.2rem; }
.notice { margin-top: 0.75rem; margin-bottom: 0.9rem; background: #eef2ff; border: 1px solid #c7d2fe; color: #312e81; border-radius: 10px; padding: 0.55rem 0.65rem; font-size: 0.92rem; }
.tab-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.role-tab-row { margin-top: 0.9rem; }
.tab-row button { border: 1px solid #dbe4f6; background: #f8faff; color: #334155; }
.tab-row button.active { background: #4f46e5; color: #fff; }
.form { display: grid; gap: 0.6rem; }
input, select { border: 1px solid #d0d8e6; border-radius: 10px; padding: 0.65rem; }
button { border: none; border-radius: 10px; background: #4f46e5; color: #fff; padding: 0.6rem 0.8rem; cursor: pointer; }
.helper { margin: 0; color: #475569; font-size: 0.9rem; }
.message { margin-top: 0.75rem; color: #b91c1c; font-weight: 600; }
</style>
