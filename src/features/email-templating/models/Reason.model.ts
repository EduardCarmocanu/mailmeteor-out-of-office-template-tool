export const REASONS = [
  'vacation',
  'holidays',
  'business-trip',
  'conference',
  'sick-leave',
  'parental-leave',
] as const

export type Reason = (typeof REASONS)[number]
