# Copilot Prompt: DDD Feature Module with CRUD

Create a new feature module in the DDD architecture for a Nuxt 4 + Tauri 2 desktop app.

- Use the project’s structure and aliases (`@modules`, `@shared`, etc.).
- The feature should be named `<FeatureName>` (replace with the actual feature).
- Generate boilerplate for CRUD actions (Create, Read, Update, Delete) in a repository.
- Use service classes/repositories for data access and composables for UI state.
- Generate `use*Service` factories as singleton-backed helpers (do not create a new service instance on each call).
- Create Zod schemas in `src/modules/<feature>/domain/zod/` and reuse shared validators from `src/shared/domain/zod/fields.ts` when applicable.
- Validate all API inputs and outputs with Zod.
- Add concise docblocks to generated exported functions, classes, interfaces, and type aliases.
- Include:
  - Domain entity and type definition
  - Application actions for each CRUD action
  - Presentation layer (composables, minimal page/component)
  - Service or repository for infrastructure/data access
  - Zod schemas for validation
  - Barrel file (`index.ts`) for the module
- Use TypeScript strictly, no `any`.
- For date or date-time picking in forms, use PrimeVue `DatePicker` instead of raw text inputs or `InputText type="datetime-local"`.
- For forms, use PrimeVue Forms (`@primevue/forms`) with `<Form v-slot="$form">` and `name`-based fields, and in submit handlers consume `event.values` (not `event.value`).
- Add minimal test stubs in `tests/unit/modules/<feature>/`.
- Follow the conventions in `copilot-instructions.md`.
- Update boundary files like `nuxt.config.ts` and module `index.ts` as needed for imports/exports to enforce DDD boundaries and best practices.

---

## Example output structure

```
src/
  modules/
    <feature>/
      domain/
        entities/
          <Feature>.ts
        types/
          <Feature>Type.ts
        zod/
          <feature>.schema.ts
      presentation/
        use<Feature>.ts
        <feature>Page.vue
      index.ts
  infrastructure/
    <feature>Repository.ts
tests/
  unit/
    modules/
      <feature>/
        <feature>.spec.ts
```

---

Replace `<FeatureName>` and `<feature>` with your actual feature name. This prompt will guide Copilot to generate a DDD-aligned, CRUD-ready feature module.

Also use the CoPilot instructions in `copilot-instructions.md` to ensure the generated code follows the project’s conventions and best practices.
