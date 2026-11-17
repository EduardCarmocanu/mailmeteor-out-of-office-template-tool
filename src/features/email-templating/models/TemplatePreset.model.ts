import type { TemplateConfiguration } from './TemplateConfiguration.model.ts'

/** A ready-made situation that fills in part of the template configuration. */
export interface TemplatePreset {
  description: string
  /** Only the fields set here are changed; the rest of the configuration is kept. */
  configuration: Partial<TemplateConfiguration>
}
