import { computed, ref, watch } from 'vue'
import { formatLongDate, formatShortDate } from '../../../shared/utils/date.ts'
import type { Reason } from '../models/Reason.model.ts'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'
import type { Tone } from '../models/Tone.model.ts'

export interface Template {
  subject: string
  body: string
}

/** Configuration values formatted for insertion into a base template. */
export interface TemplateValues {
  name: string
  leaveStart: string
  leaveEnd: string
  /** Short `Jan 4` form of the return date, or `null` when it isn't set. */
  leaveEndShort: string | null
  /** Reads after "I am …", e.g. `on vacation`. */
  reasonPhrase: string
  /** Set only when a backup name is given; `email` is optional. */
  backup: { name: string; email: string | null } | null
}

// Placeholders keep missing values visible so the user knows what to fill in.
const NAME_PLACEHOLDER = '[Your name]'
const LEAVE_START_PLACEHOLDER = '[first day away]'
const LEAVE_END_PLACEHOLDER = '[back on]'

/** How each reason reads after "I am …" in a message. */
const REASON_PHRASES: Record<Reason, string> = {
  'vacation': 'on vacation',
  'holidays': 'away for the holidays',
  'business-trip': 'on a business trip',
  'conference': 'at a conference',
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

/** `Sam Patel (sam@company.com)`, or just the name when there is no email. */
const formatBackup = ({ name, email }: NonNullable<TemplateValues['backup']>) =>
  email ? `${name} (${email})` : name

/** Joins paragraphs with blank lines, skipping the ones left out (e.g. no backup). */
const paragraphs = (...parts: (string | null)[]) =>
  parts.filter((part): part is string => part !== null).join('\n\n')

const outOfOfficeSubject = (v: TemplateValues, prefix = 'Out of office') =>
  v.leaveEndShort ? `${prefix} until ${v.leaveEndShort}` : prefix

/** One base template per tone; the tone configuration picks which one is used. */
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

/** Builds the message content from a configuration with the base template for its tone. */
export function generateTemplate(config: TemplateConfiguration): Template {
  return BASE_TEMPLATES[config.tone](toTemplateValues(config))
}

/**
 * Editable message content generated from the given configuration.
 * The configuration must be reactive (e.g. a ref's `.value`) for the message to regenerate.
 */
export function useTemplateContent(configuration: TemplateConfiguration) {
  const generated = computed(() => generateTemplate(configuration))

  const subject = ref(generated.value.subject)
  const body = ref(generated.value.body)

  /** Restores the subject and body generated from the configuration. */
  function reset() {
    subject.value = generated.value.subject
    body.value = generated.value.body
  }

  // Any configuration change regenerates the message, replacing manual edits.
  watch(generated, reset)

  // True once the subject or body differs from the generated content.
  const isEdited = computed(
    () => subject.value !== generated.value.subject || body.value !== generated.value.body,
  )

  return { subject, body, isEdited, reset }
}
