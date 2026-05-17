# Job Application Auditor

Job Application Auditor is a desktop application for recording, organizing, and tracking job applications across the full recruitment lifecycle. The goal is to keep one structured place for each application, including company and role details, status changes, and progress through recruitment phases such as application review, screening, interviews, technical rounds, offers, and follow-up actions.

The project is built as a Nuxt 4 application running inside a Tauri 2 desktop shell. The frontend uses Vue 3 and TypeScript, while Tauri provides desktop capabilities such as dialogs, file-system access, logging, SQL storage (using SQLite migrations, a typed database driver abstraction, repositories, services), native shell integration, and a system tray.

## What the application is for

This codebase is intended to support workflows such as:

- storing job applications and their metadata
- tracking each application through recruitment stages
- capturing details about companies, roles, locations, salary ranges, and notes
- notifying the user about important events or actions
- supporting desktop-oriented capabilities such as local storage and native integrations

At the moment, the repository already includes feature modules and infrastructure for:

- customer-related domain structure
- desktop notifications
- application update checks
- Tauri-backed desktop integrations

## Core stack

- Nuxt 4 for the application framework and routing
- Vue 3 for the UI layer
- TypeScript for strict typing across app, tests, and tooling
- Tauri 2 for the desktop runtime and native capabilities
- Pinia and Pinia Colada for state and async data management
- PrimeVue, Nuxt UI utilities, and Tailwind CSS 4 for UI composition
- Vitest and Vue Test Utils for testing

## Development commands

Install dependencies:

```bash
npm install
```

Run the Nuxt development server:

```bash
npm run dev
```

Run the Tauri desktop app in development:

```bash
npm run tauri dev
```

Build the frontend:

```bash
npm run build
```

Preview the built frontend:

```bash
npm run preview
```

Lint the repository:

```bash
npm run lint
```

Run type checks:

```bash
npm run typecheck
```

Run tests:

```bash
npm run test:run
```

Generate coverage:

```bash
npm run test:coverage
```

## Project structure

Top-level areas you will work in most often:

- `src/`: Nuxt application source
- `src/modules/`: feature-oriented modules and business logic
- `src/infrastructure/`: adapters for config, Tauri APIs, persistence, logging, and HTTP
- `src/shared/`: shared domain, types, UI helpers, and utilities
- `src-tauri/`: Rust-side desktop runtime and Tauri configuration
- `tests/`: unit, component, integration, mocks, and fixtures

Architecture notes by area:

- [src/README.md](src/README.md)
- [src/modules/README.md](src/modules/README.md)
- [src/modules/customers/README.md](src/modules/customers/README.md)
- [src/shared/README.md](src/shared/README.md)
- [src/infrastructure/README.md](src/infrastructure/README.md)
- [src/server/README.md](src/server/README.md)
- [src/pages/README.md](src/pages/README.md)
- [src/components/ui/README.md](src/components/ui/README.md)
- [tests/README.md](tests/README.md)
- [tests/unit/README.md](tests/unit/README.md)

## Nuxt modules in use

The application enables the following Nuxt modules in `nuxt.config.ts`:

| Module                  | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| `@pinia/nuxt`           | Registers Pinia in Nuxt for application stores.                      |
| `@pinia/colada-nuxt`    | Integrates Pinia Colada for query and async state workflows.         |
| `@vueuse/nuxt`          | Auto-imports VueUse composables for reactive utilities.              |
| `@nuxt/icon`            | Provides Icon component support.                                     |
| `@nuxt/hints`           | Adds Nuxt hints and diagnostics during development.                  |
| `nuxt-security`         | Adds security-related headers and protections for Nuxt applications. |
| `@nuxtjs/device`        | Exposes device detection helpers such as `$device`.                  |
| `@primevue/nuxt-module` | Registers PrimeVue components and configuration.                     |
| `@vee-validate/nuxt`    | Integrates vee-validate into the Nuxt app.                           |

