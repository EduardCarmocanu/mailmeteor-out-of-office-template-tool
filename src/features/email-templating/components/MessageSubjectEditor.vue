<script setup lang="ts">
import { useId } from 'vue'
import CopyButton from '../../../shared/components/CopyButton.vue'

const subject = defineModel<string>({ default: '' })

const subjectId = useId()
</script>

<template>
  <div class="message-subject">
    <label class="message-subject__label" :for="subjectId">Subject:</label>
    <input
      :id="subjectId"
      v-model="subject"
      class="message-subject__field"
      type="text"
      autocomplete="off"
    />
    <CopyButton class="message-subject__copy" :text="subject" label="Copy subject" />
  </div>
</template>

<style scoped>
.message-subject {
  display: flex;
  align-items: center;
  gap: 6px;
  /* Right padding lines the copy button up with the message body's. */
  padding: 10px 16px 10px 18px;
}

.message-subject__label {
  flex: none;
  font-size: 14px;
  color: #6b7190;
}

.message-subject__copy {
  flex: none;
}

.message-subject__field {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  color: #1f2340;
  outline: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.message-subject__field:hover {
  border-color: #dcdfe8;
}

.message-subject__field:focus {
  border-color: #6b72f2;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
}
</style>
