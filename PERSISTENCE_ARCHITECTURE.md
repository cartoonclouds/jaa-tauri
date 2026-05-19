# Persistence Architecture

This document outlines how data is stored and managed across the application.

## Overview

The application uses a layered persistence architecture that separates concerns and optimizes each layer for its purpose:

```
┌─────────────────────────────────────────────────────────┐
│                    Vue Components                        │
└──────────────────┬──────────────────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
     ▼             ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────────┐
│  Pinia  │  │  Pinia   │  │ Settings     │
│ (UI     │  │ Colada   │  │ Service      │
│ State)  │  │ (Cache)  │  │ (Prefs)      │
└────┬────┘  └────┬─────┘  └──────┬───────┘
     │            │               │
     ├─ Reactive  ├─ Async Caching┼─ Direct Access
     │  Updates   │  & Mutations  │
     │            │               │
     └────────────┼───────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
     ▼                         ▼
┌──────────────┐        ┌──────────────┐
│   SQLite     │        │ Tauri Store  │
│ (Business    │        │ (Lightweight │
│  Data)       │        │  Prefs)      │
└──────────────┘        └──────────────┘
     │                         │
     ├─ Job Applications       ├─ Theme
     ├─ Companies             ├─ Window State
     ├─ Projects              ├─ Sidebar State
     ├─ Tasks                 ├─ Notification Prefs
     ├─ Activity Logs         ├─ Dev Mode Flag
     └─ Large Datasets        └─ Recent Searches
```

## Layer Details

### 1. SQLite - Application Data

**Purpose**: Persistent storage of all business logic and real application data.

**What goes here:**

- Job applications and their metadata
- Company details
- Tasks
- Activity logs and history
- Search indexes
- Large datasets
- Any domain entity

**Technology**: Tauri SQL plugin with SQLite
**Persistence**: Automatic, file-based database
**Access**: Through repositories and services
**Location**: `src/services/database` and `src/infrastructure/persistence`

**Example:**

```typescript
export class ProjectRepository {
  async getAll(): Promise<Project[]> {
    return await this.db.select("SELECT * FROM projects");
  }
}
```

### 2. Tauri Store - Lightweight Preferences

**Purpose**: User preferences and app settings that don't belong in SQLite.

**What goes here:**

- Theme (light/dark/auto)
- Window size and position
- UI layout preferences (sidebar collapse, column visibility)
- Notification settings
- Developer mode flag
- Recent searches (limited list)
- Table sort/filter preferences

**Technology**: @tauri-apps/plugin-store
**Persistence**: JSON file (`settings.json`)
**Access**: Through typed repository and service wrappers
**Location**: `src/shared/settings`

**Example:**

```typescript
import { useSettingsService } from "@shared/settings";

const service = useSettingsService();
await service.updateTheme("dark");
```

### 3. Pinia - UI State

**Purpose**: Reactive state for the current UI session, not persisted to disk.

**What goes here:**

- Currently selected project ID
- Sidebar visibility toggle state
- Current filter selections
- Form draft state
- Modal open/close state
- Temporary UI mode toggles

**Technology**: Pinia store (Vue reactivity)
**Persistence**: None (session-only)
**Re-initialization**: Empty on app restart
**Location**: `src/stores` and `src/composables`

**Example:**

```typescript
export const useProjectUiStore = defineStore("project-ui", () => {
  const selectedProjectId = ref<string | null>(null);
  return { selectedProjectId };
});
```

### 4. Pinia Colada - Query Cache

**Purpose**: Caching and synchronization of async query results and mutations.

**What goes here:**

- Query results (projects, applications, search results)
- Mutation state
- Loading/error states
- Automatic cache invalidation

**Technology**: @pinia/colada
**Persistence**: None (cache-only, refetches on demand)
**Invalidation**: Automatic on mutations
**Location**: `src/composables` and `src/services`

**Example:**

```typescript
export const useProjectsQuery = defineQuery(() => ({
  key: ["projects"],
  query: () => service.listProjects(),
}));
```

## Decision Matrix

When adding new state, use this matrix:

