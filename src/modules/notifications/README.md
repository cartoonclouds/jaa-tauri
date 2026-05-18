# Notifications Module

Desktop notification system for the Nuxt/Tauri application using Tauri's notification plugin.

Updated: 2026-05-18.

## Overview

This module provides a DDD-structured notification system with:

- **Domain Layer**: Core notification entities and types
- **Application Layer**: Notification service and use cases
- **Presentation Layer**: Vue composable for components
- **Infrastructure Layer**: Tauri integration

## Usage

### In Vue Components

Use the `useNotification()` composable:

```vue
<script setup lang="ts">
  import { useNotification } from "@modules/notifications";

  const { success, error, warning, info, isSupported } = useNotification();

  async function handleSave() {
    try {
      // ... save logic
      await success("Saved!", "Your changes have been saved");
    } catch (err) {
      await error("Save Failed", "Could not save your changes");
    }
  }
</script>
```

### Quick Methods

The composable provides convenience methods:

- `info(title, body)` - Information notification
- `success(title, body)` - Success notification
- `warning(title, body)` - Warning notification
- `error(title, body)` - Error notification
- `send(request)` - Custom notification with full control

### Checking Support

Always check if notifications are supported before showing UI:

```ts
const { isSupported } = useNotification();

if (isSupported.value) {
  // Show notification UI
}
```

### Custom Notifications

Send custom notifications with all options:

```ts
import { sendNotification } from "@modules/notifications";

const result = await sendNotification({
  title: "Custom Title",
  body: "Notification body",
  icon: "/icons/app.png",
  badge: "/icons/badge.png",
  tag: "unique-id",
  sound: "/sounds/notification.mp3",
});
```

## Service Initialization

The notification service is automatically initialized on first `useNotification()` call. If you need manual control:

```ts
import { NotificationService } from "@modules/notifications";

const service = NotificationService.getInstance();
await service.initialize();

if (service.isSupported()) {
  // Send notifications
  await service.sendSuccess("Title", "Body");
}
```

## Permissions

This module follows the official Tauri notification flow:

1. Check `isPermissionGranted()`.
2. Request permission with `requestPermission()` when needed.
3. Only call `sendNotification()` when permission is `"granted"`.

If permission is denied, send calls return `{ success: false, error: "Notification permission not granted" }`.

The Rust runtime now initializes `tauri-plugin-notification`, and capability permissions include `notification:default`.

### Windows toast popup behavior

On Windows, the native popup banner (toast) is only reliable for installed apps.
When running with `npm run tauri dev`, notifications may appear only in Notification Center
because the process is treated as a development executable.

To validate real popup behavior:

- Build and install the app (`npm run tauri build`, then install the generated MSI/EXE).
- Open Windows notification settings for the installed app and ensure **Show notification banners** is enabled.
- Ensure Focus Assist / Do Not Disturb is not suppressing banners.

## API Reference

### Types

- `Notification` - Core notification interface
- `NotificationRequest` - Request object for creating notifications
- `NotificationResult` - Result of sending a notification
- `RichNotification` - Notification with severity and metadata
- `NotificationSeverity` - Enum: INFO, SUCCESS, WARNING, ERROR

### Composable

- `useNotification()` - Returns notification utilities and reactive states

### Service

- `NotificationService.getInstance()` - Get service instance
- `initialize()` - Initialize and check support
- `isSupported()` - Check if supported
- `send(request)` - Send custom notification
- `sendInfo/Success/Warning/Error(title, body)` - Send typed notifications

## Testing

The module can be tested by mocking `@tauri-apps/plugin-notification`:

```ts
import { vi } from "vitest";

vi.mock("@tauri-apps/plugin-notification", () => ({
  sendNotification: vi.fn(),
  isPermissionGranted: vi.fn(() => Promise.resolve(true)),
  requestPermission: vi.fn(),
}));
```

## Browser Compatibility

Notifications require:

- Tauri environment (desktop only)
- Runtime permission from user
- Notification support in the platform

Returns graceful fallbacks if unavailable.
