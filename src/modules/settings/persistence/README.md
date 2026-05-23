# Settings Module

Lightweight application preferences and settings stored in the app database.

Updated: 2026-05-23.

## System Architecture Reference

See the [system architecture diagram](../../../README.md#system-architecture-overview) for how settings and preferences interact with other app layers.

## Structure

- **types.d.ts**: Type definitions for all settings
- **settings.repository.ts**: Typed persistence layer wrapping the configured database driver
- **settings.service.ts**: Class-based service API for settings operations

## Usage

### Initialize (in app.vue or plugin)

```typescript
import { initializeSettingsStore } from "@modules/settings/persistence";

// Call once at app startup
await initializeSettingsStore();
```

### Using the Service Layer

```typescript
import { useSettingsService } from "@modules/settings/persistence";

const settingsService = useSettingsService();

// Get all settings
const allSettings = await settingsService.fetchSettings();

// Update specific setting
await settingsService.updateSetting("theme", "dark");

// Use sub-services
await settingsService.themeService.set({ theme: "dark" });
const theme = await settingsService.themeService.get();
```

## What Goes Here

âœ… **Use settings persistence for:**

- User preferences (theme, layout)
- UI visibility preferences (sidebar collapse, table columns)
- Notification settings
- Developer mode flag
- Recent searches
- Lightweight persisted UI state (for example selected tab or split-pane size)

Current implementation persists settings in the `settings` database table via `DatabaseDriver`.

Window state (size and position) is managed by `@tauri-apps/plugin-window-state`.

âŒ **DO NOT use for:**

- Job applications
- Company data
- Search results
- Large datasets
- Any business logic data

## Architecture Pattern

```
Database (settings.repository)
    â†“ (typed API)
Settings Service (settings.service)
    â†“
Vue Components
```

Use the service directly from components and composables. Add local `ref`/`computed` state at the component layer when reactive bindings are needed.

## Key Benefits

- **Type-safe**: Fully typed settings interface
- **Persistent**: Saved in the local app database
- **Framework-agnostic**: No store framework dependency
- **Extensible**: Easy to add new settings
