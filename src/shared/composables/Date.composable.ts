const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const pad = (value: number, length = 2) => String(value).padStart(length, '0')

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const today = (): Date => startOfDay(new Date())

const toIsoDate = (date: Date): string =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseIsoDate = (iso: string): Date | null => {
  const match = ISO_DATE_RE.exec(iso)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

const formatDisplayDate = (date: Date | null): string => {
  if (date === null) return ''
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(date.getFullYear(), 4)}`
}

const longDateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

const shortDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

const formatLongDate = (date: Date): string => longDateFormat.format(date)

const formatShortDate = (date: Date): string => shortDateFormat.format(date)

export function useDate() {
  return {
    startOfDay,
    today,
    toIsoDate,
    parseIsoDate,
    formatDisplayDate,
    formatLongDate,
    formatShortDate,
  }
}
