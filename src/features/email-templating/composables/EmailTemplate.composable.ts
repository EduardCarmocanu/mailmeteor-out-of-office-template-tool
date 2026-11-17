import { ref, watch } from 'vue'
import { today as getToday } from '../../../shared/utils/date.ts'

export interface TemplateConfiguration {
  name: string
  firstDayAway: Date | null
  backOn: Date | null
  tone: string
  reason: string
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

// Placeholder content until the message is generated from the configuration.
const subject = ref('Out of office until Jan 4')
const body = ref(
  [
    'Hello,',
    'Thank you for your email. I am away for the holidays since Monday, December 21 and will be back on Monday, January 4, with limited access to email in the meantime.',
    'I will respond to your message as soon as possible after my return.',
    'Kind regards,\n[Your name]',
  ].join('\n\n'),
)

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

export function useEmailTemplate() {
  const today = getToday()

  return { templateConfigurationForm, today, subject, body }
}
