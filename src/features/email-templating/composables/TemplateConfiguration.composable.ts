import { ref, watch } from 'vue'
import { useDate } from '../../../shared/composables/Date.composable.ts'
import { queryParamClient } from '../../../shared/infrastructure/QueryParamClient.ts'
import { REASONS, type Reason } from '../models/Reason.model.ts'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'
import { TONES, type Tone } from '../models/Tone.model.ts'

const { parseIsoDate, toIsoDate } = useDate()

const isTone = (value: string): value is Tone => (TONES as readonly string[]).includes(value)

const isReason = (value: string): value is Reason => (REASONS as readonly string[]).includes(value)

const MAX_TEXT_QUERY_PARAM_LENGTH = 100

const isValidText = (value: string | undefined): value is string =>
  !!value && value.length <= MAX_TEXT_QUERY_PARAM_LENGTH

function readConfigurationFromQueryParams(): Partial<TemplateConfiguration> {
  const params = queryParamClient.getAll()
  const configuration: Partial<TemplateConfiguration> = {}

  if (isValidText(params.name)) configuration.name = params.name
  if (isValidText(params.backupName)) configuration.backupName = params.backupName
  if (isValidText(params.backupEmail)) configuration.backupEmail = params.backupEmail

  const leaveStart = params.leaveStart ? parseIsoDate(params.leaveStart) : null
  if (leaveStart) configuration.leaveStart = leaveStart

  const leaveEnd = params.leaveEnd ? parseIsoDate(params.leaveEnd) : null
  if (leaveEnd) configuration.leaveEnd = leaveEnd

  if (params.tone && isTone(params.tone)) configuration.tone = params.tone
  if (params.reason && isReason(params.reason)) configuration.reason = params.reason

  return configuration
}

function toQueryParams(configuration: TemplateConfiguration): Record<string, string | null> {
  return {
    name: configuration.name || null,
    leaveStart: configuration.leaveStart ? toIsoDate(configuration.leaveStart) : null,
    leaveEnd: configuration.leaveEnd ? toIsoDate(configuration.leaveEnd) : null,
    tone: configuration.tone,
    reason: configuration.reason,
    backupName: configuration.backupName || null,
    backupEmail: configuration.backupEmail || null,
  }
}

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

function applyConfiguration(configuration: Partial<TemplateConfiguration>) {
  Object.assign(templateConfiguration.value, configuration)
}

applyConfiguration(readConfigurationFromQueryParams())

watch(
  templateConfiguration,
  (configuration) => queryParamClient.update(toQueryParams(configuration)),
  { deep: true, immediate: true },
)

export function useTemplateConfiguration() {
  return { templateConfiguration, applyConfiguration }
}
