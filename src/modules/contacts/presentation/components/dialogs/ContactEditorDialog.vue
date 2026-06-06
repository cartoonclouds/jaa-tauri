<script setup lang="ts">
  import type { ContactAssociatedCompany } from "@modules/contacts/repositories/ContactRepository";
  import type { ContactCreatePayload } from "@modules/contacts/repositories/ContactRepository";
  import type { ContactUpdatePayload } from "@modules/contacts/repositories/ContactRepository";
  import type { EditableContact } from "@modules/contacts/types/presentation";

  import { useContact } from "@modules/contacts";
  import { Form, type FormSubmitEvent } from "@primevue/forms";
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import { computed, ref, watch } from "vue";
  import { z } from "zod";

  import CreateEditDialog from "@/components/ui/CreateEditDialog.vue";
  import NumberFormField from "@/components/ui/forms/NumberFormField.vue";
  import ReadonlyField from "@/components/ui/forms/ReadonlyField.vue";
  import SelectFormField from "@/components/ui/forms/SelectFormField.vue";
  import TextFormField from "@/components/ui/forms/TextFormField.vue";
  import NotesMarkdownEditor from "@/components/ui/NotesMarkdownEditor.client.vue";
  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
  import { useCreateEditMode } from "@/composables/useCreateEditMode";

  import ContactAssociatedCompaniesSection from "./ContactAssociatedCompaniesSection.vue";

  const props = withDefaults(defineProps<Props>(), {
    busy: false,
    applicationId: null,
    initialCompanyId: null,
  });

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    submit: [payload: ContactEditorSubmitPayload];
    "request-open-company": [companyId: string];
  }>();

  /**
   * Payload emitted by the contact editor dialog.
   */
  export type ContactEditorSubmitPayload =
    | ContactCreatePayload
    | ContactUpdatePayload;

  const ContactEditorSchema = z.object({
    fullName: z.string().trim().min(1, "Contact name is required"),
    type: z.enum(["company", "recruiter"]),
    email: z.string().email("Invalid email address").or(z.literal("")),
    phone: z.string().optional(),
    linkedinUrl: z.string().url("Invalid URL").or(z.literal("")),
    locationText: z.string().optional(),
    locationLat: z.number().nullable(),
    locationLng: z.number().nullable(),
    notes: z.string().optional(),
  });

  /**
   * Defines props.
   */
  interface Props {
    visible: boolean;
    contact: EditableContact | null;
    applicationId?: string | null;
    initialCompanyId?: string | null;
    busy?: boolean;
  }

  const typeOptions = [
    { label: "Company", value: "company" },
    { label: "Recruiter", value: "recruiter" },
  ] as const;

  /**
   * Safely normalizes unknown form values to strings.
   */
  function normalizeString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
  }

  const { service: contactService } = useContact();
  const associatedCompanies = ref<ContactAssociatedCompany[]>([]);
  const isLoadingAssociatedCompanies = ref(false);
  const associatedCompaniesError = ref<string | null>(null);
  const { isEditMode, dialogMode } = useCreateEditMode(() => props.contact);
  const notesMarkdown = ref("");

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  useBodyScrollLock(dialogVisible);

  const initialValues = computed(() => ({
    fullName: props.contact?.fullName ?? "",
    type: props.contact?.type ?? "company",
    email: props.contact?.email ?? "",
    phone: props.contact?.phone ?? "",
    linkedinUrl: props.contact?.linkedinUrl ?? "",
    locationText: props.contact?.locationText ?? "",
    locationLat: props.contact?.locationLat ?? null,
    locationLng: props.contact?.locationLng ?? null,
    notes: props.contact?.notes ?? "",
  }));

  interface FormFieldStateLike {
    value: unknown;
  }

  function isFormSubmitEvent(event: unknown): event is FormSubmitEvent {
    return typeof event === "object" && event !== null && "valid" in event;
  }

  function resolveSubmittedValues(
    event: unknown,
  ): Record<string, unknown> | null {
    if (!isFormSubmitEvent(event)) {
      return null;
    }

    const eventValues = event.values as
      | Record<string, unknown>
      | undefined
      | null;
    if (eventValues) {
      return eventValues;
    }

    const stateEntries = Object.entries(
      event.states as Record<string, FormFieldStateLike>,
    );
    if (stateEntries.length === 0) {
      return null;
    }

    const valuesFromStates: Record<string, unknown> = {};
    for (const [name, state] of stateEntries) {
      valuesFromStates[name] = state.value;
    }

    return valuesFromStates;
  }

  watch(
    () => [props.visible, props.contact?.id],
    async ([visible, contactId]) => {
      if (!visible || typeof contactId !== "string") {
        associatedCompanies.value = [];
        associatedCompaniesError.value = null;
        isLoadingAssociatedCompanies.value = false;
        return;
      }

      isLoadingAssociatedCompanies.value = true;
      associatedCompaniesError.value = null;

      try {
        associatedCompanies.value =
          await contactService.listAssociatedCompanies(contactId);
      } catch (error: unknown) {
        associatedCompanies.value = [];
        const message =
          error instanceof Error ? error.message : "Unknown error";
        associatedCompaniesError.value = `Unable to load associated companies: ${message}`;
      } finally {
        isLoadingAssociatedCompanies.value = false;
      }
    },
    { immediate: true },
  );

  watch(
    () => props.contact,
    (contact) => {
      notesMarkdown.value = contact?.notes ?? "";
    },
    { immediate: true },
  );

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) {
        return;
      }

      notesMarkdown.value = props.contact?.notes ?? "";
    },
  );

  /**
   * Handles on form submit.
   */
  function onFormSubmit(event: unknown): void {
    if (isFormSubmitEvent(event) && !event.valid) {
      return;
    }

    const values = resolveSubmittedValues(event);
    if (!values) {
      return;
    }

    if (props.contact) {
      emit("submit", {
        id: props.contact.id,
        fullName: normalizeString(values.fullName),
        type: values.type as EditableContact["type"],
        email: normalizeString(values.email) || null,
        phone: normalizeString(values.phone) || null,
        linkedinUrl: normalizeString(values.linkedinUrl) || null,
        locationText: normalizeString(values.locationText) || null,
        locationLat: props.contact.locationLat,
        locationLng: props.contact.locationLng,
        notes: notesMarkdown.value.trim() ? notesMarkdown.value : null,
      });
      return;
    }

    emit("submit", {
      companyId: props.initialCompanyId ?? null,
      fullName: normalizeString(values.fullName),
      type: values.type as EditableContact["type"],
      email: normalizeString(values.email) || null,
      phone: normalizeString(values.phone) || null,
      linkedinUrl: normalizeString(values.linkedinUrl) || null,
      locationText: normalizeString(values.locationText) || null,
      locationLat: null,
      locationLng: null,
      notes: notesMarkdown.value.trim() ? notesMarkdown.value : null,
      tagIds: [],
    });
  }
