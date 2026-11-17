/**
 * Date helpers. Dates are `Date` objects set to local midnight (calendar days);
 * ordering is always done on `Date` values, never on strings.
 *
 * ISO `YYYY-MM-DD` strings exist only at the native `<input type="date">`
 * boundary (`toIsoDate` / `parseIsoDate`).
 *
 * All conversions use local date parts (never `toISOString`, `valueAsDate` or
 * `new Date('YYYY-MM-DD')`, which are UTC) so a date never shifts by a day
 * depending on the user's timezone.
 */

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const pad = (value: number, length = 2) => String(value).padStart(length, '0')

/** The same calendar day as `date`, at local midnight. */
export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

/** Today at local midnight. */
export const today = (): Date => startOfDay(new Date())

/** Formats a `Date` as a local ISO `YYYY-MM-DD` string, for the native date input. */
export const toIsoDate = (date: Date): string =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/**
 * Parses a native date input value (`YYYY-MM-DD`) into a local-midnight `Date`.
 * Returns `null` for an empty or invalid value.
 */
export const parseIsoDate = (iso: string): Date | null => {
  const match = ISO_DATE_RE.exec(iso)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day)
  // `new Date` silently rolls over invalid parts (02-31 -> 03-03).
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

/** Formats a `Date` as `DD/MM/YYYY`. Returns `''` for `null`. */
export const formatDisplayDate = (date: Date | null): string => {
  if (date === null) return ''
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(date.getFullYear(), 4)}`
}

const longDateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

const shortDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

/** Formats a `Date` as `Monday, December 21`, for message prose. */
export const formatLongDate = (date: Date): string => longDateFormat.format(date)

/** Formats a `Date` as `Jan 4`, for compact text such as a subject line. */
export const formatShortDate = (date: Date): string => shortDateFormat.format(date)
