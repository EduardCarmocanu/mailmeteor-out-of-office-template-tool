import { ref, watch } from 'vue'
import { today as getToday } from '../../../shared/utils/date.ts'

export type Tone = 'formal' | 'friendly' | 'funny' | 'short'

export type Reason =
  | 'vacation'
  | 'holidays'
  | 'business-trip'
  | 'conference'
  | 'sick-leave'
  | 'parental-leave'

export interface TemplateConfiguration {
  name: string
  firstDayAway: Date | null
  backOn: Date | null
  tone: Tone
  reason: Reason
  backupName: string
  backupEmail: string
}

// Module-level state so the configurator and the message editor share the same template.
const templateConfigurationForm = ref<TemplateConfiguration>({
  name: '',
  firstDayAway: null,
  backOn: null,
  tone: 'formal',
  reason: 'vacation',
  backupName: '',
  backupEmail: '',
})

// Keep "Back on" from falling before "First day away" by moving it forward.
watch(
  () => templateConfigurationForm.value.firstDayAway,
  (firstDayAway) => {
    const { backOn } = templateConfigurationForm.value
    if (firstDayAway && backOn && backOn.getTime() < firstDayAway.getTime()) {
      templateConfigurationForm.value.backOn = new Date(firstDayAway)
    }
  },
)

// Keep "First day away" from falling after "Back on" by moving it back.
watch(
  () => templateConfigurationForm.value.backOn,
  (backOn) => {
    const { firstDayAway } = templateConfigurationForm.value
    if (backOn && firstDayAway && firstDayAway.getTime() > backOn.getTime()) {
      templateConfigurationForm.value.firstDayAway = new Date(backOn)
    }
  },
)

export function useTemplateConfiguration() {
  const today = getToday()

  return { templateConfigurationForm, today }
}
