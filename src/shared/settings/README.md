# Settings Module

Lightweight application preferences and settings stored using Tauri's Store plugin.

## Structure

- **types.d.ts**: Type definitions for all settings
- **settings.repository.ts**: Typed persistence layer wrapping Tauri Store
- **settings.service.ts**: High-level service API for settings operations
- **settings.store.ts**: Optional Pinia store for reactive UI bindings

## Usage

### Initialize (in app.vue or plugin)

```typescript
import { initializeSettingsStore } from "@shared/settings";

// Call once at app startup
await initializeSettingsStore();
```

### Using the Service Layer

```typescript
import { useSettingsService } from "@shared/settings";

const settingsService = useSettingsService();

// Get all settings
const allSettings = await settingsService.fetchSettings();

// Update specific setting
await settingsService.updateSetting("theme", "dark");

// Use sub-services
await settingsService.themeService.set({ theme: "dark" });
const theme = await settingsService.themeService.get();
```

### Using the Pinia Store (for Reactive UI)

```vue
<script setup lang="ts">
  import { useSettingsStore } from "@shared/settings";

  const settings = useSettingsStore();
  await settings.initialize();
</script>

<template>
  <div>
    <p>Current theme: {{ settings.theme }}</p>
    <button @click="settings.updateTheme('dark')">Dark Mode</button>
  </div>
</template>
```

## What Goes Here

✅ **Use Tauri Store for:**

- User preferences (theme, layout)
- Window state (size, position)
- UI visibility preferences (sidebar collapse, table columns)
- Notification settings
- Developer mode flag
- Recent searches

❌ **DO NOT use for:**

- Job applications
- Company data
- Search results
- Large datasets
- Any business logic data

## Architecture Pattern

```
Tauri Store (settings.repository)
    ↓ (typed API)
Settings Service (settings.service)
    ↓ (for UI binding)
Settings Store (Pinia) [optional]
    ↓
Vue Components
```

For simple preferences without reactive updates, use the service directly. For UI bindings, use the Pinia store which reactively syncs with Tauri Store.

## Key Benefits

- **Type-safe**: Fully typed settings interface
- **Lightweight**: Uses Tauri's native Store plugin
- **Persistent**: Automatically saved to `settings.json`
- **Reactive**: Optional Pinia integration for Vue reactivity
- **Extensible**: Easy to add new settings
