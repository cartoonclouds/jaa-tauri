TODO:

- Stats card

- Applications
  \*\* Progress - stages
- Given url fetch image to represent company

- Search

Application schema

- Description
- Interview process - what stage
- Benefits
- Location (Add googlemaps to show pins of applied. colour based of stage)

---

Create a Mermaid diagram of how each elements of this app interaction. Add to the toplevel README.md. Then Update all readme files with latest changes.

https://v2.tauri.app/develop/updating-dependencies/

Install and configure the Tauri plugin `@hypothesi/tauri-mcp-server`

`tauri-apps/plugins-workspace`

Review all files and make sure they follow the already established conventions/standards. Also add to these files docblocks.

Add the ability to open a specific contact and allow editing in a modal. Add a link to this modal in applications.

Add the ability to open a specific company and allow editing in a modal. Add a link to this modal in applications.

When clicking on date input, some of the popup shown is being hidden behind the main window. Make sure this is alway on top and fully visible.

Incorporate all constants module code into settings.

Disable all browser hotkeys if ran in production mode.

Add a menu item for companies and contacts in the native window menu to open their respective pages. When editing, show a section of jobs applied for. Don't show this if the modal is opened from the applications drawer.

Capture any app wide errors and log them.

Move any modals, cards, drawers, etc. into their own respective module's directories
