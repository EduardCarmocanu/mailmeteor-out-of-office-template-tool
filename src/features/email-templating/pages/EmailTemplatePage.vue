<script setup lang="ts">
import Panel from '../../../shared/components/Panel.vue'
import MessageTemplateEditor from '../components/MessageTemplateEditor.vue'
import TemplateConfigurator from '../components/TemplateConfigurator.vue'
</script>

<template>
  <div class="template-editor-page">
    <Panel class="template-editor-page__main-configuration">
      <TemplateConfigurator class="template-editor-page__column" />
      <MessageTemplateEditor class="template-editor-page__column" />
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

.template-editor-page__column {
  flex: 1 1 0;
  min-width: 0;
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