| Data Type        | Persists        | Reactive                  | Speed  | Storage      |
| ---------------- | --------------- | ------------------------- | ------ | ------------ |
| Business data    | ✅ SQLite       | UI update via query cache | Medium | Unlimited    |
| User prefs       | ✅ Tauri Store  | Optional Pinia binding    | Fast   | Small JSON   |
| UI session state | ❌ Pinia        | ✅ Immediate              | Fast   | Memory       |
| Query results    | ❌ Pinia Colada | ✅ Cached                 | Fast   | Memory cache |

### Examples for Each Category

**SQLite:**

```typescript
// ✅ Correct
const applications = await appRepo.findAll();

// ❌ Incorrect
const appsPinia = defineStore("apps", () => {
  const applications = ref([]);
  localStorage.setItem("apps", JSON.stringify(applications));
});
```

**Tauri Store:**

```typescript
// ✅ Correct
await setThemeSettings({ theme: "dark" });

// ❌ Incorrect
const useThemeStore = defineStore("theme", () => {
  const theme = ref("auto");
  localStorage.setItem("theme", theme);
});
```

**Pinia (UI State):**

```typescript
// ✅ Correct
export const useFilterStore = defineStore("filters", () => {
  const selectedCategory = ref<string>("all");
  return { selectedCategory };
});

// ❌ Incorrect
export const useFilterStore = defineStore("filters", () => {
  const selectedCategory = ref<string>("all");
  localStorage.setItem("filter", selectedCategory); // Don't persist!
});
```

**Pinia Colada (Queries):**

```typescript
// ✅ Correct
export const useProjectsQuery = defineQuery(() => ({
  key: ["projects"],
  query: () => service.listProjects(),
}));

// ❌ Incorrect
const useProjectsStore = defineStore("projects", () => {
  const projects = ref([]);
  // Don't manually manage query state
});
```

## Settings Module Architecture

The settings module (`src/shared/settings`) provides a complete example of the recommended pattern:

```
settings.repository.ts    ← Low-level Tauri Store API with types
    ↓ (typed methods)
settings.service.ts       ← High-level service API
    ↓ (optional)
settings.store.ts         ← Pinia store for reactive UI binding
    ↓ (optional)
Vue Components            ← Use service or store
```

### Usage Patterns

**Direct service (recommended for most cases):**

```typescript
const service = useSettingsService();
await service.updateTheme("dark");
```

**Pinia store (for reactive UI):**

```vue
<script setup>
  const settings = useSettingsStore();
</script>
<template>
  <p>{{ settings.theme }}</p>
  <button @click="settings.updateTheme('dark')">Dark</button>
</template>
```

**Repository (for advanced cases):**

```typescript
import { setSetting } from "@shared/settings/settings.repository";
await setSetting("theme", "dark");
```

## Migration Guide

### Moving Data Between Layers

**From Pinia persistence to SQLite:**

1. Design schema in SQL migration
2. Create repository and service
3. Update Pinia store to use service (remove persistence)
4. Migrate user data via onboarding or import tool

**From Pinia to Tauri Store:**

1. Add setting to `AppSettings` type
2. Add repository methods
3. Create service wrappers
4. Update Pinia store to sync (optional)

## Testing

### Testing Repository Layer

```typescript
describe("settings.repository", () => {
  it("should persist and retrieve settings", async () => {
    await initializeSettingsStore();
    await setSetting("theme", "dark");
    const theme = await getSetting("theme");
    expect(theme).toBe("dark");
  });
});
```

### Testing Service Layer

```typescript
describe("settingsService", () => {
  it("should update theme through service", async () => {
    const service = useSettingsService();
    await service.updateTheme("dark");
    const settings = await service.fetchSettings();
    expect(settings.theme).toBe("dark");
  });
});
```

### Testing Pinia Store

```typescript
describe("useSettingsStore", () => {
  it("should react to theme changes", async () => {
    const store = useSettingsStore();
    await store.initialize();
    expect(store.theme).toBe("auto");

    await store.updateTheme("dark");
    expect(store.theme).toBe("dark");
  });
});
```

## Performance Considerations

1. **SQLite**: Use indexes on frequently queried columns
2. **Tauri Store**: Keep to small settings (< 1MB)
3. **Pinia**: Reasonable for typical UI state
4. **Pinia Colada**: Automatic pagination recommended for large result sets

## References

- [Tauri Store Plugin](https://v2.tauri.app/plugin/store/)
- [Tauri SQL Plugin](https://v2.tauri.app/plugin/sql/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Pinia Colada Docs](https://pinia-colada.esm.is/)
