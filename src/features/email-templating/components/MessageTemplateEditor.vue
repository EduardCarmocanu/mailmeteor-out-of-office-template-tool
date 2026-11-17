<script setup lang="ts">
import MessageBodyEditor from './MessageBodyEditor.vue'
import MessageSubjectEditor from './MessageSubjectEditor.vue'
import { useEmailTemplate } from '../composables/EmailTemplate.composable.ts'

const { subject, body } = useEmailTemplate()
</script>

<template>
  <div class="message-template-editor">
    <MessageSubjectEditor v-model="subject" class="message-template-editor__subject" />
    <MessageBodyEditor class="message-template-editor__body" v-model="body" />
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
  border-bottom: 1px solid #e6e8ef;
}

.message-template-editor__body {
  flex: 1;
}
</style>
