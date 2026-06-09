# tests

Test suites organized by scope.

Updated: 2026-05-23.

## System Architecture Reference

For a high-level overview of the app's layers and flows, see the [system architecture diagram](../README.md#system-architecture-overview) in the root README.

## Folders

- unit: Fast isolated tests.
- component: Component-level rendering and behavior tests.
- integration: Cross-layer tests.
- fixtures: Reusable test data.
- fixtures/factories: Reusable factories to generate objects.
- mocks: Test doubles.
- setup.ts: Shared test setup.

Workspace settings run ESLint fixes and organize imports on save to keep test files consistent with lint rules.

## Test Data

Deterministic table factories are available in `src-tauri/factories` and can be used
to build repeatable datasets for integration and component tests.
