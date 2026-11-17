import { computed, ref } from 'vue'
import { todayIso } from '../../../shared/utils/date.ts'

export interface TemplateConfiguration {
  name: string
  firstDayAway: string
  backOn: string
  tone: string
  reason: string
  backupName: string
  backupEmail: string
}

// Module-level state so the configurator and the message editor share the same template.
const templateConfigurationForm = ref<TemplateConfiguration>({
  name: '',
  firstDayAway: '',
  backOn: '',
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

export function useEmailTemplate() {
  const today = todayIso()
  // "Back on" can't be before "First day away"; until that is set, it can't be in the past.
  const backOnMin = computed(() => templateConfigurationForm.value.firstDayAway || today)

  return { templateConfigurationForm, today, backOnMin, subject, body }
}
