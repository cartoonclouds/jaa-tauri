# Updates Module

Checks for application updates via Tauri updater plugin and alerts users when a newer version exists.

Updated: 2026-05-17.

## What it does

- Calls the configured update server through `@tauri-apps/plugin-updater`.
- Returns structured update-check results.
- Sends a user notification when an update is found.
- Exposes a Vue composable for UI integration.

## Usage

```ts
import { useUpdateChecker } from "@modules/updates";

const { check, isChecking, lastResult } = useUpdateChecker();
await check();
```

## Required Tauri configuration

This module depends on updater plugin configuration in `src-tauri/tauri.conf.json`, including:

- `plugins.updater.pubkey`
- `plugins.updater.endpoints`

Without these values, update checks will return an error from the updater plugin.
