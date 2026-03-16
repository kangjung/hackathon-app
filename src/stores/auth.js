import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const USER_STORAGE_KEY = 'vibe-auth-users'
const SESSION_STORAGE_KEY = 'vibe-auth-session'

const readJson = (key, fallback) => {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export const useAuthStore = defineStore('auth', () => {
  const users = ref([])
  const currentUserId = ref('')

  const hydrate = () => {
    users.value = Array.isArray(readJson(USER_STORAGE_KEY, [])) ? readJson(USER_STORAGE_KEY, []) : []
    currentUserId.value = readJson(SESSION_STORAGE_KEY, '') || ''
  }

  const persist = () => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users.value))
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUserId.value))
  }

  const signup = ({ id, password, nickname, mainPosition }) => {
    const safeId = id.trim()
    const exists = users.value.some((user) => user.id === safeId)
    if (exists) {
      throw new Error('이미 사용 중인 아이디입니다.')
    }

    users.value.push({
      id: safeId,
      password,
      nickname: nickname.trim(),
      mainPosition: mainPosition.trim(),
      createdAt: new Date().toISOString()
    })
    currentUserId.value = safeId
    persist()
  }

  const login = ({ id, password }) => {
    const safeId = id.trim()
    const user = users.value.find((entry) => entry.id === safeId)
    if (!user || user.password !== password) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
    }

    currentUserId.value = user.id
    persist()
  }

  const logout = () => {
    currentUserId.value = ''
    persist()
  }

  const currentUser = computed(() => users.value.find((user) => user.id === currentUserId.value) || null)
  const isLoggedIn = computed(() => Boolean(currentUser.value))

  return {
    users,
    currentUserId,
    currentUser,
    isLoggedIn,
    hydrate,
    signup,
    login,
    logout
  }
})
