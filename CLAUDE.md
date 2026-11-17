# CLAUDE.md

## Testing

- Put unit tests next to the file they test, using the same base name with a `.spec.ts` suffix.
  Example: `src/shared/components/TextInput.vue` → `src/shared/components/TextInput.spec.ts`.
- Do not create `__tests__/` directories.
- Unit tests run with Vitest (`pnpm test:unit`). E2E tests are separate and live in `e2e/` (Playwright, `pnpm test:e2e`).
