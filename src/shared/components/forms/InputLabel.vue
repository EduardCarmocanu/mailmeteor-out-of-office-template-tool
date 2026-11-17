<script setup lang="ts">
defineProps<{
  for?: string
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
  margin-bottom: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  color: var(--color-text-label);
}

.input-label__optional {
  font-weight: var(--font-weight-regular);
}
</style>
