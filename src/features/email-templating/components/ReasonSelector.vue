<script setup lang="ts">
import { useId } from 'vue'
import InputLabel from '../../../shared/components/InputLabel.vue'
import PillButton from '../../../shared/components/PillButton.vue'
import type { Reason } from '../composables/EmailTemplate.composable.ts'

const reason = defineModel<Reason>({ default: 'vacation' })
const labelId = useId()

const reasons: { label: string; value: Reason }[] = [
  { label: 'Vacation', value: 'vacation' },
  { label: 'Holidays', value: 'holidays' },
  { label: 'Business trip', value: 'business-trip' },
  { label: 'Conference', value: 'conference' },
  { label: 'Sick leave', value: 'sick-leave' },
  { label: 'Parental leave', value: 'parental-leave' },
]
</script>

<template>
  <div class="reason-selector">
    <InputLabel :id="labelId">Reason</InputLabel>
    <div class="reason-selector__options" role="group" :aria-labelledby="labelId">
      <PillButton
        v-for="option in reasons"
        :key="option.value"
        :label="option.label"
        :selected="option.value === reason"
        @click="reason = option.value"
      />
    </div>
  </div>
</template>

<style scoped>
.reason-selector__options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
