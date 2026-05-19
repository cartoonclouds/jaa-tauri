# unit tests

Unit tests by architecture area.

Updated: 2026-05-19.

## Folders

- shared
- infrastructure
- modules

Keep tests deterministic and side-effect free.

When using generated fixtures, prefer seeded factory helpers to avoid brittle random failures.

Feature unit tests should target active app paths under `src`.
