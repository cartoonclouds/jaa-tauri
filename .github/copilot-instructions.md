# Copilot Instructions

You are assisting on a Nuxt 4, Vue 3, TypeScript, Tauri 2 desktop application.

## Always verify current package guidance

Before suggesting architecture, APIs, configuration, or code for any package, check the latest official documentation first. Do not rely only on memory. Prefer official docs, using their latest version, for:

- Nuxt
- Vue
- Tauri
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
- Service classes + repositories + composables
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

When creating new modules or features, follow the existing project structure and conventions. Do not introduce new architectural patterns or directory layouts without a clear justification. Follow the instructions defined in `../prompts/feature.prompt.md` for feature creation.

## Engineering standards

Follow strong software engineering conventions:

- Prefer simple, explicit, maintainable code.
- Use TypeScript strictly.
- Avoid `any` unless there is a documented reason.
- Prefer `unknown` plus narrowing for unsafe input.
- Keep functions small and focused.
- Add concise docblocks to all generated exported functions, classes, interfaces, and type aliases. Keep descriptions intent-focused and avoid noise.
- Use clear names that describe intent.
- Avoid hidden side effects.
- Avoid over-engineering and unnecessary abstraction.
- Follow existing project structure before introducing new patterns.
- Add tests for new business logic, composables, services, utilities, and edge cases.
- Prefer accessibility-first UI.
- For module service factories (`use*Service`), return singleton service instances instead of constructing a new service on every call.

## Nuxt and Vue conventions

- Use Nuxt conventions where possible instead of custom wiring.
- Keep pages thin.
- Put domain logic in modules, shared utilities, composables, or services.
- Prefer composables for reusable reactive logic.
- Use Vue 3 Composition API where it fits Nuxt conventions.
- Avoid direct browser APIs unless guarded for SSR/client context.
- Use `import.meta.client`, `import.meta.server`, or Nuxt lifecycle utilities where appropriate.
- Do not place business rules directly inside components unless trivial.
- For date or date-time picking in forms, use PrimeVue `DatePicker` instead of raw text inputs or `InputText type="datetime-local"`.

## Form management with PrimeVue Forms

Use the PrimeVue Forms library (`@primevue/forms`) for all form implementations. This provides centralized form state management, validation, and error handling integrated seamlessly with PrimeVue components.

**Key patterns:**

1. **Form wrapper** — Use the `<Form>` component with `v-slot="$form"` to manage form state:

   ```vue
   <Form
     v-slot="$form"
     :initialValues="formData"
     :resolver="zodResolver(MySchema)"
     @submit="onSubmit"
   >
     <!-- form fields go here -->
     <Button type="submit" label="Submit" />
   </Form>
   ```

2. **Form fields** — Use the `name` property (not `v-model`) to bind fields to form state:

   ```vue
   <InputText name="username" placeholder="Username" fluid />
   <Message v-if="$form.username?.invalid" severity="error" size="small">
     {{ $form.username.error?.message }}
   </Message>
   ```

3. **Validation** — Use the `resolver` prop with Zod schemas (already in your stack):

   ```ts
   import { zodResolver } from "@primevue/forms/resolvers/zod";
   import { MySchema } from "@shared/domain/zod/my.schema";

   // In component:
   // :resolver="zodResolver(MySchema)"
   ```

4. **Form state tracking** — Access field state via `$form.fieldName`:
   - `$form.fieldName.value` — Current field value
   - `$form.fieldName.invalid` — Validation error state
   - `$form.fieldName.error.message` — Error message from resolver
   - `$form.fieldName.touched` — Whether field has been interacted with
   - `$form.fieldName.dirty` — Whether value has changed

5. **Submit handler** — The `@submit` callback receives form state and values:

   ```ts
   function onFormSubmit(event: FormSubmitEvent) {
     if (!event.valid) return;
     const formData = event.values; // validated, typed data
     // process form data
   }
   ```

6. **Supported PrimeVue components** — All these work natively with Form:
   - Input: `InputText`, `InputNumber`, `Textarea`, `Password`, `DatePicker`
   - Selection: `Select`, `MultiSelect`, `Checkbox`, `RadioButton`, `ToggleSwitch`
   - Advanced: `FileUpload`, `Editor`, `ColorPicker`, `Rating`

**Benefits over v-model binding:**

- Centralized validation with clear error messages
- Unified form state tracking
- Automatic field dependency handling
- Built-in resolver support for Zod, Yup, Joi, Valibot