Additional frontend configuration:

- Tailwind CSS 4 is connected through Vite with `@tailwindcss/vite`.
- PrimeIcons is loaded globally for icon fonts.
- Typed pages are enabled through Nuxt experimental support.

## NPM packages

### Runtime dependencies

| Package                           | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `@nuxt/hints`                     | Nuxt development hints and diagnostics.         |
| `@nuxt/icon`                      | Icon component support for Nuxt.                |
| `@nuxtjs/device`                  | Device detection in the Nuxt app.               |
| `@pinia/colada`                   | Query-style async state and caching utilities.  |
| `@pinia/colada-nuxt`              | Nuxt integration for Pinia Colada.              |
| `@pinia/nuxt`                     | Nuxt integration for Pinia stores.              |
| `@primeuix/themes`                | Theme primitives used by PrimeVue.              |
| `@primevue/nuxt-module`           | PrimeVue integration for Nuxt.                  |
| `@tailwindcss/vite`               | Tailwind CSS integration through Vite.          |
| `@tauri-apps/api`                 | JavaScript-side Tauri API access.               |
| `@tauri-apps/plugin-dialog`       | Tauri dialog APIs from the frontend.            |
| `@tauri-apps/plugin-fs`           | Tauri file-system APIs from the frontend.       |
| `@tauri-apps/plugin-log`          | Tauri logging APIs from the frontend.           |
| `@tauri-apps/plugin-notification` | Native desktop notifications from the frontend. |
| `@tauri-apps/plugin-opener`       | Open files and URLs through the host system.    |
| `@tauri-apps/plugin-shell`        | Execute shell-related operations through Tauri. |
| `@tauri-apps/plugin-sql`          | Access SQL databases through Tauri.             |
| `@tauri-apps/plugin-store`        | Persist structured local key-value state.       |
| `@tauri-apps/plugin-updater`      | Query and apply application updates.            |
| `@vee-validate/nuxt`              | Nuxt integration for form validation.           |
| `@vee-validate/zod`               | Zod adapter for vee-validate schemas.           |
| `@vueuse/core`                    | Vue composables and utility functions.          |
| `@vueuse/nuxt`                    | Nuxt integration for VueUse.                    |
| `nuxt`                            | Application framework.                          |
| `nuxt-security`                   | Security module for Nuxt.                       |
| `pinia`                           | State management for Vue and Nuxt.              |
| `primeicons`                      | Prime icon font set.                            |
| `primevue`                        | UI component library.                           |
| `tailwindcss`                     | Utility-first CSS framework.                    |
| `vee-validate`                    | Form validation library.                        |
| `vue`                             | UI runtime.                                     |
| `zod`                             | Schema validation and parsing library.          |

### Development dependencies

| Package                            | Purpose                                             |
| ---------------------------------- | --------------------------------------------------- |
| `@eslint/js`                       | Base ESLint JavaScript rules.                       |
| `@iconify-json/heroicons`          | Heroicons icon set data for icon rendering.         |
| `@nuxt/test-utils`                 | Nuxt testing helpers.                               |
| `@tauri-apps/cli`                  | Tauri CLI for local development and builds.         |
| `@types/node`                      | Node.js type definitions.                           |
| `@typescript-eslint/eslint-plugin` | TypeScript-specific ESLint rules.                   |
| `@typescript-eslint/parser`        | TypeScript parser for ESLint.                       |
| `@vitest/coverage-v8`              | Coverage reporting for Vitest.                      |
| `@vitest/ui`                       | Browser UI for Vitest runs.                         |
| `@vue/test-utils`                  | Vue component testing utilities.                    |
| `eslint`                           | Linting engine.                                     |
| `eslint-config-prettier`           | Disables conflicting formatting rules in ESLint.    |
| `eslint-plugin-boundaries`         | Enforces architectural import boundaries.           |
| `eslint-plugin-perfectionist`      | Sorting and consistency lint rules.                 |
| `eslint-plugin-vue`                | Vue-specific lint rules.                            |
| `globals`                          | Shared global variable definitions for lint config. |
| `happy-dom`                        | DOM environment for tests.                          |
| `prettier`                         | Code formatter.                                     |
| `typescript`                       | TypeScript compiler.                                |
| `typescript-eslint`                | TypeScript ESLint flat-config utilities.            |
| `vite`                             | Frontend bundler and dev server.                    |
| `vitest`                           | Test runner.                                        |
| `vue-eslint-parser`                | Vue single-file component parser for ESLint.        |
| `vue-tsc`                          | Vue-aware TypeScript type checking.                 |

