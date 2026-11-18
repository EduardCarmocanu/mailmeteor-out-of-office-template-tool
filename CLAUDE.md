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
│       ├── pages/           # top-level page components (`<Name>.page.vue`)
│       ├── components/      # components used only by this feature
│       ├── composables/     # feature state and logic (`<Name>.composable.ts`)
│       ├── infrastructure/  # access to anything outside the app (`<Name>.ts`)
│       └── models/          # types and interfaces (`<Name>.model.ts`)
└── shared/
    ├── components/          # generic, feature-agnostic UI components
    ├── composables/         # generic, feature-agnostic composables
    └── infrastructure/      # generic access to the outside world (e.g. ClipboardClient.ts)
e2e/                         # Playwright E2E specs, named after the user flow
```

- Code specific to one feature goes under `src/features/<feature-name>/`. Move code to `src/shared/` only when it is generic and has no knowledge of any feature's models or composables.
- `src/shared/` must never import from `src/features/`.
- Only create the subfolders (`pages/`, `components/`, `composables/`, `infrastructure/`, `models/`) a feature actually needs.
- File naming:
  - Vue components: PascalCase (`TemplateConfigurator.vue`).
  - Pages: PascalCase with `.page.vue` suffix (`EmailTemplate.page.vue`).
  - Composables: PascalCase with `.composable.ts` suffix (`TemplateConfiguration.composable.ts`), exporting a `use<Name>` function.
  - Models: PascalCase with `.model.ts` suffix (`TemplateConfiguration.model.ts`), one main type per file.
  - Infrastructure: PascalCase, named after what the file does (`ClipboardClient.ts`, `AnalyticsService.ts`, `DraftStore.ts`, `ApiConfiguration.ts`). No suffix is required; pick the one that best describes its role (Client, Service, Store, Configuration, ...).
- Imports:
  - Use relative paths within `src/` and include the `.ts` extension for TypeScript files (`'../models/Tone.model.ts'`).
  - Use the `@/` alias for assets (`'@/assets/icons/check.svg?component'`).

## Layering

Code is split into three layers, and each layer only calls the one directly below it:

```
View components (pages/, components/)
        ↓
Composables (composables/)
        ↓
Infrastructure (infrastructure/)
        ↓
Outside world (HTTP APIs, storage, browser APIs, ...)
```

- View components (pages and components) call composables for state, logic and side effects. They never call infrastructure or anything outside the app directly.
- Composables hold state and logic and call infrastructure when they need anything outside the app. They do not import view components.
- Infrastructure is any code that leaves the application: HTTP clients, `fetch`, persistent stores such as `localStorage`, `sessionStorage` or IndexedDB, and browser services such as `navigator.clipboard`, `window.location` or notifications. Infrastructure exposes small, typed functions and contains no Vue reactivity or UI logic.
- Models can be used by any layer.
- In unit tests, mock infrastructure when testing composables, and mock composables when a component test needs to isolate the view.

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