For forms with custom/non-PrimeVue components, use the optional `<FormField>` wrapper for state management.

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
  applications/
    [id].vue
```

## Feature module barrel guidance

Prefer feature-oriented modules:

```txt
modules/
  applications/
    domain/
    application/
    presentation/
    index.ts
```

Typical `index.ts` exports:

```ts
export * from "./domain/entities/Application";
export * from "./application/actions/CreateApplication";
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

## Validation with Zod

Always use Zod for validating payloads and object structures. This ensures type safety at runtime.

**Zod Schema Location & Naming:**

- Feature/entity schemas live under `src/modules/<feature>/domain/zod/`
- Shared reusable validators remain in `src/shared/domain/zod/fields.ts`
- Export schema with consistent naming: `[Entity]Schema` (and feature-specific variants like `[Entity]FormSchema` when needed)

**Usage Pattern:**

1. **Action Layer** — Validate incoming payloads:

```ts
import { ApplicationSchema } from "@shared/domain/zod/application.schema";

export async function CreateApplication(
  payload: unknown,
): Promise<Application> {
  const result = ApplicationSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  const validated = result.data;
  // Use validated data
}
```

2. **Service Layer** — Use `.pick()` for subsets:

```ts
import { ApplicationSchema } from "@shared/domain/zod/application.schema";

const UpdatePayloadSchema = ApplicationSchema.pick({
  title: true,
  status: true,
});
const result = UpdatePayloadSchema.safeParse(payload);
if (!result.success) throw new Error("Invalid update payload");
```

3. **Repository Layer** — Use `.pick()` for database operations:

```ts
const InsertSchema = ApplicationSchema.omit({ id: true, createdAt: true });
const validated = InsertSchema.parse(data); // throw on failure
```

**Key Rules:**

- Use `safeParse()` + explicit error handling in action/service layers
- Use `.parse()` (throws) only for internal trusted operations
- Use `.pick()` or `.omit()` to validate subsets of payloads
- Never rely on TypeScript interfaces alone for runtime validation
- Avoid manual trim/typeof checks when Zod can enforce schema

## Do and Don't

Do:

- Keep pages and components thin.
- Keep `use*Service` factories singleton-backed (cache one service instance per module factory).
- When needing icons, use a heroicons package and a NuxtIcon component.
- For date or date-time picking in forms, use PrimeVue `DatePicker` rather than raw text/date inputs.
- Put business logic in `src/modules`, composables, stores, or shared utilities.
- Use project aliases (`@`, `@modules`, `@shared`, `@infra`) instead of deep relative imports.
- Add or update tests when changing business logic.
- **Validate all payloads and object structures with Zod** — use feature schemas from `src/modules/<feature>/domain/zod/` and shared primitives from `src/shared/domain/zod/fields.ts`; never rely on TypeScript interfaces alone for runtime validation.
- In mapper functions, when a field is typed as a class-based enum, convert raw values with the enum factory (for example `fromValue`) and return enum instances (or `null`) instead of plain strings.
- Prefer explicit types for public function inputs/outputs. When creating a types file using the following filename convention: `types.d.ts` or `types/index.d.ts`, update the barrel export in the module's `index.ts` file and update any Typescript configuration if necessary.
- Add concise docblocks to generated exported symbols (functions, classes, interfaces, and type aliases).
- When asked to install a Tauri plugin, check the official Tauri documentation for the latest recommended approach. Follow their guidance for installation, configuration, and usage. Ensure that any new Tauri plugin is properly integrated with the existing Tauri setup in `src-tauri` and that it does not introduce conflicts with current dependencies or configurations.
  After any significant code change, run the test suite to ensure nothing is broken. If new functionality is added, write tests to cover it. If existing tests are affected, update them accordingly. Always maintain a green test suite after your changes. Also run `npm run tauri dev` to ensure the Tauri integration is working correctly with your changes.
- **Don't ever use inline imports such as `import("@tauri-apps/plugin-notification")`**. Import required symbols at the top of the file.

Don't:

- Do not place non-trivial business rules directly in page components.
- Do not bypass module boundaries with cross-feature internal imports.
- Do not introduce new top-level architectural patterns without clear justification.
- Do not use `any` when a safer type can be used.
- Do not couple domain/application logic to UI frameworks unless required.
- Do not apply the same `$database` typed import/cast pattern (for example `DatabaseDriver` import plus `as DatabaseDriver`) across every `use*Service` factory and `settings` persistence file. Prefer a single typed source via Nuxt app type augmentation or a shared typed helper.
