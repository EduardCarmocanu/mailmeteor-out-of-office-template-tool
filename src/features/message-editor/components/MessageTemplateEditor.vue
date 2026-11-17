<script setup lang="ts">
import { useId } from 'vue'
import MessageBody from './MessageBody.vue'

defineProps<{
  /** Generated message text, re-rendered whenever it changes. */
  body: string
}>()

const subject = defineModel<string>('subject', { default: '' })

const subjectId = useId()
</script>

<template>
  <div class="message-template-editor">
    <div class="message-template-editor__subject">
      <label class="message-template-editor__subject-label" :for="subjectId">Subject:</label>
      <input
        :id="subjectId"
        v-model="subject"
        class="message-template-editor__subject-field"
        type="text"
        autocomplete="off"
      />
    </div>
    <MessageBody class="message-template-editor__body" :body="body" />
  </div>
</template>

<style scoped>
.message-template-editor {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 420px;
  border: 1px solid #e6e8ef;
  border-radius: 6px;
  background: #f4f5f8;
}

.message-template-editor__subject {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px 10px 18px;
  border-bottom: 1px solid #e6e8ef;
}

.message-template-editor__subject-label {
  flex: none;
  font-size: 14px;
  color: #6b7190;
}

.message-template-editor__subject-field {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  color: #1f2340;
  outline: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.message-template-editor__subject-field:hover {
  border-color: #dcdfe8;
}

.message-template-editor__subject-field:focus {
  border-color: #6b72f2;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
}

.message-template-editor__body {
  flex: 1;
}
</style>
