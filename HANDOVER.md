# Handover

Things that still need documenting before the project is handed over. Tick items off as they are written up (in the README, a `docs/` folder, or here).

## Getting started

- [ ] Replace the boilerplate [README.md](README.md) with a project description: what the tool does and who it is for
- [ ] Prerequisites: Node version (`engines` in [package.json](package.json): `^22.18.0 || >=24.12.0`) and pnpm
- [ ] Fix the e2e example path in the README (`tests/example.spec.ts` → a real file in [e2e/](e2e/))
- [ ] List every script and what it does (`dev`, `build`, `build-only`, `preview`, `type-check`, `test:unit`, `test:e2e`, `lint`, `format`)
- [ ] Explain the three `Screenshot+2026-11-17+...png` files in the repo root (design reference? keep, move to `docs/`, or delete)

## Architecture

- [ ] High-level overview: [App.vue](src/App.vue) → [EmailTemplatePage.vue](src/features/email-templating/pages/EmailTemplatePage.vue) → `TemplateConfigurator` + `MessageTemplateEditor` + preset panels
- [ ] Data flow: [TemplateConfiguration.composable.ts](src/features/email-templating/composables/TemplateConfiguration.composable.ts) (module-level shared state) → [TemplateContent.composable.ts](src/features/email-templating/composables/TemplateContent.composable.ts) → subject and body
- [ ] Why `useTemplateContent` takes a ref or getter (`MaybeRefOrGetter`) instead of a plain object
- [ ] Date rules: leave start and end adjust each other so the end is never before the start
- [ ] Edit/reset behaviour: manual edits to subject or body are overwritten whenever the configuration changes; "Reset" restores the generated text
- [ ] Point to [CLAUDE.md](CLAUDE.md) for folder structure, naming and import conventions

## Content and domain

- [ ] How templates are built: `BASE_TEMPLATES` per tone, `toTemplateValues`, and placeholders such as `[Your name]`, `[first day away]`, `[back on]`
- [ ] How to add a tone ([Tone.model.ts](src/features/email-templating/models/Tone.model.ts) + `BASE_TEMPLATES` + `ToneSelector`)
- [ ] How to add a reason ([Reason.model.ts](src/features/email-templating/models/Reason.model.ts) + `REASON_PHRASES` + `ReasonSelector`)
- [ ] How to add or edit presets (`TEMPLATE_PRESETS` in [EmailTemplatePage.vue](src/features/email-templating/pages/EmailTemplatePage.vue))
- [ ] Locale assumptions: English-only copy, `en-US` formatting for dates in the message, `DD/MM/YYYY` in the date inputs ([date.ts](src/shared/utils/date.ts))

## UI and styling

- [ ] Design tokens in [global.css](src/styles/global.css) (colors, radii, font sizes) and when to add new ones
- [ ] Fonts (Poppins from Google Fonts) and the 1000px max-width set inline in [index.html](index.html)
- [ ] Icons: SVGs in [src/assets/icons/](src/assets/icons/), imported as components with `?component` through `vite-svg-loader`
- [ ] Catalogue of shared components ([buttons/](src/shared/components/buttons/), [forms/](src/shared/components/forms/), [layout/](src/shared/components/layout/)) with their props and events

## Testing and quality

- [ ] Unit test conventions (co-located `.spec.ts`, Vitest + jsdom) and how to run a single file or watch mode
- [ ] E2E setup: installing Playwright browsers, helpers in [e2e/support/page.ts](e2e/support/page.ts), and local vs CI server (dev on 5173, preview on 4173) in [playwright.config.ts](playwright.config.ts)
- [ ] Lint and format toolchain (oxlint, ESLint, Prettier) and the recommended VS Code extensions

## Deployment and operations

- [ ] Build output (`dist/`) and where and how the app is hosted
- [ ] CI: no pipeline exists yet; describe the intended setup or record it as missing
- [ ] Environment variables: none are used today; confirm and say so

## Known gaps and next steps

- [ ] "Configure in Gmail" and "Configure in Outlook" are placeholder links (`href="#"` in [MessageEditorControls.vue](src/features/email-templating/components/MessageEditorControls.vue))
- [ ] No persistence: configuration and edits are lost on reload
- [ ] Responsive/mobile layout: current behaviour and whether it is in scope
- [ ] `<html lang="">` is empty in [index.html](index.html)
- [ ] Open decisions, backlog, and points of contact
