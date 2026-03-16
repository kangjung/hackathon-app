import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'vibe-hackathon-data-v1'

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
      const [hackRes, detailRes, lbRes, teamRes] = await Promise.all([
        fetch('/data/public_hackathons.json'),
        fetch('/data/public_hackathon_detail.json'),
        fetch('/data/public_leaderboard.json'),
        fetch('/data/public_teams.json')
      ])

      if (!hackRes.ok || !detailRes.ok || !lbRes.ok || !teamRes.ok) {
        throw new Error('데이터 파일을 불러오지 못했습니다.')
      }

      hackathons.value = await hackRes.json()
      hackathonDetail.value = await detailRes.json()
      leaderboards.value = await lbRes.json()
      teams.value = await teamRes.json()

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
