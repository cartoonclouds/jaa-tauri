# src

Nuxt application source.

Updated: 2026-05-18.

## High-level layout

- app.vue: Root app shell.
- pages: Route-level views.
- layouts: Shared page layouts.
- middleware: Route middleware.
- plugins: Nuxt plugins.
- components: Reusable UI components.
- modules: Feature modules (domain + application + presentation).
- modules/projects: Project feature module (queries, repositories, services, stores).
- shared: Shared domain/ui/utils/types.
- infrastructure: Integrations (HTTP, Tauri, persistence, logging, config).
- server: Server-only handlers and logic.
- services/database: Database driver abstractions and concrete client adapters.
- composables, stores, utils, types, assets: App-level support code.
