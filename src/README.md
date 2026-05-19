# src

Nuxt application source.

Updated: 2026-05-19.

## High-level layout

- app.vue: Root app shell.
- pages: Route-level views.
- layouts: Shared page layouts.
- middleware: Route middleware.
- plugins: Nuxt plugins.
- components: Reusable UI components.
- modules: Feature modules (domain entities + application actions).
- shared: Shared domain/ui/utils/types.
- infrastructure: Integrations (HTTP, Tauri, persistence, logging, config).
- server: Server-only handlers and logic.
- services/database: Database driver abstractions and concrete client adapters.
- composables, stores, utils, types, assets: App-level support code.

## State boundaries

- SQLite: persistent business records and timeline data.
- Pinia: ephemeral UI state such as active selection, view mode, and layout.
- Pinia Colada: async query/mutation cache.
- Tauri Store: lightweight user preferences.

## Nuxt Vite Notes

`nuxt.config.ts` defines `vite.optimizeDeps.include` to pre-bundle frequently discovered runtime dependencies (Tauri APIs and Vue devtools packages) and reduce dev-time full page reloads.
