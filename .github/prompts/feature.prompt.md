# Copilot Prompt: DDD Feature Module with CRUD

Create a new feature module in the DDD architecture for a Nuxt 4 + Tauri 2 desktop app.

- Use the project’s structure and aliases (`@modules`, `@shared`, etc.).
- The feature should be named `<FeatureName>` (replace with the actual feature).
- Generate boilerplate for CRUD actions (Create, Read, Update, Delete).
- Use Pinia for state management and a service/repository pattern for data access.
- Use Pinia Colada for async actions and state management.
- Create Zod schemas for validation in the service layer.
- Validate all API inputs and outputs with Zod.
- Include:
  - Domain entity and type definition
  - Application actions for each CRUD action
  - Presentation layer (composables, minimal page/component)
  - Store (Pinia) for state management
  - Service or repository for infrastructure/data access
  - Zod schemas for validation
  - Barrel file (`index.ts`) for the module
- Use TypeScript strictly, no `any`.
- Add minimal test stubs in `tests/unit/modules/<feature>/`.
- Follow the conventions in copilot-instructions.md.
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
      application/
        actions/
          Create<Feature>.ts
          Get<Feature>.ts
          Update<Feature>.ts
          Delete<Feature>.ts
      presentation/
        use<Feature>.ts
        <feature>Page.vue
      index.ts
  infrastructure/
    <feature>Repository.ts
  stores/
    use<Feature>Store.ts
tests/
  unit/
    modules/
      <feature>/
        <feature>.spec.ts
```

---

Replace `<FeatureName>` and `<feature>` with your actual feature name. This prompt will guide Copilot to generate a DDD-aligned, CRUD-ready feature module.
