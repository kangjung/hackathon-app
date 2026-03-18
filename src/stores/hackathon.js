import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'vibe-hackathon-data-v2'
const FAVORITES_STORAGE_KEY = 'vibe-hackathon-favorites-v1'

const statusLabelMap = {
  ongoing: '진행중',
  upcoming: '예정',
  closed: '종료',
  ended: '종료'
}

const parsePositionText = (value) => {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const match = trimmed.match(/^(.*?)(\d+)\s*명$/)
  if (!match) return { role: trimmed, count: 1 }
  return {
    role: match[1].trim(),
    count: Number(match[2]) || 1
  }
}

const normalizeRecruitPositions = (team) => {
  const source = team.positions || team.lookingFor || team.position || team.role
  const normalized = Array.isArray(source)
    ? source
        .map((entry) => {
          if (typeof entry === 'string') return parsePositionText(entry)
          if (!entry || typeof entry !== 'object') return null
          const role = String(entry.role || entry.name || '').trim()
          if (!role) return null
          return { role, count: Number(entry.count) > 0 ? Number(entry.count) : 1 }
        })
        .filter(Boolean)
    : typeof source === 'string'
      ? source
          .split(',')
          .map((entry) => parsePositionText(entry))
          .filter(Boolean)
      : []

  return normalized
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const keys = ['items', 'data', 'hackathons', 'teams', 'leaderboards', 'list']
  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key]
  }
  return Object.values(value).filter((v) => typeof v === 'object' && v)
}


const ensureArray = (value) => (Array.isArray(value) ? value : toArray(value))

const normalizeHackathon = (item, index) => {
  const slug = item.slug || item.code || item.id || `hackathon-${index + 1}`
  const status = item.status || item.state || item.progress || 'upcoming'
  const tags = Array.isArray(item.tags)
    ? item.tags
    : typeof item.tags === 'string'
      ? item.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

  return {
    slug,
    title: item.title || item.name || item.hackathonName || slug,
    summary: item.summary || item.description || item.overview || '',
    status,
    statusLabel: item.statusLabel || statusLabelMap[status] || status,
    tags,
    startDate:
      item.startDate ||
      item.start_at ||
      item.start ||
      item.period?.startAt ||
      item.period?.submissionStartAt ||
      '-',
    endDate:
      item.endDate ||
      item.end_at ||
      item.end ||
      item.period?.endAt ||
      item.period?.submissionDeadlineAt ||
      '-',
    participants: Number(item.participants || item.participantCount || item.teamCount || 0)
  }
}

