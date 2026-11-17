import { ref, watch } from 'vue'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'

// Module-level state so the configurator and the message editor share the same template.
const templateConfiguration = ref<TemplateConfiguration>({
  name: '',
  leaveStart: null,
  leaveEnd: null,
  tone: 'formal',
  reason: 'vacation',
  backupName: '',
  backupEmail: '',
})

// Keep the leave end from falling before the leave start by moving it forward.
watch(
  () => templateConfiguration.value.leaveStart,
  (leaveStart) => {
    const { leaveEnd } = templateConfiguration.value
    if (leaveStart && leaveEnd && leaveEnd.getTime() < leaveStart.getTime()) {
      templateConfiguration.value.leaveEnd = new Date(leaveStart)
    }
  },
)

// Keep the leave start from falling after the leave end by moving it back.
watch(
  () => templateConfiguration.value.leaveEnd,
  (leaveEnd) => {
    const { leaveStart } = templateConfiguration.value
    if (leaveEnd && leaveStart && leaveStart.getTime() > leaveEnd.getTime()) {
      templateConfiguration.value.leaveStart = new Date(leaveEnd)
    }
  },
)

/** Overwrites only the fields set in the preset, keeping the rest of the configuration. */
function applyPreset(preset: Partial<TemplateConfiguration>) {
  Object.assign(templateConfiguration.value, preset)
}

export function useTemplateConfiguration() {
  return { templateConfiguration, applyPreset }
}
