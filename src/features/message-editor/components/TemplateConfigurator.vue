<script setup lang="ts">
import { ref } from 'vue'
import TextInput from '../../../shared/components/TextInput.vue'
import CollapsibleSection from '../../../shared/components/CollapsibleSection.vue'
import ToneSelector from './ToneSelector.vue'

const form = ref({
  name: '',
  tone: 'formal',
})
</script>

<template>
  <div>
    <TextInput v-model="form.name" :label="'Your Name'" :placeholder="'e.g. Jordan Lee'" />
    <ToneSelector v-model="form.tone" />
    <CollapsibleSection title="Advanced options" subtitle="Reason, backup contact">
      <p>Advanced options content goes here.</p>
    </CollapsibleSection>
  </div>
</template>

<style scoped></style>
