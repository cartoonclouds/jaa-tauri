TODO:

-

- Create a feature/domain using a datatable to list all job application, use pagination (https://primevue.org/paginator/) and https://primevue.org/datatable/

- Stats card

- Applications
  \*\* Progress - stages
- Given url fetch image to represent business

- Search

Application schema

- Description
- Interview process - what stage
- Benefits
- Salary range
- Location (Add googlemaps to show pins of applied. colour based of stage)
- Attendance type: hybrid, on-site, remote
- Enviroment type - part-time, contract, internship, full-time, volunteer
-

Create a feature/module which will display all interactions a job finder has had with regards to a job application. Use https://primevue.org/tree/. Allow each entry to be editable on double-click (in a modal). The depths can be of any length

Make sure all modules use the repository pattern, if it doesn't exist create them and update references to use them. Create an interface for the repositories.

When validating payloads or object structure, use Zod.

Add the implementation of the InMemoryDriver for use as a database

Rename and update any uses of presentation composables without the suffix "curd". For example, not `useApplicationCrud` but instead `useApplication`

---

Update all readme files with latest changes

Create a Mermaid diagram of how each elements of this app interaction. Add to the toplevel README.md

https://v2.tauri.app/develop/updating-dependencies/

Install and configure the Tauri plugin `@hypothesi/tauri-mcp-server`

`tauri-apps/plugins-workspace`

**Should be in its own module**

Add the Tauri plugin https://v2.tauri.app/plugin/logging/ and update the configuration and any references which would use this.

Create a splashscreen following the documentation in the docs https://v2.tauri.app/learn/splashscreen/. Use the images located in `\src\assets\images\splash`

Recreate this same icon as an
