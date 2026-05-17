# Copilot Instructions

You are assisting on a Nuxt 4, Vue 3, TypeScript, Tauri 2 desktop application.

## Always verify current package guidance

Before suggesting architecture, APIs, configuration, or code for any package, check the latest official documentation first. Do not rely only on memory. Prefer official docs, using their latest version, for:

- Nuxt
- Vue
- Tauri
- Pinia / Pinia Colada
- VueUse
- Nuxt UI
- PrimeVue
- vee-validate
- Zod
- Vitest
- TypeScript
- Vite

When package guidance conflicts with existing code, explain the trade-off and recommend the most current documented approach.

## Project stack

This project uses:

- Nuxt with `srcDir: 'src/'`
- Vue 3
- TypeScript
- Tauri 2
- Pinia
- Pinia Colada
- VueUse
- Nuxt UI
- PrimeVue
- vee-validate + Zod
- Vitest with `happy-dom`
- DDD-style aliases:
  - `@/*` → `src/*`
  - `@modules/*` → `src/modules/*`
  - `@shared/*` → `src/shared/*`
  - `@infra/*` → `src/infrastructure/*`

Respect the configured aliases and source layout. The current package list, aliases, and Tauri setup are reflected in the uploaded project files. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}

## Engineering standards

Follow strong software engineering conventions:

- Prefer simple, explicit, maintainable code.
- Use TypeScript strictly.
- Avoid `any` unless there is a documented reason.
- Prefer `unknown` plus narrowing for unsafe input.
- Keep functions small and focused.
- Use clear names that describe intent.
- Avoid hidden side effects.
- Avoid over-engineering and unnecessary abstraction.
- Follow existing project structure before introducing new patterns.
- Add tests for new business logic, composables, stores, utilities, and edge cases.
- Prefer accessibility-first UI.

## Nuxt and Vue conventions

- Use Nuxt conventions where possible instead of custom wiring.
- Keep pages thin.
- Put domain logic in modules, shared utilities, stores, or services.
- Prefer composables for reusable reactive logic.
- Use Vue 3 Composition API where it fits Nuxt conventions.
- Avoid direct browser APIs unless guarded for SSR/client context.
- Use `import.meta.client`, `import.meta.server`, or Nuxt lifecycle utilities where appropriate.
- Do not place business rules directly inside components unless trivial.

## Project directory structure

Use this project shape when creating or suggesting files:

```txt
my-desktop-app/
  src/
    app.vue
    pages/
    layouts/
    middleware/
    plugins/
    components/
      ui/
    modules/
    shared/
      domain/
      ui/
      utils/
      types/
    infrastructure/
      http/
      tauri/
      persistence/
      logging/
      config/
    server/
    composables/
    stores/
    types/
    utils/
    assets/

  src-tauri/
  tests/
  public/
  package.json
  tsconfig.json
  nuxt.config.ts
```

## Nuxt pages guidance

Keep Nuxt pages thin and delegate feature logic to modules and composables.

Example:

```txt
pages/
  customers/
    [id].vue
```

## Feature module barrel guidance

Prefer feature-oriented modules:

```txt
modules/
  customers/
    domain/
    application/
    presentation/
    index.ts
```

Typical `index.ts` exports:

```ts
export * from "./domain/entities/Customer";
export * from "./application/use-cases/CreateCustomer";
```

## Test structure guidance

Use this test layout:

```txt
tests/
  unit/
    shared/
    modules/
    infrastructure/
  component/
  integration/
  fixtures/
  mocks/
  setup.ts
```

## Do and Don't

Do:

- Keep pages and components thin.
- Put business logic in `src/modules`, composables, stores, or shared utilities.
- Use project aliases (`@`, `@modules`, `@shared`, `@infra`) instead of deep relative imports.
- Add or update tests when changing business logic.
- Prefer explicit types for public function inputs/outputs.

Don't:

- Do not place non-trivial business rules directly in page components.
- Do not bypass module boundaries with cross-feature internal imports.
- Do not introduce new top-level architectural patterns without clear justification.
- Do not use `any` when a safer type can be used.
- Do not couple domain/application logic to UI frameworks unless required.
