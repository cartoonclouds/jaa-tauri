# Apply-Flow Tauri Iconset — Dark

Ready to copy into `src-tauri/icons/`.

Primary Tauri desktop files:

- `icon.png`
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.ico`
- `icon.icns`

Additional platform folders are included for Linux, Windows PNG previews, Android launcher/adaptive icons, and iOS AppIcon assets.

Recommended integration:

1. Back up your current `src-tauri/icons/`.
2. Copy the contents of this folder into `src-tauri/icons/`.
3. In your project, run `npm run tauri dev` and confirm the icon appears correctly.
4. For best production fidelity, you can regenerate from `source-1024-dark.png` with:
   `npm run tauri icon src-tauri/icons/source-1024-dark.png`
