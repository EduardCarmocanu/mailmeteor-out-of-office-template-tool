<script setup lang="ts">
import { ref } from 'vue'
import TextInput from '../../../shared/components/TextInput.vue'
import EmailInput from '../../../shared/components/EmailInput.vue'
import CollapsibleSection from '../../../shared/components/CollapsibleSection.vue'
import ToneSelector from './ToneSelector.vue'
import ReasonSelector from './ReasonSelector.vue'

const form = ref({
  name: '',
  tone: 'formal',
  reason: 'vacation',
  backupName: '',
  backupEmail: '',
})
</script>

<template>
  <div>
    <TextInput v-model="form.name" :label="'Your Name'" :placeholder="'e.g. Jordan Lee'" />
    <ToneSelector v-model="form.tone" />
    <CollapsibleSection title="Advanced options" subtitle="Reason, backup contact">
      <ReasonSelector v-model="form.reason" />
      <TextInput
        v-model="form.backupName"
        label="Backup contact"
        placeholder="e.g. Sam Patel"
        optional
      />
      <EmailInput v-model="form.backupEmail" label="Their email" placeholder="sam@company.com" />
    </CollapsibleSection>
  </div>
</template>

<style scoped></style>
