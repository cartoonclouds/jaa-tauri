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

  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

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
  const isEditMode = computed(() => Boolean(props.contact));

  const dialogTitle = computed(() =>
    isEditMode.value ? "Edit Contact" : "Create Contact",
  );

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

  /**
   * Handles on form submit.
   */
  function onFormSubmit(event: FormSubmitEvent): void {
    if (!event.valid) {
      return;
    }

    const values = event.values as Record<string, unknown> | undefined;
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
        notes: normalizeString(values.notes) || null,
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
      notes: normalizeString(values.notes) || null,
      tagIds: [],
    });
  }
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="dialogTitle"
    class="w-full! max-w-2xl"
  >
    <Form
      v-slot="$form"
      :initial-values="initialValues"
      :resolver="zodResolver(ContactEditorSchema)"
      class="space-y-4"
      @submit="onFormSubmit"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <div class="space-y-1 md:col-span-2">
          <label class="text-sm font-medium text-surface-700">Name</label>
          <InputText
            name="fullName"
            placeholder="Full name"
            fluid
            :invalid="$form.fullName?.invalid"
          />
          <Message
            v-if="$form.fullName?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.fullName?.error?.message }}
          </Message>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Type</label>
          <Select
            name="type"
            :options="[...typeOptions]"
            option-label="label"
            option-value="value"
            fluid
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Email</label>
          <InputText
            name="email"
            placeholder="name@example.com"
            fluid
            :invalid="$form.email?.invalid"
          />
          <Message
            v-if="$form.email?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.email?.error?.message }}
          </Message>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Phone</label>
          <InputText name="phone" placeholder="Phone number" fluid />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">LinkedIn</label>
          <InputText
            name="linkedinUrl"
            placeholder="https://linkedin.com/in/..."
            fluid
            :invalid="$form.linkedinUrl?.invalid"
          />
          <Message
            v-if="$form.linkedinUrl?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.linkedinUrl?.error?.message }}
          </Message>
        </div>

        <div class="space-y-1 md:col-span-2">
          <label class="text-sm font-medium text-surface-700">Location</label>
          <InputText name="locationText" placeholder="Location" fluid />
        </div>

        <template v-if="isEditMode">
          <div class="space-y-1">
            <label class="text-sm font-medium text-surface-700">Latitude</label>
            <p
              class="rounded-md border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700"
            >
              {{ props.contact?.locationLat ?? "-" }}
            </p>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-surface-700"
              >Longitude</label
            >
            <p
              class="rounded-md border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700"
            >
              {{ props.contact?.locationLng ?? "-" }}
            </p>
          </div>
        </template>

        <template v-else>
          <div class="space-y-1">
            <label class="text-sm font-medium text-surface-700">Latitude</label>
            <InputNumber
              name="locationLat"
              :min-fraction-digits="0"
              :max-fraction-digits="8"
              fluid
            />
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-surface-700"
              >Longitude</label
            >
            <InputNumber
              name="locationLng"
              :min-fraction-digits="0"
              :max-fraction-digits="8"
              fluid
            />
          </div>
        </template>

        <div class="space-y-1 md:col-span-2">
          <label class="text-sm font-medium text-surface-700">Notes</label>
          <Textarea name="notes" rows="4" auto-resize fluid />
        </div>

        <div class="space-y-2 md:col-span-2 border-t border-surface-200 pt-4">
          <h4 class="text-sm font-semibold text-surface-900">
            Associated Companies
          </h4>

          <Message v-if="!isEditMode" severity="info" size="small">
            Associated companies are available after the contact is created.
          </Message>

          <Message
            v-else-if="associatedCompaniesError"
            severity="error"
            size="small"
          >
            {{ associatedCompaniesError }}
          </Message>

          <Message
            v-else-if="isLoadingAssociatedCompanies"
            severity="info"
            size="small"
          >
            Loading associated companies...
          </Message>

          <Message
            v-else-if="associatedCompanies.length === 0"
            severity="info"
            size="small"
          >
            No companies are associated with this contact.
          </Message>

          <div
            v-else
            class="overflow-x-auto rounded-lg border border-surface-200"
          >
            <table class="min-w-full divide-y divide-surface-200 text-sm">
              <thead class="bg-surface-50 text-left text-surface-600">
                <tr>
                  <th class="px-3 py-2 font-medium">Name</th>
                  <th class="px-3 py-2 font-medium">Industry</th>
                  <th class="px-3 py-2 font-medium">Website</th>
                  <th class="px-3 py-2 font-medium">Location</th>
                  <th class="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody
                class="divide-y divide-surface-200 bg-surface-0 text-surface-700"
              >
                <tr v-for="company in associatedCompanies" :key="company.id">
                  <td class="px-3 py-2">{{ company.name }}</td>
                  <td class="px-3 py-2">{{ company.industry || "-" }}</td>
                  <td class="px-3 py-2">
                    <a
                      v-if="company.websiteUrl"
                      :href="company.websiteUrl"
                      target="_blank"
                      rel="noreferrer"
                      class="text-primary-600 hover:underline"
                    >
                      {{ company.websiteUrl }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td class="px-3 py-2">{{ company.locationText || "-" }}</td>
                  <td class="px-3 py-2 text-right">
                    <Button
                      type="button"
                      text
                      size="small"
                      aria-label="Open company"
                      @click="emit('request-open-company', company.id)"
                    >
                      <Icon
                        name="heroicons:arrow-top-right-on-square"
                        class="h-4 w-4"
                      />
                      <span>Open</span>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-surface-200 pt-4">
        <Button
          type="button"
          severity="secondary"
          text
          label="Cancel"
          @click="dialogVisible = false"
        />
        <Button type="submit" label="Save Changes" :loading="busy" />
      </div>
    </Form>
  </Dialog>
</template>
