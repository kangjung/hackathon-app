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

  const normalizeUsers = (rawUsers) =>
    rawUsers.map((user) => ({
      ...user,
      bookmarkedHackathons: Array.isArray(user.bookmarkedHackathons) ? user.bookmarkedHackathons : []
    }))

  const hydrate = () => {
    const parsed = Array.isArray(readJson(USER_STORAGE_KEY, [])) ? readJson(USER_STORAGE_KEY, []) : []
    users.value = normalizeUsers(parsed)
    currentUserId.value = readJson(SESSION_STORAGE_KEY, '') || ''
  }

  const persist = () => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users.value))
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUserId.value))
  }

  const signup = ({ id, password, nickname, mainPosition }) => {
    const safeId = id.trim()
    const safePosition = mainPosition.trim()
    if (!safePosition) {
      throw new Error('주 포지션을 입력해주세요.')
    }

    const exists = users.value.some((user) => user.id === safeId)
    if (exists) {
      throw new Error('이미 사용 중인 아이디입니다.')
    }

    users.value.push({
      id: safeId,
      password,
      nickname: nickname.trim(),
      mainPosition: safePosition,
      bookmarkedHackathons: [],
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

  const toggleHackathonBookmark = (slug) => {
    if (!currentUserId.value) {
      throw new Error('로그인이 필요합니다.')
    }

    const safeSlug = String(slug || '').trim()
    if (!safeSlug) return false

    const index = users.value.findIndex((user) => user.id === currentUserId.value)
    if (index < 0) return false

    const bookmarks = Array.isArray(users.value[index].bookmarkedHackathons)
      ? [...users.value[index].bookmarkedHackathons]
      : []
    const existingIndex = bookmarks.indexOf(safeSlug)

    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1)
    } else {
      bookmarks.push(safeSlug)
    }

    users.value[index] = {
      ...users.value[index],
      bookmarkedHackathons: bookmarks
    }
    persist()
    return existingIndex < 0
  }

  const isHackathonBookmarked = (slug) => {
    if (!currentUser.value) return false
    return (currentUser.value.bookmarkedHackathons || []).includes(slug)
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
    logout,
    toggleHackathonBookmark,
    isHackathonBookmarked
  }
})
