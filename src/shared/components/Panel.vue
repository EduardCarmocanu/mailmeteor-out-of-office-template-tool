<script setup lang="ts">
const { variant = 'default' } = defineProps<{ variant?: 'default' | 'secondary' }>()
</script>

<template>
  <div :class="`panel ${variant === 'secondary' ? 'panel--secondary' : ''}`">
    <slot></slot>
  </div>
</template>

<style scoped>
.panel {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 1px solid #e6e8ef;
  border-radius: 8px;
  padding: 24px;
}
.panel--secondary {
  background-color: #e6e8ef;
}
</style>
