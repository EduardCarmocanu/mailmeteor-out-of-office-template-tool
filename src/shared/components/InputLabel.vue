<script setup lang="ts">
defineProps<{
  /** Id of the form control this label describes. */
  for?: string
  /** Appends a lighter "(optional)" hint after the label text. */
  optional?: boolean
}>()
</script>

<template>
  <label class="input-label" :for="$props.for">
    <slot />
    <template v-if="optional">
      {{ ' ' }}<span class="input-label__optional">(optional)</span>
    </template>
  </label>
</template>

<style scoped>
.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #3b4262;
}

.input-label__optional {
  font-weight: 400;
}
</style>
