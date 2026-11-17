<script setup lang="ts">
import { ref } from 'vue'
import Panel from '../../../shared/components/Panel.vue'
import MessageTemplateEditor from '../components/MessageTemplateEditor.vue'
import TemplateConfigurator from '../components/TemplateConfigurator.vue'

// Placeholder content until the message is generated from the configuration.
const subject = ref('Out of office until Jan 4')
const body = ref(
  [
    'Hello,',
    'Thank you for your email. I am away for the holidays since Monday, December 21 and will be back on Monday, January 4, with limited access to email in the meantime.',
    'I will respond to your message as soon as possible after my return.',
    'Kind regards,\n[Your name]',
  ].join('\n\n'),
)
</script>

<template>
  <div class="template-editor-page">
    <Panel>
      <div class="template-editor-page__main-configuration">
        <TemplateConfigurator></TemplateConfigurator>
        <MessageTemplateEditor v-model:subject="subject" :body="body" />
      </div>
    </Panel>
    <div class="template-editor-page__pre-configurations">
      <Panel class="template-editor-page__preset" variant="secondary">
        I'm off for the holidays. Let clients know who to contact if something is urgent.
      </Panel>
      <Panel class="template-editor-page__preset" variant="secondary">
        I'm on vacation. Tell my team I'm fully offline and will catch up when I'm back.
      </Panel>
      <Panel class="template-editor-page__preset" variant="secondary">
        I'm at a conference with limited access to email. Keep it short and professional for
        clients.
      </Panel>
      <Panel class="template-editor-page__preset" variant="secondary">
        I'm going on parental leave. Point people to the colleague who's covering my work.
      </Panel>
    </div>
  </div>
</template>

<style scoped>
.template-editor-page__main-configuration {
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  gap: 24px;
}

.template-editor-page__pre-configurations {
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
}

.template-editor-page__preset {
  font-size: 14px;
  line-height: 1.6;
}
</style>
