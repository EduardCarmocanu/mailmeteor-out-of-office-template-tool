import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TemplatePresetList from './TemplatePresetList.vue'
import { useTemplateConfiguration } from '../composables/TemplateConfiguration.composable.ts'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'
import type { TemplatePreset } from '../models/TemplatePreset.model.ts'

const PRESETS: TemplatePreset[] = [
  {
    description:
      "I'm off for the holidays. Let clients know who to contact if something is urgent.",
    configuration: { reason: 'holidays', tone: 'formal' },
  },
  {
    description: "I'm on vacation. Tell my team I'm fully offline and will catch up when I'm back.",
    configuration: { reason: 'vacation', tone: 'friendly' },
  },
  {
    description:
      "I'm at a conference with limited access to email. Keep it short and professional for clients.",
    configuration: { reason: 'conference', tone: 'short' },
  },
  {
    description:
      "I'm going on parental leave. Point people to the colleague who's covering my work.",
    configuration: { reason: 'parental-leave', tone: 'formal' },
  },
]

const { templateConfiguration } = useTemplateConfiguration()

function resetConfiguration(overrides: Partial<TemplateConfiguration> = {}) {
  templateConfiguration.value = {
    name: '',
    leaveStart: null,
    leaveEnd: null,
    tone: 'funny',
    reason: 'sick-leave',
    backupName: '',
    backupEmail: '',
    ...overrides,
  }
}

function mountPresetList() {
  return mount(TemplatePresetList)
}

function findPreset(wrapper: ReturnType<typeof mountPresetList>, description: string) {
  const preset = wrapper
    .findAll('.template-preset-list__preset')
    .find((panel) => panel.text() === description)
  if (!preset) throw new Error(`Preset not found: ${description}`)
  return preset
}

describe('TemplatePresetList', () => {
  beforeEach(() => {
    resetConfiguration()
  })

  it('renders one clickable panel per preset, in order', () => {
    const wrapper = mountPresetList()

    const presets = wrapper.findAll('.template-preset-list__preset')

    expect(presets.map((preset) => preset.text())).toEqual(
      PRESETS.map((preset) => preset.description),
    )
    for (const preset of presets) {
      expect(preset.attributes('role')).toBe('button')
      expect(preset.classes()).toContain('panel--secondary')
    }
  })

  it.each(PRESETS)(
    'applies the preset configuration when "$description" is clicked',
    async ({ description, configuration }) => {
      const wrapper = mountPresetList()

      await findPreset(wrapper, description).trigger('click')

      expect(templateConfiguration.value).toMatchObject(configuration)
    },
  )

  it('applies the preset configuration when activated with the keyboard', async () => {
    const wrapper = mountPresetList()
    const [, vacationPreset] = PRESETS

    await findPreset(wrapper, vacationPreset!.description).trigger('keydown', { key: 'Enter' })

    expect(templateConfiguration.value).toMatchObject(vacationPreset!.configuration)
  })

  it('keeps the fields that the preset does not set', async () => {
    const leaveStart = new Date(2026, 11, 20)
    const leaveEnd = new Date(2026, 11, 31)
    resetConfiguration({
      name: 'Ada Lovelace',
      leaveStart,
      leaveEnd,
      backupName: 'Charles Babbage',
      backupEmail: 'charles@example.com',
    })
    const wrapper = mountPresetList()

    await findPreset(wrapper, PRESETS[0]!.description).trigger('click')

    expect(templateConfiguration.value).toEqual({
      name: 'Ada Lovelace',
      leaveStart,
      leaveEnd,
      backupName: 'Charles Babbage',
      backupEmail: 'charles@example.com',
      reason: 'holidays',
      tone: 'formal',
    })
  })

  it('replaces a previously applied preset when another one is clicked', async () => {
    const wrapper = mountPresetList()

    await findPreset(wrapper, PRESETS[1]!.description).trigger('click')
    await findPreset(wrapper, PRESETS[2]!.description).trigger('click')

    expect(templateConfiguration.value).toMatchObject({ reason: 'conference', tone: 'short' })
  })
})
