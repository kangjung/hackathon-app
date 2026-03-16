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

  const loadData = async () => {
    try {
      const [hackRes, detailRes, lbRes, teamRes] = await Promise.all([
        fetch('/data/public_hackathons.json'),
        fetch('/data/public_hackathon_detail.json'),
        fetch('/data/public_leaderboard.json'),
        fetch('/data/public_teams.json')
      ])

      hackathons.value = await hackRes.json()
      hackathonDetail.value = await detailRes.json()
      leaderboards.value = await lbRes.json()
      teams.value = await teamRes.json()

      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        leaderboards.value = parsed.leaderboards || leaderboards.value
        teams.value = parsed.teams || teams.value
        submissions.value = parsed.submissions || []
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error)
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

  const getTeamsByHackathon = (slug) => teams.value.filter((t) => t.hackathonSlug === slug)

  const getLeaderboardByHackathon = (slug) =>
    leaderboards.value.filter((entry) => entry.hackathonSlug === slug).sort((a, b) => b.points - a.points)

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

  return {
    hackathons,
    hackathonDetail,
    leaderboards,
    teams,
    submissions,
    filters,
    filteredHackathons,
    loadData,
    getHackathonDetail,
    getTeamsByHackathon,
    getLeaderboardByHackathon,
    addTeam,
    submitProject
  }
})
