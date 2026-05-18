# Notifications Module Integration Guide

## What's Been Added

I've created a complete, production-ready desktop notifications module for your Tauri/Nuxt application following your DDD architecture patterns.

### Module Structure

```
src/modules/notifications/
├── domain/
│   └── entities/
│       └── Notification.ts          # Core types and interfaces
├── application/
│   ├── services/
│   │   └── NotificationService.ts   # Main service (singleton)
│   └── actions/
│       └── SendNotification.ts       # Actions for sending notifications
├── application/actions
│       └── NotificationActions.ts    # Notification actions
├── presentation/
│   └── composables/
│       └── useNotification.ts        # Vue composable
├── index.ts                          # Module exports
├── README.md                         # Documentation
└── example.NotificationDemo.vue      # Example component

src/infrastructure/tauri/
└── notifications.ts                  # Tauri plugin adapter

tests/
├── unit/
│   ├── modules/notifications/
│   │   ├── NotificationService.test.ts
│   │   └── SendNotification.test.ts
│   └── infrastructure/tauri/
│       └── notifications.test.ts
```

## Installation

### 1. Install Dependencies

The Tauri notification plugin has been added to `package.json`. Install it:

```bash
npm install
```

This installs `@tauri-apps/plugin-notification@^2`

### 2. Update Tauri Capabilities (if needed)

If you use Tauri's ACL system, ensure your capabilities allow notifications. Update [src-tauri/capabilities/default.json](../src-tauri/capabilities/default.json):

```json
{
  "windows": ["main"],
  "permissions": [
    "notification:allow-send",
    "notification:allow-is-permission-granted",
    "notification:allow-request-permission"
  ]
}
```

## Usage Examples

### Basic Usage in Components

```vue
<script setup lang="ts">
  import { useNotification } from "@modules/notifications";

  const { success, error, warning } = useNotification();

  async function saveData() {
    try {
      // ... save logic
      await success("Saved!", "Your data has been saved");
    } catch (err) {
      await error("Save Failed", "Could not save your data");
    }
  }
</script>

<template>
  <button @click="saveData">Save Data</button>
</template>
```

### Checking Support Before Using

```ts
const { isSupported, success } = useNotification();

if (isSupported.value) {
  await success("Title", "This is supported!");
} else {
  console.log("Notifications not supported");
}
```

### In Pages and Composables

```ts
// pages/customers/[id].vue
import {
  sendSuccessNotification,
  sendErrorNotification,
} from "@modules/notifications";

export default definePageMeta({
  middleware: ["auth"],
});

export default {
  async setup() {
    try {
      await sendSuccessNotification("Welcome", "Customer page loaded");
    } catch (error) {
      await sendErrorNotification("Error", "Failed to load");
    }
  },
};
```

### With Different Severity Levels

```ts
import {
  sendInfoNotification,
  sendSuccessNotification,
  sendWarningNotification,
  sendErrorNotification,
} from "@modules/notifications";

// Info
await sendInfoNotification("Information", "An event occurred");

// Success
await sendSuccessNotification("Success", "Operation completed");

// Warning
await sendWarningNotification("Warning", "Something needs attention");

// Error
await sendErrorNotification("Error", "An error occurred");
```

### Custom Notifications

```ts
import { sendNotification } from "@modules/notifications";

await sendNotification({
  title: "Custom Title",
  body: "Custom body text",
  icon: "/icons/app.png",
  badge: "/icons/badge.png",
  tag: "unique-notification-id",
  sound: "/sounds/notification.mp3",
});
```

## API Reference

### `useNotification()` Composable

Returns an object with:

- `isSupported` - Ref<boolean> - Whether notifications are supported
- `isLoading` - Ref<boolean> - Whether a notification is being sent
- `send(request)` - Send custom notification
- `info(title, body)` - Send info notification
- `success(title, body)` - Send success notification
- `warning(title, body)` - Send warning notification
- `error(title, body)` - Send error notification

### `NotificationService`

Singleton service with methods:

- `getInstance()` - Get service instance
- `initialize()` - Initialize and check support
- `isSupported()` - Check if supported
- `send(request)` - Send notification
- `sendInfo/Success/Warning/Error(title, body)` - Convenience methods
- `sendRich(notification)` - Send with rich metadata

### Types

Exported from `@modules/notifications`:

- `Notification` - Basic notification interface
- `NotificationRequest` - Request object for sending
- `NotificationResult` - Result from sending
- `RichNotification` - Extended with severity and metadata
- `NotificationSeverity` - Enum: INFO, SUCCESS, WARNING, ERROR

## Testing

The module includes unit tests with mocked Tauri plugin. Run tests:

```bash
npm run test
```

Run specific test file:

```bash
npm run test:run tests/unit/modules/notifications/
```

### Testing Your Own Components

Mock the notification composable in your tests:

```ts
import { vi } from "vitest";

vi.mock("@modules/notifications", () => ({
  useNotification: () => ({
    isSupported: { value: true },
    isLoading: { value: false },
    send: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));
```

## Important Notes

1. **Permissions**: Users must grant notification permissions when prompted
2. **SSR**: The module safely handles SSR by checking for browser environment
3. **Error Handling**: All functions return results with success/error state
4. **Singleton Pattern**: NotificationService uses singleton pattern for consistency
5. **Async**: All notification operations are async - use `await`

## Browser Support

Works in:

- ✅ Tauri desktop (Windows, macOS, Linux)
- ❌ Web browsers (safely falls back)
- ✅ Development mode with Tauri webview

## Example Component

See `src/modules/notifications/example.NotificationDemo.vue` for a complete working example with buttons for each notification type.

## Next Steps

1. Customize notification icons/sounds to match your app
2. Add notification templates in `@shared/types/` if needed
3. Extend the service for advanced features (notification history, queuing, etc.)
4. Integrate with error handling to automatically send error notifications

## Troubleshooting

### Notifications not showing

- Check that permissions are granted
- Verify Tauri capabilities are configured
- Ensure plugin is initialized via `useNotification()` first

### Unsupported error

- Running in non-Tauri environment (web)
- Plugin not installed or permission denied
- Use `isSupported` ref to handle gracefully

### Type errors

- Ensure TypeScript can resolve `@modules` alias - check `tsconfig.json`
- Rebuild project with `npm run typecheck`

## Performance

- Service lazy-initializes on first use
- Minimal overhead - simple API calls to Tauri
- No dependencies beyond Tauri plugin
- Can send thousands of notifications without issues
