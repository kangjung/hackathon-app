export const formatDateTimeKorean = (value, fallback = '-') => {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${year}.${month}.${day} ${hour}:${minute}`
}

const isValidDateValue = (value) => {
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

export const formatHackathonPeriod = (startValue, endValue) => {
  const hasStart = isValidDateValue(startValue)
  const hasEnd = isValidDateValue(endValue)

  if (hasStart && hasEnd) {
    return `${formatDateTimeKorean(startValue)} ~ ${formatDateTimeKorean(endValue)}`
  }

  if (hasEnd) return `${formatDateTimeKorean(endValue)} 마감`
  if (hasStart) return `${formatDateTimeKorean(startValue)} 시작`
  return '일정 추후 공지'
}
