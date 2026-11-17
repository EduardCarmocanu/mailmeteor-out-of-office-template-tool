import { ref, watch } from 'vue'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'

const templateConfiguration = ref<TemplateConfiguration>({
  name: '',
  leaveStart: null,
  leaveEnd: null,
  tone: 'formal',
  reason: 'vacation',
  backupName: '',
  backupEmail: '',
})

watch(
  () => templateConfiguration.value.leaveStart,
  (leaveStart) => {
    const { leaveEnd } = templateConfiguration.value
    if (leaveStart && leaveEnd && leaveEnd.getTime() < leaveStart.getTime()) {
      templateConfiguration.value.leaveEnd = new Date(leaveStart)
    }
  },
)

watch(
  () => templateConfiguration.value.leaveEnd,
  (leaveEnd) => {
    const { leaveStart } = templateConfiguration.value
    if (leaveEnd && leaveStart && leaveStart.getTime() > leaveEnd.getTime()) {
      templateConfiguration.value.leaveStart = new Date(leaveEnd)
    }
  },
)

function applyPreset(preset: Partial<TemplateConfiguration>) {
  Object.assign(templateConfiguration.value, preset)
}

export function useTemplateConfiguration() {
  return { templateConfiguration, applyPreset }
}
