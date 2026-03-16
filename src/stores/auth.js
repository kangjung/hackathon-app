import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const USER_STORAGE_KEY = 'vibe-auth-users'
const SESSION_STORAGE_KEY = 'vibe-auth-session'

const ADMIN_ACCOUNT = {
  id: 'admin',
  password: 'admin1234',
  nickname: '대회 운영자',
  role: 'admin'
}

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
  const session = ref({ id: '', role: 'user' })

  const normalizeUsers = (rawUsers) =>
    rawUsers.map((user) => ({
      ...user,
      role: user.role === 'admin' ? 'admin' : 'user',
      bookmarkedHackathons: Array.isArray(user.bookmarkedHackathons) ? user.bookmarkedHackathons : []
    }))

  const hydrate = () => {
    const parsed = Array.isArray(readJson(USER_STORAGE_KEY, [])) ? readJson(USER_STORAGE_KEY, []) : []
    users.value = normalizeUsers(parsed)

    const rawSession = readJson(SESSION_STORAGE_KEY, '')
    if (rawSession && typeof rawSession === 'object') {
      session.value = {
        id: String(rawSession.id || ''),
        role: rawSession.role === 'admin' ? 'admin' : 'user'
      }
      return
    }

    session.value = {
      id: typeof rawSession === 'string' ? rawSession : '',
      role: 'user'
    }
  }

  const persist = () => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users.value))
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session.value))
  }

  const signup = ({ id, password, nickname, mainPosition }) => {
    const safeId = id.trim()
    const safePosition = mainPosition.trim()
    if (!safePosition) {
      throw new Error('주 포지션을 입력해주세요.')
    }

    if (safeId === ADMIN_ACCOUNT.id) {
      throw new Error('해당 아이디는 사용할 수 없습니다.')
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
      role: 'user',
      bookmarkedHackathons: [],
      createdAt: new Date().toISOString()
    })
    session.value = { id: safeId, role: 'user' }
    persist()
  }

  const login = ({ id, password, role = 'user' }) => {
    const safeId = id.trim()

    if (role === 'admin') {
      if (safeId !== ADMIN_ACCOUNT.id || password !== ADMIN_ACCOUNT.password) {
        throw new Error('운영자 계정 정보가 올바르지 않습니다.')
      }

      session.value = { id: ADMIN_ACCOUNT.id, role: 'admin' }
      persist()
      return
    }

    const user = users.value.find((entry) => entry.id === safeId)
    if (!user || user.password !== password) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
    }

    session.value = { id: user.id, role: 'user' }
    persist()
  }

  const logout = () => {
    session.value = { id: '', role: 'user' }
    persist()
  }

  const toggleHackathonBookmark = (slug) => {
    if (!currentUser.value || currentRole.value !== 'user') {
      throw new Error('일반 사용자 로그인 후 이용 가능합니다.')
    }

    const safeSlug = String(slug || '').trim()
    if (!safeSlug) return false

    const index = users.value.findIndex((user) => user.id === session.value.id)
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
    if (currentRole.value !== 'user' || !currentUser.value) return false
    return (currentUser.value.bookmarkedHackathons || []).includes(slug)
  }

  const currentRole = computed(() => session.value.role || 'user')
  const currentUserId = computed(() => session.value.id || '')
  const currentUser = computed(() => {
    if (!session.value.id) return null
    if (currentRole.value === 'admin') {
      return {
        id: ADMIN_ACCOUNT.id,
        nickname: ADMIN_ACCOUNT.nickname,
        mainPosition: '운영',
        role: 'admin',
        bookmarkedHackathons: []
      }
    }

    return users.value.find((user) => user.id === session.value.id) || null
  })
  const isLoggedIn = computed(() => Boolean(currentUser.value))
  const isAdmin = computed(() => currentRole.value === 'admin')

  return {
    users,
    session,
    currentUserId,
    currentRole,
    currentUser,
    isLoggedIn,
    isAdmin,
    hydrate,
    signup,
    login,
    logout,
    toggleHackathonBookmark,
    isHackathonBookmarked
  }
})
