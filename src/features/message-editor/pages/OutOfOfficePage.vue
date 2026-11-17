<script setup lang="ts">
import Panel from '../../../shared/components/Panel.vue'
import MessageTemplateEditor from '../components/MessageTemplateEditor.vue'
import TemplateConfigurator from '../components/TemplateConfigurator.vue'
</script>

<template>
  <Panel>
    <TemplateConfigurator></TemplateConfigurator>
    <MessageTemplateEditor></MessageTemplateEditor>
  </Panel>
  <div>
    <Panel variant="secondary">
      I'm off for the holidays. Let clients know who to contact if something is urgent.
    </Panel>
    <Panel variant="secondary">
      I'm on vacation. Tell my team I'm fully offline and will catch up when I'm back.
    </Panel>
    <Panel variant="secondary">
      I'm at a conference with limited access to email. Keep it short and professional for clients.
    </Panel>
    <Panel variant="secondary">
      I'm going on parental leave. Point people to the colleague who's covering my work.
    </Panel>
  </div>
</template>

<style scoped></style>
