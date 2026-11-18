<script setup lang="ts">
import TextInput from '../../../shared/components/forms/TextInput.vue'
import EmailInput from '../../../shared/components/forms/EmailInput.vue'
import DateInput from '../../../shared/components/forms/DateInput.vue'
import CollapsibleSection from '../../../shared/components/layout/CollapsibleSection.vue'
import ToneSelector from './ToneSelector.vue'
import ReasonSelector from './ReasonSelector.vue'
import { useTemplateConfiguration } from '../composables/TemplateConfiguration.composable.ts'
import { useDate } from '../../../shared/composables/Date.composable.ts'

const { templateConfiguration } = useTemplateConfiguration()
const today = useDate().today()
</script>

<template>
  <div class="template-configurator">
    <TextInput
      v-model="templateConfiguration.name"
      :label="'Your Name'"
      :placeholder="'e.g. Jordan Lee'"
    />
    <div class="template-configurator__row">
      <DateInput
        v-model="templateConfiguration.leaveStart"
        label="First day away"
        :min="today"
        :max="null"
      />
      <DateInput
        v-model="templateConfiguration.leaveEnd"
        label="Back on"
        :min="today"
        :max="null"
      />
    </div>
    <ToneSelector v-model="templateConfiguration.tone" />
    <CollapsibleSection
      class="template-configurator__advanced"
      title="Advanced options"
      subtitle="Reason, backup contact"
    >
      <div class="template-configurator__fields">
        <ReasonSelector v-model="templateConfiguration.reason" />
        <div class="template-configurator__row">
          <TextInput
            v-model="templateConfiguration.backupName"
            label="Backup contact"
            placeholder="e.g. Sam Patel"
            optional
          />
          <EmailInput
            v-model="templateConfiguration.backupEmail"
            label="Their email"
            optional
            placeholder="sam@company.com"
          />
        </div>
      </div>
    </CollapsibleSection>
  </div>
</template>

<style scoped>
.template-configurator,
.template-configurator__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.template-configurator__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.template-configurator__advanced {
  border-top: var(--border-width) solid var(--color-border-subtle);
}
</style>
