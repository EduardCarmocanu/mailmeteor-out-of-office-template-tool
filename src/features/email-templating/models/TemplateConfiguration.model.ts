import type { Reason } from './Reason.model.ts'
import type { Tone } from './Tone.model.ts'

export interface TemplateConfiguration {
  name: string
  leaveStart: Date | null
  leaveEnd: Date | null
  tone: Tone
  reason: Reason
  backupName: string
  backupEmail: string
}
