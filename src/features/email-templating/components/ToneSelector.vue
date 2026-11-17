<script setup lang="ts">
import { useId } from 'vue'
import SwitchBar, { type SwitchBarOption } from '../../../shared/components/SwitchBar.vue'
import InputLabel from '../../../shared/components/InputLabel.vue'
import type { Tone } from '../composables/EmailTemplate.composable.ts'

const tone = defineModel<Tone>({ default: 'formal' })
const id = useId()

const tones: SwitchBarOption<Tone>[] = [
  { label: 'Formal', value: 'formal' },
  { label: 'Friendly', value: 'friendly' },
  { label: 'Funny', value: 'funny' },
  { label: 'Short', value: 'short' },
]
</script>

<template>
  <div class="tone-selector">
    <InputLabel :for="id">Tone</InputLabel>
    <SwitchBar
      name="tone selector"
      v-model="tone"
      :options="tones"
    />
  </div>
</template>
