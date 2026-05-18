# Updates Module

Checks for application updates via Tauri updater plugin and supports downloading/installing a discovered update.

Updated: 2026-05-17.

## What it does

- Calls the configured update server through `@tauri-apps/plugin-updater`.
- Returns structured update-check results.
- Sends a user notification when an update is found.
- Supports install workflow through `update.downloadAndInstall()`.
- Exposes a Vue composable for UI integration.

The module follows the documented updater flow from Tauri v2 docs:

1. Call `check()` to discover an available update.
2. If present, call `downloadAndInstall()` on the returned update instance.
3. Restart can be deferred; immediate relaunch is optional.

## Usage

```ts
import { useUpdateChecker } from "@modules/updates";

const { check, install, isChecking, lastResult } = useUpdateChecker();
await check();

if (lastResult.value?.hasUpdate) {
  await install();
}
```

## Required Tauri configuration

This module depends on updater plugin configuration in `src-tauri/tauri.conf.json`, including:

- `bundle.createUpdaterArtifacts`
- `plugins.updater.pubkey`
- `plugins.updater.endpoints`

The Rust runtime must initialize the updater plugin with
`tauri_plugin_updater::Builder::new().build()`.

Without these values, update checks will return an error from the updater plugin.
