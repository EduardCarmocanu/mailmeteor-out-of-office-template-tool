# CLAUDE.md

## Folder structure

```
src/
├── main.ts                  # app bootstrap, imports global styles
├── App.vue                  # root component, renders feature pages
├── assets/icons/            # SVG icons, imported as components via `?component`
├── styles/global.css        # global styles and CSS custom properties (design tokens)
├── features/
│   └── <feature-name>/      # kebab-case, one folder per feature (e.g. email-templating)
│       ├── pages/           # top-level page components (`<Name>Page.vue`)
│       ├── components/      # components used only by this feature
│       ├── composables/     # feature state and logic (`<Name>.composable.ts`)
│       └── models/          # types and interfaces (`<Name>.model.ts`)
└── shared/
    ├── components/          # generic, feature-agnostic UI components
    └── utils/               # pure helper functions (e.g. date.ts)
e2e/                         # Playwright E2E specs, named after the user flow
```

- Code specific to one feature goes under `src/features/<feature-name>/`. Move code to `src/shared/` only when it is generic and has no knowledge of any feature's models or composables.
- `src/shared/` must never import from `src/features/`.
- Only create the subfolders (`pages/`, `components/`, `composables/`, `models/`) a feature actually needs.
- File naming:
  - Vue components: PascalCase (`TemplateConfigurator.vue`). Pages end with `Page`.
  - Composables: PascalCase with `.composable.ts` suffix (`TemplateConfiguration.composable.ts`), exporting a `use<Name>` function.
  - Models: PascalCase with `.model.ts` suffix (`TemplateConfiguration.model.ts`), one main type per file.
  - Utils: lowercase, named by domain (`date.ts`).
- Imports:
  - Use relative paths within `src/` and include the `.ts` extension for TypeScript files (`'../models/Tone.model.ts'`).
  - Use the `@/` alias for assets (`'@/assets/icons/check.svg?component'`).

## Code style

- Do not add comments to the code (including JSDoc, HTML comments in templates, and CSS comments) unless explicitly asked to. Write self-explanatory code with clear names instead.

## Testing

- Put unit tests next to the file they test, using the same base name with a `.spec.ts` suffix.
  Example: `src/shared/components/TextInput.vue` → `src/shared/components/TextInput.spec.ts`.
- Do not create `__tests__/` directories.
- Structure tests with `describe` and `it`:
  - The `describe` block names what is under test, such as the component (`describe('TextInput', ...)`) or the specific function (`describe('buildTemplate', ...)`). Nest `describe` blocks to scope down to a method or feature when useful.
  - Each `it` block describes one specific test case as behavior, e.g. `it('emits update:modelValue when the user types', ...)`.
- Unit tests run with Vitest (`pnpm test:unit`). E2E tests are separate and live in `e2e/` (Playwright, `pnpm test:e2e`).
