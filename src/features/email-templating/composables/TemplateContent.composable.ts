import { computed, ref } from 'vue'

// Placeholder content until the message is generated from the configuration.
const INITIAL_SUBJECT = 'Out of office until Jan 4'
const INITIAL_BODY = [
  'Hello,',
  'Thank you for your email. I am away for the holidays since Monday, December 21 and will be back on Monday, January 4, with limited access to email in the meantime.',
  'I will respond to your message as soon as possible after my return.',
  'Kind regards,\n[Your name]',
].join('\n\n')

// Module-level state so every consumer edits the same message.
const subject = ref(INITIAL_SUBJECT)
const body = ref(INITIAL_BODY)

// True once the subject or body differs from the template's original content.
const isEdited = computed(() => subject.value !== INITIAL_SUBJECT || body.value !== INITIAL_BODY)

export function useTemplateContent() {
  return { subject, body, isEdited }
}
