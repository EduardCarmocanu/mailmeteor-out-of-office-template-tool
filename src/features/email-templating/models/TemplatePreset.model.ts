import type { TemplateConfiguration } from './TemplateConfiguration.model.ts'

export interface TemplatePreset {
  description: string
  configuration: Partial<TemplateConfiguration>
}
