<script setup lang="ts">
import { useId } from 'vue'
import SwitchBar, { type SwitchBarOption } from '../../../shared/components/layout/SwitchBar.vue'
import InputLabel from '../../../shared/components/forms/InputLabel.vue'
import type { Tone } from '../models/Tone.model.ts'

const tone = defineModel<Tone>({ default: 'formal' })
const labelId = useId()

const tones: SwitchBarOption<Tone>[] = [
  { label: 'Formal', value: 'formal' },
  { label: 'Friendly', value: 'friendly' },
  { label: 'Funny', value: 'funny' },
  { label: 'Short', value: 'short' },
]
</script>

<template>
  <div class="tone-selector">
    <InputLabel :id="labelId">Tone</InputLabel>
    <SwitchBar v-model="tone" :options="tones" :aria-labelledby="labelId" />
  </div>
</template>
