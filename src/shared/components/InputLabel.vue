<script setup lang="ts">
defineProps<{
  /** Id of the form control this label describes. */
  for?: string
}>()
</script>

<template>
  <label class="input-label" :for="$props.for">
    <slot />
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
</style>
