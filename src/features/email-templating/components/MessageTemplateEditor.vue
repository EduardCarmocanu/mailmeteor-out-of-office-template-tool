<script setup lang="ts">
import { computed } from 'vue'
import MessageBodyEditor from './MessageBodyEditor.vue'
import MessageEditorControls from './MessageEditorControls.vue'
import MessageSubjectEditor from './MessageSubjectEditor.vue'
import { useTemplateConfiguration } from '../composables/TemplateConfiguration.composable.ts'
import { useTemplateContent } from '../composables/TemplateContent.composable.ts'

const { templateConfiguration } = useTemplateConfiguration()
const { subject, body, isEdited, reset } = useTemplateContent(templateConfiguration)

const wordCount = computed(() => body.value.trim().split(/\s+/).filter(Boolean).length)
</script>

<template>
  <div class="message-template-editor">
    <div class="message-template-editor__box">
      <MessageSubjectEditor v-model="subject" class="message-template-editor__subject" />
      <MessageBodyEditor class="message-template-editor__body" v-model="body" />
    </div>
    <MessageEditorControls
      class="message-template-editor__controls"
      :word-count="wordCount"
      :edited="isEdited"
      @reset="reset"
    />
  </div>
</template>

<style scoped>
.message-template-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.message-template-editor__box {
  display: flex;
  flex: 1;
  flex-direction: column;
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

.message-template-editor__controls {
  padding-top: 14px;
}
</style>
