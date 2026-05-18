# tests

Test suites organized by scope.

Updated: 2026-05-18.

## Folders

- unit: Fast isolated tests.
- component: Component-level rendering and behavior tests.
- integration: Cross-layer tests.
- fixtures: Reusable test data.
- mocks: Test doubles.
- setup.ts: Shared test setup.

Workspace settings run ESLint fixes and organize imports on save to keep test files consistent with lint rules.

## Test Data

Deterministic table factories are available in `src-tauri/factories` and can be used
to build repeatable datasets for integration and component tests.
