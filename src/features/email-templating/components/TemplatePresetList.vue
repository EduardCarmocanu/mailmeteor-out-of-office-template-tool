<script setup lang="ts">
import Panel from '../../../shared/components/layout/Panel.vue'
import { useTemplateConfiguration } from '../composables/TemplateConfiguration.composable.ts'
import type { TemplatePreset } from '../models/TemplatePreset.model.ts'

const { applyPreset } = useTemplateConfiguration()

const TEMPLATE_PRESETS: TemplatePreset[] = [
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
</script>

<template>
  <div class="template-preset-list">
    <Panel
      v-for="preset in TEMPLATE_PRESETS"
      :key="preset.description"
      class="template-preset-list__preset"
      variant="secondary"
      @click="applyPreset(preset.configuration)"
    >
      {{ preset.description }}
    </Panel>
  </div>
</template>

<style scoped>
.template-preset-list {
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  gap: var(--space-2);
}

.template-preset-list__preset {
  font-size: var(--font-size-base);
  line-height: 1.6;
}
</style>
