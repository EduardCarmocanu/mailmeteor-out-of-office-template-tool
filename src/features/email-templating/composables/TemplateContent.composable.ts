import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useDate } from '../../../shared/composables/Date.composable.ts'
import type { Reason } from '../models/Reason.model.ts'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'
import type { Tone } from '../models/Tone.model.ts'

const { formatLongDate, formatShortDate } = useDate()

export interface Template {
  subject: string
  body: string
}

export interface TemplateValues {
  name: string
  leaveStart: string
  leaveEnd: string
  leaveEndShort: string | null
  reasonPhrase: string
  backup: { name: string; email: string | null } | null
}

const NAME_PLACEHOLDER = '[Your name]'
const LEAVE_START_PLACEHOLDER = '[first day away]'
const LEAVE_END_PLACEHOLDER = '[back on]'

const REASON_PHRASES: Record<Reason, string> = {
  vacation: 'on vacation',
  holidays: 'away for the holidays',
  'business-trip': 'on a business trip',
  conference: 'at a conference',
  'sick-leave': 'on sick leave',
  'parental-leave': 'on parental leave',
}

export function toTemplateValues(config: TemplateConfiguration): TemplateValues {
  const backupName = config.backupName.trim()
  const backupEmail = config.backupEmail.trim()

  return {
    name: config.name.trim() || NAME_PLACEHOLDER,
    leaveStart: config.leaveStart ? formatLongDate(config.leaveStart) : LEAVE_START_PLACEHOLDER,
    leaveEnd: config.leaveEnd ? formatLongDate(config.leaveEnd) : LEAVE_END_PLACEHOLDER,
    leaveEndShort: config.leaveEnd ? formatShortDate(config.leaveEnd) : null,
    reasonPhrase: REASON_PHRASES[config.reason],
    backup: backupName ? { name: backupName, email: backupEmail || null } : null,
  }
}

const formatBackup = ({ name, email }: NonNullable<TemplateValues['backup']>) =>
  email ? `${name} (${email})` : name

const paragraphs = (...parts: (string | null)[]) =>
  parts.filter((part): part is string => part !== null).join('\n\n')

const outOfOfficeSubject = (v: TemplateValues, prefix = 'Out of office') =>
  v.leaveEndShort ? `${prefix} until ${v.leaveEndShort}` : prefix

export const BASE_TEMPLATES: Record<Tone, (v: TemplateValues) => Template> = {
  formal: (v) => ({
    subject: outOfOfficeSubject(v),
    body: paragraphs(
      'Hello,',
      `Thank you for your email. I am ${v.reasonPhrase} from ${v.leaveStart} and will be back on ${v.leaveEnd}, with limited access to email in the meantime.`,
      v.backup ? `For urgent matters, please contact ${formatBackup(v.backup)}.` : null,
      'I will respond to your message as soon as possible after my return.',
      `Kind regards,\n${v.name}`,
    ),
  }),

  friendly: (v) => ({
    subject: outOfOfficeSubject(v, 'Away'),
    body: paragraphs(
      'Hi there!',
      `Thanks so much for reaching out. I'm ${v.reasonPhrase} from ${v.leaveStart} and will be back on ${v.leaveEnd}.`,
      v.backup ? `If something can't wait, ${formatBackup(v.backup)} will be happy to help.` : null,
      "I'll get back to you as soon as I can once I'm back.",
      `Talk soon,\n${v.name}`,
    ),
  }),

  funny: (v) => ({
    subject: outOfOfficeSubject(v, 'Gone (temporarily)'),
    body: paragraphs(
      'Hey!',
      `Your email has arrived safely, but I haven't.`,
      `I'm ${v.reasonPhrase} from ${v.leaveStart} and will return to my inbox on ${v.leaveEnd}, coffee in hand.`,
      v.backup
        ? `If it's truly urgent, ${formatBackup(v.backup)} has kindly agreed to be me while I'm away.`
        : null,
      "Until then, your message will wait patiently. I'll reply once I'm back.",
      `Cheers,\n${v.name}`,
    ),
  }),

  short: (v) => ({
    subject: outOfOfficeSubject(v),
    body: paragraphs(
      `I'm ${v.reasonPhrase} until ${v.leaveEnd}.`,
      v.backup ? `For anything urgent, contact ${formatBackup(v.backup)}.` : null,
      `Thanks,\n${v.name}`,
    ),
  }),
}

export function generateTemplate(config: TemplateConfiguration): Template {
  return BASE_TEMPLATES[config.tone](toTemplateValues(config))
}

// Takes a ref or getter rather than the configuration object itself so the message keeps
// regenerating when the whole configuration is replaced (e.g. `templateConfiguration.value = {...}`).
// Passing `ref.value` would capture a single object and silently stop tracking after reassignment.
export function useTemplateContent(configuration: MaybeRefOrGetter<TemplateConfiguration>) {
  const generated = computed(() => generateTemplate(toValue(configuration)))

  const subject = ref(generated.value.subject)
  const body = ref(generated.value.body)

  function reset() {
    subject.value = generated.value.subject
    body.value = generated.value.body
  }

  watch(generated, reset)

  const isEdited = computed(
    () => subject.value !== generated.value.subject || body.value !== generated.value.body,
  )

  return { subject, body, isEdited, reset }
}