const normalizeTeams = (items) =>
  items.map((team, index) => ({
    code: team.code || team.teamCode || team.id || `team-${index + 1}`,
    name: team.name || team.teamName || `팀 ${index + 1}`,
    intro: team.intro || team.description || '',
    contact: team.contact?.url || team.contact?.link || team.contact || team.contactUrl || team.contact_url || '',
    positions: normalizeRecruitPositions(team),
    lookingFor: team.lookingFor || team.position || team.role || '',
    isOpen: typeof team.isOpen === 'boolean' ? team.isOpen : Boolean(team.lookingFor || team.open || normalizeRecruitPositions(team).length),
    recruitDeadline: team.recruitDeadline || team.recruitUntil || '',
    ownerId: team.ownerId || team.owner || '',
    ownerNickname: team.ownerNickname || '',
    members: Array.isArray(team.members) ? team.members : [],
    memberCount: Number(team.memberCount) || (Array.isArray(team.members) ? team.members.length : 0),
    maxMembers: Number(team.maxMembers) > 0 ? Number(team.maxMembers) : null,
    joinRequests: Array.isArray(team.joinRequests)
      ? team.joinRequests
          .map((request) => ({
            id: request.id || `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            userId: String(request.userId || '').trim(),
            nickname: String(request.nickname || request.userId || '').trim(),
            message: String(request.message || '').trim(),
            role: String(request.role || '').trim(),
            createdAt: request.createdAt || new Date().toISOString(),
            status: request.status === 'accepted' || request.status === 'rejected' ? request.status : 'pending',
            reviewedAt: request.reviewedAt || null
          }))
          .filter((request) => request.userId)
      : [],
    hackathonSlug: team.hackathonSlug || team.slug || team.hackathon || ''
  }))


const isRecruitmentClosed = (team) => {
  if (!team?.isOpen) return true
  if (!team?.recruitDeadline) return false
  const deadline = new Date(team.recruitDeadline)
  if (Number.isNaN(deadline.getTime())) return false
  return deadline.getTime() < Date.now()
}

const normalizeLeaderboards = (items) =>
  items.map((entry) => ({
    hackathonSlug: entry.hackathonSlug || entry.slug || entry.hackathon || '',
    teamCode: entry.teamCode || entry.code || entry.teamId || '',
    teamName: entry.teamName || entry.name || entry.team || '',
    points: Number(entry.points || entry.score || 0)
  }))

const normalizeDetail = (detailRaw) => {
  if (!detailRaw || typeof detailRaw !== 'object') return {}

  const normalizeOne = (entry) => {
    if (!entry || typeof entry !== 'object') return null
    const slug = entry.slug || entry.code || entry.id
    if (!slug) return null

    const sections = entry.sections && typeof entry.sections === 'object'
      ? entry.sections
      : {
          overview: entry.overview || entry.description || '',
          info: { notice: entry.guide || entry.notice || [] },
          eval: entry.evaluation || entry.eval || '',
          schedule: entry.schedule || entry.timeline || '',
          prize: entry.prize || entry.reward || ''
        }

    return {
      slug,
      detail: {
        slug,
        title: entry.title || '',
        sections
      }
    }
  }

  if ('sections' in detailRaw || 'extraDetails' in detailRaw) {
    const items = [detailRaw, ...ensureArray(detailRaw.extraDetails)]
    return items.reduce((acc, entry) => {
      const normalized = normalizeOne(entry)
      if (normalized) acc[normalized.slug] = normalized.detail
      return acc
    }, {})
  }

  if (Array.isArray(detailRaw)) {
    return detailRaw.reduce((acc, entry) => {
      const normalized = normalizeOne(entry)
      if (normalized) acc[normalized.slug] = normalized.detail
      return acc
    }, {})
  }

  if ('slug' in detailRaw || 'code' in detailRaw || 'id' in detailRaw) {
    const normalized = normalizeOne(detailRaw)
    return normalized ? { [normalized.slug]: normalized.detail } : {}
  }

  return Object.entries(detailRaw).reduce((acc, [key, value]) => {
    if (!value || typeof value !== 'object') return acc
    if ('sections' in value) {
      const normalized = normalizeOne({ ...value, slug: value.slug || key })
      if (normalized) {
        acc[normalized.slug] = normalized.detail
        return acc
      }
    }

    acc[key] = {
      slug: key,
      title: value.title || '',
      sections: value.sections || value
    }
    return acc
  }, {})
}

const fetchJsonWithFallback = async (paths) => {
  for (const path of paths) {
    try {
      const res = await fetch(path)
      if (!res.ok) continue
      return await res.json()
    } catch {
      // try next path
    }
  }
  throw new Error(`데이터 파일을 찾지 못했습니다: ${paths.join(', ')}`)
}

export const useHackathonStore = defineStore('hackathon', () => {
  const hackathons = ref([])
  const hackathonDetail = ref({})
  const leaderboards = ref([])
  const teams = ref([])
  const submissions = ref([])

  const filters = ref({
    status: 'all',
    search: '',
    tag: 'all',
    favoritesOnly: false,
    sortBy: 'recommended'
  })
  const favoriteHackathonSlugs = ref([])
  const isLoading = ref(false)
  const error = ref('')
  const hasLoaded = ref(false)

  const persistLocalData = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        leaderboards: leaderboards.value,
        teams: teams.value,
        submissions: submissions.value
      })
    )
  }

  const hydrateStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        leaderboards.value = normalizeLeaderboards(ensureArray(parsed.leaderboards || []))
        teams.value = normalizeTeams(ensureArray(parsed.teams || []))
        submissions.value = ensureArray(parsed.submissions || [])
      }
    } catch (err) {
      console.warn('로컬 스토리지 데이터 파싱 실패, 초기 데이터 사용:', err)
      submissions.value = []
    }
  }

  const hydrateFavorites = () => {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        favoriteHackathonSlugs.value = parsed.map((slug) => String(slug).trim()).filter(Boolean)
      }
    } catch (err) {
      console.warn('찜 데이터 파싱 실패, 기본값으로 진행합니다:', err)
    }
  }

  const persistFavorites = () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteHackathonSlugs.value))
  }

  const loadData = async ({ force = false } = {}) => {
    if (hasLoaded.value && !force) return
    isLoading.value = true
    error.value = ''

    try {
      const [hackRaw, detailRaw, leaderboardRaw, teamRaw] = await Promise.all([
        fetchJsonWithFallback(['/data/public_hackathons.json', '/data/public_hackathons-4.json']),
        fetchJsonWithFallback(['/data/public_hackathon_detail.json', '/data/public_hackathon_detail-3.json']),
        fetchJsonWithFallback(['/data/public_leaderboard.json', '/data/public_leaderboard-5.json']),
        fetchJsonWithFallback(['/data/public_teams.json', '/data/public_teams-6.json'])
      ])

      hackathons.value = toArray(hackRaw).map(normalizeHackathon)
      hackathonDetail.value = normalizeDetail(detailRaw)
      leaderboards.value = normalizeLeaderboards(toArray(leaderboardRaw))
      teams.value = normalizeTeams(toArray(teamRaw))

      hydrateStorage()
      hydrateFavorites()
      hasLoaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      console.error('데이터 로드 실패:', err)
    } finally {
      isLoading.value = false
    }
  }

  const parseDateToTimestamp = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : date.getTime()
  }

  const sortHackathons = (items, sortBy) => {
    if (sortBy === 'participants') {
      return [...items].sort((a, b) => b.participants - a.participants)
    }
    if (sortBy === 'deadline') {
      return [...items].sort((a, b) => parseDateToTimestamp(a.endDate) - parseDateToTimestamp(b.endDate))
    }
    if (sortBy === 'startDate') {
      return [...items].sort((a, b) => parseDateToTimestamp(a.startDate) - parseDateToTimestamp(b.startDate))
    }
    return [...items].sort((a, b) => {
      const favoriteGap = Number(favoriteHackathonSlugs.value.includes(b.slug)) - Number(favoriteHackathonSlugs.value.includes(a.slug))
      if (favoriteGap !== 0) return favoriteGap
      if (a.status === b.status) return b.participants - a.participants
      const statusWeight = { ongoing: 3, upcoming: 2, ended: 1, closed: 1 }
      return (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0)
    })
  }

  const filteredHackathons = computed(() => {
    let result = [...hackathons.value]
    if (filters.value.status !== 'all') {
      result = result.filter((h) => h.status === filters.value.status)
    }
    if (filters.value.search) {
      result = result.filter((h) =>
        h.title.toLowerCase().includes(filters.value.search.toLowerCase())
      )
    }
    if (filters.value.tag && filters.value.tag !== 'all') {
      result = result.filter((h) => (h.tags || []).includes(filters.value.tag))
    }
    if (filters.value.favoritesOnly) {
      result = result.filter((h) => favoriteHackathonSlugs.value.includes(h.slug))
    }
    return sortHackathons(result, filters.value.sortBy)
  })

  const isFavoriteHackathon = (slug) => favoriteHackathonSlugs.value.includes(slug)

  const toggleFavoriteHackathon = (slug) => {
    if (!slug) return
    if (isFavoriteHackathon(slug)) {
      favoriteHackathonSlugs.value = favoriteHackathonSlugs.value.filter((item) => item !== slug)
    } else {
      favoriteHackathonSlugs.value = [...favoriteHackathonSlugs.value, slug]
    }
    persistFavorites()
  }

  const getHackathonDetail = (slug) => hackathonDetail.value[slug]
  const getTeamByCode = (code) =>
    normalizeTeams(ensureArray(teams.value)).find((t) => t.code === code)

  const getTeamsByHackathon = (slug) =>
    normalizeTeams(ensureArray(teams.value)).filter((t) => t.hackathonSlug === slug)

  const getMyTeamsByHackathon = ({ hackathonSlug, userId }) =>
    normalizeTeams(ensureArray(teams.value)).filter(
      (team) => team.hackathonSlug === hackathonSlug && team.ownerId && team.ownerId === userId
    )

  const getLeaderboardByHackathon = (slug) => {
    const safeLeaderboards = normalizeLeaderboards(ensureArray(leaderboards.value))
    if (!Array.isArray(leaderboards.value)) {
      leaderboards.value = safeLeaderboards
    }

    const rows = safeLeaderboards
      .filter((entry) => entry.hackathonSlug === slug)
      .sort((a, b) => b.points - a.points)

    const joinedTeams = getTeamsByHackathon(slug)
    const existingCodes = new Set(rows.map((r) => r.teamCode))
    const pendingRows = joinedTeams
      .filter((team) => !existingCodes.has(team.code))
      .map((team) => ({
        hackathonSlug: slug,
        teamCode: team.code,
        teamName: team.name,
        points: null,
        pending: true
      }))

    return [...rows, ...pendingRows]
  }

  const addTeam = (team) => {
    const safeTeams = normalizeTeams(ensureArray(teams.value))
    if (!Array.isArray(teams.value)) {
      teams.value = safeTeams
    }

    teams.value.push(team)
    persistLocalData()
  }

  const getAcceptedRoleCount = (team, role) =>
    (team.joinRequests || []).filter(
      (request) => request.status === 'accepted' && request.role === role
    ).length

  const isRoleClosed = (team, role) => {
    const position = (team.positions || []).find((item) => item.role === role)
    if (!position) return false
    return getAcceptedRoleCount(team, role) >= Number(position.count || 0)
  }

  const applyToTeam = ({ teamCode, userId, nickname, message = '', role = '' }) => {
    const safeTeams = normalizeTeams(ensureArray(teams.value))
    if (!Array.isArray(teams.value)) {
      teams.value = safeTeams
    }

    const index = safeTeams.findIndex((team) => team.code === teamCode)
    if (index < 0) {
      throw new Error('팀 정보를 찾을 수 없습니다.')
    }

    const team = safeTeams[index]
    if (isRecruitmentClosed(team)) {
      throw new Error('모집이 마감된 팀입니다.')
    }

    const safeRole = String(role || '').trim()
    if (!safeRole) {
      throw new Error('지원 포지션을 선택해주세요.')
    }
    if (isRoleClosed(team, safeRole)) {
      throw new Error('선택한 포지션은 이미 마감되었습니다.')
    }

    const safeUserId = String(userId || '').trim()
    if (!safeUserId) {
      throw new Error('로그인이 필요합니다.')
    }

    const alreadyMember = Array.isArray(team.members) && team.members.includes(safeUserId)
    if (alreadyMember) {
      throw new Error('이미 팀 멤버입니다.')
    }

    const hasPendingRequest = team.joinRequests.some(
      (request) => request.userId === safeUserId && request.status === 'pending'
    )
    if (hasPendingRequest) {
      throw new Error('이미 가입 신청이 접수되었습니다.')
    }

    team.joinRequests.push({
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: safeUserId,
      nickname: String(nickname || safeUserId).trim(),
      message: String(message || '').trim(),
      role: safeRole,
      createdAt: new Date().toISOString(),
      status: 'pending',
      reviewedAt: null
    })

    teams.value = safeTeams
    persistLocalData()
  }

  const reviewJoinRequest = ({ teamCode, requestId, reviewerId, decision }) => {
    const safeTeams = normalizeTeams(ensureArray(teams.value))
    if (!Array.isArray(teams.value)) {
      teams.value = safeTeams
    }

    const team = safeTeams.find((item) => item.code === teamCode)
    if (!team) {
      throw new Error('팀 정보를 찾을 수 없습니다.')
    }

    if (team.ownerId && team.ownerId !== reviewerId) {
      throw new Error('팀장만 신청을 처리할 수 있습니다.')
    }

    const request = team.joinRequests.find((item) => item.id === requestId)
    if (!request) {
      throw new Error('신청 정보를 찾을 수 없습니다.')
    }
    if (request.status !== 'pending') {
      throw new Error('이미 처리된 신청입니다.')
    }

    if (decision === 'accepted') {
      if (request.role && isRoleClosed(team, request.role)) {
        throw new Error('이미 마감된 포지션입니다. 다른 신청을 선택해주세요.')
      }

      team.members = Array.isArray(team.members) ? team.members : []
      if (!team.members.includes(request.userId)) {
        team.members.push(request.userId)
      }
      team.memberCount = team.members.length

      const positions = team.positions || []
      const allRolesClosed = positions.length
        ? positions.every((position) => isRoleClosed(team, position.role))
        : false

      if ((team.maxMembers && team.memberCount >= team.maxMembers) || allRolesClosed) {
        team.isOpen = false
      }
    }

    request.status = decision === 'accepted' ? 'accepted' : 'rejected'
    request.reviewedAt = new Date().toISOString()

    teams.value = safeTeams
    persistLocalData()
  }

  const setTeamRecruitmentOpen = ({ teamCode, ownerId, isOpen }) => {
    const safeTeams = normalizeTeams(ensureArray(teams.value))
    if (!Array.isArray(teams.value)) {
      teams.value = safeTeams
    }

    const team = safeTeams.find((item) => item.code === teamCode)
    if (!team) {
      throw new Error('팀 정보를 찾을 수 없습니다.')
    }

    if (team.ownerId && team.ownerId !== ownerId) {
      throw new Error('팀장만 모집 상태를 변경할 수 있습니다.')
    }

    team.isOpen = Boolean(isOpen)
    teams.value = safeTeams
    persistLocalData()
  }

  const updateTeamRecruitmentPost = ({ teamCode, ownerId, payload }) => {
    const safeTeams = normalizeTeams(ensureArray(teams.value))
    if (!Array.isArray(teams.value)) {
      teams.value = safeTeams
    }

    const team = safeTeams.find((item) => item.code === teamCode)
    if (!team) {
      throw new Error('팀 정보를 찾을 수 없습니다.')
    }

    if (team.ownerId && team.ownerId !== ownerId) {
      throw new Error('팀장만 모집 공고를 수정할 수 있습니다.')
    }

    const nextPositions = Array.isArray(payload.positions)
      ? payload.positions
          .map((position) => ({
            role: String(position.role || '').trim(),
            count: Number(position.count) > 0 ? Number(position.count) : 1
          }))
          .filter((position) => position.role)
      : team.positions

    team.name = String(payload.name || team.name).trim()
    team.intro = String(payload.intro || team.intro).trim()
    team.contact = String(payload.contact || '').trim()
    team.recruitDeadline = String(payload.recruitDeadline || '').trim()
    team.maxMembers = Number(payload.maxMembers) > 1 ? Number(payload.maxMembers) : null
    team.positions = nextPositions
    team.lookingFor = nextPositions.map((position) => `${position.role} ${position.count}명`).join(', ')

    teams.value = safeTeams
    persistLocalData()
  }

  const submitProject = ({ hackathonSlug, teamCode, planningUrl, webUrl, pdfUrl, notes }) => {
    const safeSubmissions = ensureArray(submissions.value)
    if (!Array.isArray(submissions.value)) {
      submissions.value = safeSubmissions
    }

    const safeLeaderboards = normalizeLeaderboards(ensureArray(leaderboards.value))
    if (!Array.isArray(leaderboards.value)) {
      leaderboards.value = safeLeaderboards
    }

    const safeTeams = normalizeTeams(ensureArray(teams.value))

    const points = Math.floor(Math.random() * 30) + 70
    const evaluatorScore = Math.floor(Math.random() * 25) + 75
    const participantScore = Math.floor(Math.random() * 25) + 70
    submissions.value.push({
      id: Date.now(),
      hackathonSlug,
      teamCode,
      planningUrl,
      webUrl,
      pdfUrl,
      notes,
      submittedAt: new Date().toISOString(),
      evaluatorScore,
      participantScore,
      points
    })

    const team = safeTeams.find((t) => t.code === teamCode)
    if (team) {
      const existing = safeLeaderboards.find(
        (l) => l.hackathonSlug === hackathonSlug && l.teamCode === teamCode
      )
      if (existing) {
        existing.points = Math.max(existing.points, points)
      } else {
        safeLeaderboards.push({
          hackathonSlug,
          teamCode,
          teamName: team.name,
          points
        })
      }
      leaderboards.value = safeLeaderboards
      persistLocalData()
    }
  }


  const getSubmissionByTeam = ({ hackathonSlug, teamCode }) => {
    const safeSubmissions = ensureArray(submissions.value)
    if (!Array.isArray(submissions.value)) {
      submissions.value = safeSubmissions
    }

    return safeSubmissions
      .filter((entry) => entry.hackathonSlug === hackathonSlug && entry.teamCode === teamCode)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0] || null
  }

  const getGlobalRankings = (period = 'all') => {
    const entries = period === 'all'
      ? normalizeLeaderboards(ensureArray(leaderboards.value))
      : getRankingsByPeriod(period)

    const scoreMap = new Map()

    entries.forEach((entry) => {
      if (!entry.teamCode) return
      const key = entry.teamCode
      if (!scoreMap.has(key)) {
        scoreMap.set(key, {
          teamCode: key,
          nickname: entry.teamName || key,
          points: 0
        })
      }

      const row = scoreMap.get(key)
      row.points += Number(entry.points || 0)
    })

    return [...scoreMap.values()].sort((a, b) => b.points - a.points)
  }

  const getRankingsByPeriod = (period = 'all') => {
    const safeLeaderboards = normalizeLeaderboards(ensureArray(leaderboards.value))
    if (!Array.isArray(leaderboards.value)) {
      leaderboards.value = safeLeaderboards
    }

    const safeSubmissions = ensureArray(submissions.value)
    if (!Array.isArray(submissions.value)) {
      submissions.value = safeSubmissions
    }

    if (period === 'all') {
      return [...safeLeaderboards].sort((a, b) => b.points - a.points)
    }

    const days = period === '7d' ? 7 : 30
    const start = new Date()
    start.setDate(start.getDate() - days)

    const scoredTeamCodes = new Set(
      safeSubmissions
        .filter((s) => new Date(s.submittedAt) >= start)
        .sort((a, b) => b.points - a.points)
        .map((s) => s.teamCode)
    )

    return safeLeaderboards
      .filter((entry) => scoredTeamCodes.has(entry.teamCode))
      .sort((a, b) => b.points - a.points)
  }

  return {
    hackathons,
    hackathonDetail,
    leaderboards,
    teams,
    submissions,
    filters,
    favoriteHackathonSlugs,
    isLoading,
    error,
    hasLoaded,
    filteredHackathons,
    isFavoriteHackathon,
    toggleFavoriteHackathon,
    loadData,
    getHackathonDetail,
    getTeamByCode,
    getTeamsByHackathon,
    getLeaderboardByHackathon,
    getRankingsByPeriod,
    getGlobalRankings,
    getMyTeamsByHackathon,
    isRecruitmentClosed,
    addTeam,
    applyToTeam,
    reviewJoinRequest,
    setTeamRecruitmentOpen,
    updateTeamRecruitmentPost,
    getAcceptedRoleCount,
    isRoleClosed,
    submitProject,
    getSubmissionByTeam
  }
})
