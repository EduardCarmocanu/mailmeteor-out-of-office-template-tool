/**
 * Date helpers working with two string formats:
 * - ISO `YYYY-MM-DD`: the canonical value (model values, min/max bounds, native date input).
 * - Display `DD/MM/YYYY`: what the user reads and types.
 *
 * All conversions use local date parts (never `toISOString`, which is UTC) so a
 * date never shifts by a day depending on the user's timezone. ISO strings sort
 * lexicographically in chronological order, so they can be compared with `<` / `>`.
 */

const DISPLAY_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const pad = (value: number, length = 2) => String(value).padStart(length, '0')

/** Formats a `Date` as a local ISO `YYYY-MM-DD` string. */
export const toIsoDate = (date: Date): string =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** Today's date as a local ISO `YYYY-MM-DD` string. */
export const todayIso = (): string => toIsoDate(new Date())

/**
 * Parses a `DD/MM/YYYY` string into an ISO `YYYY-MM-DD` string.
 * Returns `null` when the text is not in that format or is not a real calendar
 * date (e.g. `31/02/2027`).
 */
export const parseDisplayDate = (text: string): string | null => {
  const match = DISPLAY_DATE_RE.exec(text.trim())
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])

  const date = new Date(year, month - 1, day)
  // `new Date` silently rolls over invalid parts (31/02 -> 03/03), so make sure
  // the parts survived the round-trip.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return toIsoDate(date)
}

/** Formats an ISO `YYYY-MM-DD` string as `DD/MM/YYYY`. Returns `''` for anything else. */
export const formatDisplayDate = (iso: string): string => {
  const match = ISO_DATE_RE.exec(iso)
  if (!match) return ''
  return `${match[3]}/${match[2]}/${match[1]}`
}
