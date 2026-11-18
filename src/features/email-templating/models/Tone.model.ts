export const TONES = ['formal', 'friendly', 'funny', 'short'] as const

export type Tone = (typeof TONES)[number]
