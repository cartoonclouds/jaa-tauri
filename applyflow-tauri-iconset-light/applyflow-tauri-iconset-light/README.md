# ApplyFlow Tauri v2 Icon Set - Light Variant

This package was generated from the supplied **Icon Set 2 – Light** ApplyFlow concept image.

## Contents

- `src-tauri/icons/` desktop icon assets for Tauri bundles:
  - `32x32.png`
  - `128x128.png`
  - `128x128@2x.png`
  - `icon.png`
  - `icon.ico`
  - `icon.icns`
  - additional PNG sizes and Windows Store logo assets
- `src-tauri/gen/android/app/src/main/res/` Android launcher assets
- `src-tauri/gen/apple/Assets.xcassets/AppIcon.appiconset/` iOS app icon assets
- `app-icon-source.png` 1024×1024 source image

## Install

Copy the `src-tauri/` folder contents into your ApplyFlow project, or merge the nested folders manually.

Your Tauri desktop bundle icon list should include:

```json
{
  "bundle": {
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

## Notes

- Desktop PNGs are square RGBA images.
- The Windows `.ico` includes 16, 24, 32, 48, 64, and 256 pixel layers.
- iOS images are flattened against white because iOS app icons must not use transparency.
- For the best production result, consider regenerating from the original 1024×1024 icon artwork rather than a concept-sheet crop.
