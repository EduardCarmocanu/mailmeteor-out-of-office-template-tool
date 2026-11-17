<script setup lang="ts">
import TextInput from '../../../shared/components/TextInput.vue'
import EmailInput from '../../../shared/components/EmailInput.vue'
import DateInput from '../../../shared/components/DateInput.vue'
import CollapsibleSection from '../../../shared/components/CollapsibleSection.vue'
import ToneSelector from './ToneSelector.vue'
import ReasonSelector from './ReasonSelector.vue'
import { useTemplateConfiguration } from '../composables/TemplateConfiguration.composable.ts'

const { templateConfigurationForm: form, today } = useTemplateConfiguration()
</script>

<template>
  <div class="template-configurator">
    <TextInput v-model="form.name" :label="'Your Name'" :placeholder="'e.g. Jordan Lee'" />
    <div class="template-configurator__row">
      <DateInput v-model="form.firstDayAway" label="First day away" :min="today" :max="null" />
      <DateInput v-model="form.backOn" label="Back on" :min="today" :max="null" />
    </div>
    <ToneSelector v-model="form.tone" />
    <CollapsibleSection
      class="template-configurator__advanced"
      title="Advanced options"
      subtitle="Reason, backup contact"
    >
      <div class="template-configurator__fields">
        <ReasonSelector v-model="form.reason" />
        <div class="template-configurator__row">
          <TextInput
            v-model="form.backupName"
            label="Backup contact"
            placeholder="e.g. Sam Patel"
            optional
          />
          <EmailInput
            v-model="form.backupEmail"
            label="Their email"
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
  gap: 20px;
}

.template-configurator__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.template-configurator__advanced {
  border-top: 1px solid #e6e8ef;
}
</style>
