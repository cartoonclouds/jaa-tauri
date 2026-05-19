# shared

Cross-feature shared code.

Updated: 2026-05-18.

## Folders

- **domain**: Shared business primitives.
- **ui**: Shared presentational components.
- **utils**: Pure utility helpers.
- **types**: Shared TypeScript types.
- **settings**: Lightweight app preferences (theme and UI settings) using Tauri Store.

## Architecture Pattern

This layer implements a clear separation between different types of state:

### SQLite (Application Data)

Real business data stored in SQLite database:

- Job applications
- Company entities
- Tasks
- Applications, contacts, and timeline events
- Reminders and linked documents
- Activity logs
- Search indexes

### Pinia (UI State)

Reactive UI state for immediate user interactions:

- Selected application/project ID
- Sidebar visibility
- Form drafts
- Current filter selections
- UI mode toggles

### Pinia Colada (Query Cache)

Query results and mutations with automatic caching:

- Fetched applications
- Project lists
- Search results
- API responses

### Tauri Store (Preferences)

Lightweight user preferences stored outside SQLite:

- Theme preference (light/dark/auto)
- UI layout preferences (sidebar collapse, column visibility)
- Notification settings
- Developer mode flag
- Recent searches

Window size and position are managed by `@tauri-apps/plugin-window-state` initialized in the Rust runtime.

## Example: Adding New Preferences

To add a new setting:

1. Add to `AppSettings` interface in `settings/types.d.ts`
2. Add default value in `settings/settings.repository.ts`
3. Add getter/setter methods in repository if specialized access needed
4. Expose via `settings.service.ts`
5. Use from components via service or Pinia store

Keep this layer framework-light when possible.
