import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import EmailTemplatePage from './EmailTemplatePage.vue'
import TemplateConfigurator from '../components/TemplateConfigurator.vue'
import MessageTemplateEditor from '../components/MessageTemplateEditor.vue'
import TemplatePresetList from '../components/TemplatePresetList.vue'

function mountPage() {
  return mount(EmailTemplatePage, {
    global: {
      stubs: { TemplateConfigurator: true, MessageTemplateEditor: true, TemplatePresetList: true },
    },
  })
}

describe('EmailTemplatePage', () => {
  it('renders the template configurator, the message editor and the preset list', () => {
    const wrapper = mountPage()

    expect(wrapper.findComponent(TemplateConfigurator).exists()).toBe(true)
    expect(wrapper.findComponent(MessageTemplateEditor).exists()).toBe(true)
    expect(wrapper.findComponent(TemplatePresetList).exists()).toBe(true)
  })
})
