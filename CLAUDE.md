# CLAUDE.md

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
