# Persistence Architecture

This document defines where data lives and how it flows through the app.

## Overview

The app uses three persistence/state layers:

1. SQLite via Tauri SQL plugin for business entities.
2. Settings persistence in the `settings` table through `src/shared/settings/settings.repository.ts`.
3. Local component/composable state (`ref`, `reactive`, `computed`) for ephemeral UI interaction state.

```txt
Vue Pages/Components
  -> Module Composables
  -> Service Classes
  -> Repository Classes
  -> DatabaseDriver
  -> SQLite

Shared Settings Service
  -> settings.repository.ts
  -> DatabaseDriver
  -> SQLite settings table
```

## Layer Details

### 1) SQLite (Business Data)

Use SQLite for durable domain records and history:

- applications
- companies
- contacts
- events
- tasks/reminders
- documents
- analytics/supporting logs

Access pattern:

- repository classes own SQL and mapping
- service classes own orchestration and use-cases
- pages/components consume composables/services

### 2) Settings Persistence (Preferences)

Use `src/shared/settings` for app preferences:

- theme
- notification settings
- developer mode
- onboarding completion
- table column visibility
- recent searches

Implementation notes:

- `settings.repository.ts` is the typed persistence boundary
- `SettingsService` in `settings.service.ts` is the high-level API
- persistence goes to SQLite through the configured `DatabaseDriver`

### 3) Local UI State (Ephemeral)

Use local composable state for transient UI behavior:

- active tab
- selected row id
- open/closed UI panels
- temporary draft values

Keep this state close to the feature that owns it.

## Decision Matrix

| Data type            | Persistence | Recommended location         | Notes                     |
| -------------------- | ----------- | ---------------------------- | ------------------------- |
| Domain entities      | Durable     | SQLite + repositories        | Source of truth           |
| User settings        | Durable     | `src/shared/settings`        | Small preference payloads |
| UI interaction state | Ephemeral   | local composables/components | Not persisted by default  |

## Adding New Settings

1. Add field to `AppSettings` in `src/shared/settings/types.d.ts`.
2. Add default and mapping logic in `src/shared/settings/settings.repository.ts`.
3. Add specialized getter/setter if needed.
4. Expose through `SettingsService` in `src/shared/settings/settings.service.ts`.
5. Use from feature composables/components.

## Testing Guidance

- Unit-test repository mapping and validation behavior.
- Unit-test `SettingsService` orchestration methods.
- Prefer isolated tests with mocked repository boundaries for service tests.

## References

- https://v2.tauri.app/plugin/sql/
- `src/shared/settings/README.md`
- `src/services/database/DatabaseDriver.ts`
