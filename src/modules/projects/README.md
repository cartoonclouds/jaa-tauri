# projects module

Project management feature module.

Updated: 2026-05-18.

## Structure

- queries: Pinia Colada query and mutation composables.
- repositories: Database repository and row mappers.
- services: Domain-facing application service and Nuxt bridge.
- stores: UI-only project state.
- types.ts: Shared project input and entity types for this module.
- index.ts: Public exports for external consumers.

## Notes

- Keep database access behind repository and service boundaries.
- Keep route/page components thin and consume queries/stores from this module.
- Use `src-tauri/factories/projects.factory.ts` and `src-tauri/factories/tasks.factory.ts`
  when generating deterministic mock project data for tests/dev.
