import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'vibe-hackathon-data-v1'

const statusLabelMap = {
  ongoing: '진행중',
  upcoming: '예정',
  closed: '종료'
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
    startDate: item.startDate || item.start_at || item.start || '-',
    endDate: item.endDate || item.end_at || item.end || '-',
    participants: Number(item.participants || item.participantCount || item.teamCount || 0)
  }
}

const normalizeTeams = (items) =>
  items.map((team, index) => ({
    code: team.code || team.teamCode || team.id || `team-${index + 1}`,
    name: team.name || team.teamName || `팀 ${index + 1}`,
    intro: team.intro || team.description || '',
    contact: team.contact || team.contactUrl || team.contact_url || '',
    isOpen: typeof team.isOpen === 'boolean' ? team.isOpen : Boolean(team.lookingFor || team.open),
    hackathonSlug: team.hackathonSlug || team.slug || team.hackathon || ''
  }))

const normalizeLeaderboards = (items) =>
  items.map((entry) => ({
    hackathonSlug: entry.hackathonSlug || entry.slug || entry.hackathon || '',
    teamCode: entry.teamCode || entry.code || entry.teamId || '',
    teamName: entry.teamName || entry.name || entry.team || '',
    points: Number(entry.points || entry.score || 0)
  }))

const normalizeDetail = (detailRaw) => {
  if (!detailRaw || typeof detailRaw !== 'object') return {}

  const values = Object.values(detailRaw)
  const isMap = values.some((v) => v && typeof v === 'object' && !Array.isArray(v))
  if (isMap) return detailRaw

  const slug = detailRaw.slug || detailRaw.code || detailRaw.id
  if (!slug) return {}

  return {
    [slug]: {
      overview: detailRaw.overview || detailRaw.description || '',
      guide: detailRaw.guide || detailRaw.notice || '',
      evaluation: detailRaw.evaluation || detailRaw.eval || '',
      schedule: detailRaw.schedule || detailRaw.timeline || '',
      prize: detailRaw.prize || detailRaw.reward || ''
    }
  }
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

  const filters = ref({ status: 'all', search: '' })
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

    const parsed = JSON.parse(raw)
    leaderboards.value = parsed.leaderboards || leaderboards.value
    teams.value = parsed.teams || teams.value
    submissions.value = parsed.submissions || []
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
      hasLoaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      console.error('데이터 로드 실패:', err)
    } finally {
      isLoading.value = false
    }
  }

  const filteredHackathons = computed(() => {
    let result = hackathons.value
    if (filters.value.status !== 'all') {
      result = result.filter((h) => h.status === filters.value.status)
    }
    if (filters.value.search) {
      result = result.filter((h) =>
        h.title.toLowerCase().includes(filters.value.search.toLowerCase())
      )
    }
    return result
  })

  const getHackathonDetail = (slug) => hackathonDetail.value[slug]
  const getTeamByCode = (code) => teams.value.find((t) => t.code === code)

  const getTeamsByHackathon = (slug) => teams.value.filter((t) => t.hackathonSlug === slug)

  const getLeaderboardByHackathon = (slug) => {
    const rows = leaderboards.value
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
    teams.value.push(team)
    persistLocalData()
  }

  const submitProject = ({ hackathonSlug, teamCode, notes, fileType }) => {
    const points = Math.floor(Math.random() * 30) + 70
    submissions.value.push({
      id: Date.now(),
      hackathonSlug,
      teamCode,
      notes,
      fileType,
      submittedAt: new Date().toISOString(),
      points
    })

    const team = teams.value.find((t) => t.code === teamCode)
    if (team) {
      const existing = leaderboards.value.find(
        (l) => l.hackathonSlug === hackathonSlug && l.teamCode === teamCode
      )
      if (existing) {
        existing.points = Math.max(existing.points, points)
      } else {
        leaderboards.value.push({
          hackathonSlug,
          teamCode,
          teamName: team.name,
          points
        })
      }
      persistLocalData()
    }
  }

  const getRankingsByPeriod = (period = 'all') => {
    if (period === 'all') {
      return [...leaderboards.value].sort((a, b) => b.points - a.points)
    }

    const days = period === '7d' ? 7 : 30
    const start = new Date()
    start.setDate(start.getDate() - days)

    const scoredTeamCodes = new Set(
      submissions.value
        .filter((s) => new Date(s.submittedAt) >= start)
        .sort((a, b) => b.points - a.points)
        .map((s) => s.teamCode)
    )

    return leaderboards.value
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
    isLoading,
    error,
    hasLoaded,
    filteredHackathons,
    loadData,
    getHackathonDetail,
    getTeamByCode,
    getTeamsByHackathon,
    getLeaderboardByHackathon,
    getRankingsByPeriod,
    addTeam,
    submitProject
  }
})
