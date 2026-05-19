# unit tests

Unit tests by architecture area.

Updated: 2026-05-18.

## Folders

- shared
- infrastructure

Keep tests deterministic and side-effect free.

When using generated fixtures, prefer seeded factory helpers to avoid brittle random failures.

Feature unit tests should target active app paths under `src`.
