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
  gap: 10px;
  width: 100%;
  padding: 12px 0;
  border: 0;
  background: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
  outline: none;
}

.collapsible-section__header:focus-visible {
  border-radius: 6px;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
}

.collapsible-section__title {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  color: #1f2340;
}

.collapsible-section__subtitle {
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  font-weight: var(--font-weight-regular);
  color: #7a7f9e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collapsible-section__chevron {
  flex-shrink: 0;
  margin-left: auto;
  color: #1f2340;
}

.collapsible-section__chevron--open {
  transform: rotate(180deg);
}

.collapsible-section__content {
  padding-top: 8px;
}
</style>
