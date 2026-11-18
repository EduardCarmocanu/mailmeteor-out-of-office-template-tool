<script setup lang="ts">
import Panel from '../../../shared/components/layout/Panel.vue'
import MessageTemplateEditor from '../components/MessageTemplateEditor.vue'
import TemplateConfigurator from '../components/TemplateConfigurator.vue'
import TemplatePresetList from '../components/TemplatePresetList.vue'
</script>

<template>
  <div class="template-editor-page">
    <Panel class="template-editor-page__main-configuration">
      <TemplateConfigurator class="template-editor-page__column" />
      <MessageTemplateEditor class="template-editor-page__column" />
    </Panel>
    <TemplatePresetList class="template-editor-page__presets" />
  </div>
</template>

<style scoped>
.template-editor-page__main-configuration {
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  gap: var(--space-6);
}

.template-editor-page__column {
  flex: 1 1 0;
  min-width: 0;
}

.template-editor-page__presets {
  padding-top: var(--space-2);
}
</style>