## Tauri extensions and native capabilities

### Tauri plugins currently initialized in Rust

The desktop runtime currently wires these plugins in `src-tauri/src/lib.rs`:

| Plugin                | Purpose                          |
| --------------------- | -------------------------------- |
| `tauri-plugin-store`  | Local structured storage.        |
| `tauri-plugin-dialog` | Native dialogs.                  |
| `tauri-plugin-fs`     | File-system access.              |
| `tauri-plugin-log`    | Native-side logging.             |
| `tauri-plugin-opener` | Opening files and external URLs. |
| `tauri-plugin-shell`  | Shell integration.               |
| `tauri-plugin-sql`    | SQL database access.             |

### Tauri plugins declared in Rust dependencies

The Rust manifest also includes:

| Plugin                 | Status                                                                  | Purpose                      |
| ---------------------- | ----------------------------------------------------------------------- | ---------------------------- |
| `tauri-plugin-updater` | Declared in Cargo, not currently initialized in `src-tauri/src/lib.rs`. | Application update delivery. |

### Tauri plugins installed on the frontend

The JavaScript package list includes:

| Package                           | Status                                                                                      | Purpose                  |
| --------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| `@tauri-apps/plugin-dialog`       | Installed and initialized.                                                                  | Dialog APIs.             |
| `@tauri-apps/plugin-fs`           | Installed and initialized.                                                                  | File-system APIs.        |
| `@tauri-apps/plugin-log`          | Installed and initialized.                                                                  | Logging APIs.            |
| `@tauri-apps/plugin-notification` | Installed for frontend use.                                                                 | Native notifications.    |
| `@tauri-apps/plugin-opener`       | Installed and initialized.                                                                  | Open files and URLs.     |
| `@tauri-apps/plugin-shell`        | Installed and initialized.                                                                  | Shell integration.       |
| `@tauri-apps/plugin-sql`          | Installed and initialized.                                                                  | SQL access.              |
| `@tauri-apps/plugin-store`        | Installed and initialized.                                                                  | Local key-value storage. |
| `@tauri-apps/plugin-updater`      | Installed on the frontend; Rust-side plugin setup is still needed for full runtime support. | App updates.             |

### Other Tauri app behavior

The native shell currently adds:

- a system tray icon with Show and Quit actions
- hide-on-close behavior instead of exiting immediately
- desktop bundle targets configured through `src-tauri/tauri.conf.json`

## Current feature modules

| Module          | Purpose                                                              |
| --------------- | -------------------------------------------------------------------- |
| `customers`     | Placeholder customer-focused domain and application structure.       |
| `notifications` | Notification entities, service layer, use cases, and Vue composable. |
| `updates`       | Update checking use cases and presentation composables.              |

## Notes on current status

- The repository is already positioned as a job application tracking desktop app, but parts of the implementation still look like scaffold or demo code.
- Notification and update-related frontend modules exist, though their Tauri runtime setup is not fully symmetrical yet.
- The root README previously described the starter template only; this document is intended to be the actual project entry point.

## Recommended local tooling

- VS Code
- Vue - Official extension
- Tauri VS Code extension
- rust-analyzer
