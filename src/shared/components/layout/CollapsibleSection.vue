<script setup lang="ts">
import { useId } from 'vue'
import ChevronDownIcon from '@/assets/icons/chevron-down.svg?component'

defineProps<{
  title: string
  subtitle?: string
}>()

const open = defineModel<boolean>('open', { default: false })

const contentId = useId()

const toggle = () => {
  open.value = !open.value
}
</script>

<template>
  <section class="collapsible-section">
    <button
      type="button"
      class="collapsible-section__header"
      :aria-expanded="open"
      :aria-controls="contentId"
      @click="toggle"
    >
      <span class="collapsible-section__title">{{ title }}</span>
      <span v-if="subtitle" class="collapsible-section__subtitle">{{ subtitle }}</span>
      <ChevronDownIcon
        class="collapsible-section__chevron"
        :class="{ 'collapsible-section__chevron--open': open }"
        aria-hidden="true"
      />
    </button>
    <div v-show="open" :id="contentId" class="collapsible-section__content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.collapsible-section__header {
  display: flex;
  align-items: center;
  gap: var(--space-2-5);
  width: 100%;
  padding: var(--space-3) 0;
  border: 0;
  background: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
  outline: none;
}

.collapsible-section__header:focus-visible {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-focus);
}

.collapsible-section__title {
  flex-shrink: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-strong);
}

.collapsible-section__subtitle {
  min-width: 0;
  overflow: hidden;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-subtle);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collapsible-section__chevron {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--color-text-strong);
}

.collapsible-section__chevron--open {
  transform: rotate(180deg);
}

.collapsible-section__content {
  padding-top: var(--space-2);
}
</style>