</script>

<template>
  <CreateEditDialog
    v-model:visible="dialogVisible"
    :mode="dialogMode"
    create-title="Create Contact"
    edit-title="Edit Contact"
    create-save-label="Create Contact"
    edit-save-label="Save Changes"
    cancel-label="Cancel"
    :is-saving="busy"
    save-form-id="contact-editor-form"
    class="w-full! max-w-2xl"
  >
    <Form
      id="contact-editor-form"
      v-slot="$form"
      :initial-values="initialValues"
      :resolver="zodResolver(ContactEditorSchema)"
      class="space-y-4"
      @submit="onFormSubmit"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <TextFormField
          label="Name"
          wrapper-class="space-y-1 md:col-span-2"
          name="fullName"
          placeholder="Full name"
          :invalid="$form.fullName?.invalid"
          :error-message="$form.fullName?.error?.message"
        />

        <SelectFormField label="Type" name="type" :options="[...typeOptions]" />

        <TextFormField
          label="Email"
          name="email"
          placeholder="name@example.com"
          :invalid="$form.email?.invalid"
          :error-message="$form.email?.error?.message"
        />

        <TextFormField label="Phone" name="phone" placeholder="Phone number" />

        <TextFormField
          label="LinkedIn"
          name="linkedinUrl"
          placeholder="https://linkedin.com/in/..."
          :invalid="$form.linkedinUrl?.invalid"
          :error-message="$form.linkedinUrl?.error?.message"
        />

        <TextFormField
          label="Location"
          name="locationText"
          placeholder="Location"
          wrapper-class="space-y-1 md:col-span-2"
        />

        <template v-if="isEditMode">
          <ReadonlyField label="Latitude" :value="props.contact?.locationLat" />
          <ReadonlyField
            label="Longitude"
            :value="props.contact?.locationLng"
          />
        </template>

        <template v-else>
          <NumberFormField label="Latitude" name="locationLat" />
          <NumberFormField label="Longitude" name="locationLng" />
        </template>

        <div class="space-y-2 md:col-span-2 border-t border-surface-200 pt-4">
          <h4 class="text-sm font-semibold text-surface-900">Contact Notes</h4>
          <p class="text-xs text-surface-500">Notes are stored as Markdown.</p>

          <NotesMarkdownEditor
            v-model="notesMarkdown"
            editor-style="height: 12rem"
            placeholder="Write contact notes in Markdown..."
          />
        </div>

        <ContactAssociatedCompaniesSection
          :is-edit-mode="isEditMode"
          :associated-companies="associatedCompanies"
          :associated-companies-error="associatedCompaniesError"
          :is-loading-associated-companies="isLoadingAssociatedCompanies"
          @request-open-company="emit('request-open-company', $event)"
        />
      </div>
    </Form>
  </CreateEditDialog>
</template>
