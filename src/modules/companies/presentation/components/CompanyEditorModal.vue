<script setup lang="ts">
  import type { Company } from "@modules/companies/domain/entities/Company";
  import type {
    CompanyAssociatedContact,
    CompanyCreatePayload,
    CompanyUpdatePayload,
  } from "@modules/companies/repositories/CompanyRepository";

  import { useCompanyService } from "@modules/companies";
  import { useTagService } from "@modules/tags";
  import TagMultiSelect from "@modules/tags/presentation/components/TagMultiSelect.vue";
  import { resolveTagIdsWithPendingTags } from "@modules/tags/utils/pendingTagResolution";
  import { Form, type FormSubmitEvent } from "@primevue/forms";
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import { computed, ref, watch } from "vue";
  import { z } from "zod";

  const props = withDefaults(defineProps<Props>(), {
    busy: false,
  });

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    submit: [payload: CompanyEditorSubmitPayload];
    "request-open-contact": [contactId: string];
  }>();

  const CompanyEditorFormSchema = z.object({
    name: z.string().trim().min(1, "Company name is required"),
    locationText: z.string().optional(),
    locationLat: z.number().nullable(),
    locationLng: z.number().nullable(),
  });

  /**
   * Payload emitted when a company form is submitted.
   */
  export type CompanyEditorSubmitPayload =
    | CompanyCreatePayload
    | CompanyUpdatePayload;

  /**
   * Defines props.
   */
  interface Props {
    visible: boolean;
    company: Company | null;
    busy?: boolean;
  }

  const tagService = useTagService();
  const companyService = useCompanyService();
  const isResolvingTags = ref(false);
  const selectedTagIds = ref<string[]>([]);
  const pendingTagNames = ref<string[]>([]);
  const associatedContacts = ref<CompanyAssociatedContact[]>([]);
  const isLoadingAssociatedContacts = ref(false);
  const associatedContactsError = ref<string | null>(null);

  const modalVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const isEditMode = computed(() => Boolean(props.company));

  const modalTitle = computed(() =>
    isEditMode.value ? "Edit Company" : "Create Company",
  );

  const initialValues = computed(() => ({
    name: props.company?.name ?? "",
    locationText: props.company?.locationText ?? "",
    locationLat: props.company?.locationLat ?? null,
    locationLng: props.company?.locationLng ?? null,
  }));

  watch(
    () => props.company,
    (company) => {
      selectedTagIds.value = [...(company?.tagIds ?? [])];
      pendingTagNames.value = [];
    },
    { immediate: true },
  );

  watch(
    () => [props.visible, props.company?.id],
    async ([visible, companyId]) => {
      if (!visible || typeof companyId !== "string") {
        associatedContacts.value = [];
        associatedContactsError.value = null;
        isLoadingAssociatedContacts.value = false;
        return;
      }

      isLoadingAssociatedContacts.value = true;
      associatedContactsError.value = null;

      try {
        associatedContacts.value =
          await companyService.listAssociatedContacts(companyId);
      } catch (error: unknown) {
        associatedContacts.value = [];
        const message =
          error instanceof Error ? error.message : "Unknown error";
        associatedContactsError.value = `Unable to load associated contacts: ${message}`;
      } finally {
        isLoadingAssociatedContacts.value = false;
      }
    },
    { immediate: true },
  );

  /**
   * Handles on form submit.
   */
  async function onFormSubmit(event: FormSubmitEvent): Promise<void> {
    if (!event.valid) {
      return;
    }

    const values = event.values as Record<string, unknown> | undefined;
    if (!values) {
      return;
    }

    isResolvingTags.value = true;

    try {
      const formName = values.name;
      const formLocationText = values.locationText;

      if (typeof formName !== "string") {
        return;
      }

      const resolvedTagIds = await resolveTagIdsWithPendingTags({
        selectedTagIds: selectedTagIds.value,
        pendingTagNames: pendingTagNames.value,
        tagService,
      });

      const payloadBase: CompanyCreatePayload = {
        name: formName.trim(),
        locationText:
          typeof formLocationText === "string"
            ? formLocationText.trim() || null
            : null,
        locationLat: isEditMode.value
          ? (props.company?.locationLat ?? null)
          : ((values.locationLat as number | null) ?? null),
        locationLng: isEditMode.value
          ? (props.company?.locationLng ?? null)
          : ((values.locationLng as number | null) ?? null),
        tagIds: resolvedTagIds,
      };

      if (props.company) {
        emit("submit", {
          id: props.company.id,
          ...payloadBase,
        });
        return;
      }

      emit("submit", payloadBase);
    } finally {
      isResolvingTags.value = false;
    }
  }
</script>

<template>
  <Dialog
    v-model:visible="modalVisible"
    modal
    :header="modalTitle"
    class="w-full! max-w-2xl"
  >
    <Form
      v-slot="$form"
      :initial-values="initialValues"
      :resolver="zodResolver(CompanyEditorFormSchema)"
      class="space-y-4"
      @submit="onFormSubmit"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <div class="space-y-1 md:col-span-2">
          <label class="text-sm font-medium text-surface-700">Name</label>
          <InputText
            name="name"
            placeholder="Company name"
            fluid
            :invalid="$form.name?.invalid"
          />
          <Message
            v-if="$form.name?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.name?.error?.message }}
          </Message>
        </div>

        <div class="space-y-1 md:col-span-2">
          <label class="text-sm font-medium text-surface-700">Location</label>
          <InputText name="locationText" placeholder="Location" fluid />
        </div>

        <template v-if="!isEditMode">
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

        <template v-else>
          <div class="space-y-1">
            <label class="text-sm font-medium text-surface-700">Latitude</label>
            <p
              class="rounded-md border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700"
            >
              {{ props.company?.locationLat ?? "-" }}
            </p>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-surface-700"
              >Longitude</label
            >
            <p
              class="rounded-md border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700"
            >
              {{ props.company?.locationLng ?? "-" }}
            </p>
          </div>
        </template>

        <div class="space-y-1 md:col-span-2">
          <label class="text-sm font-medium text-surface-700">Tags</label>
          <TagMultiSelect
            v-model="selectedTagIds"
            v-model:pending-tag-names="pendingTagNames"
            placeholder="Select tags"
            class="w-full"
          />
        </div>

        <div class="space-y-2 md:col-span-2 border-t border-surface-200 pt-4">
          <h4 class="text-sm font-semibold text-surface-900">
            Associated Contacts
          </h4>

          <Message v-if="!isEditMode" severity="info" size="small">
            Associated contacts are available after the company is created.
          </Message>

          <Message
            v-else-if="associatedContactsError"
            severity="error"
            size="small"
          >
            {{ associatedContactsError }}
          </Message>

          <Message
            v-else-if="isLoadingAssociatedContacts"
            severity="info"
            size="small"
          >
            Loading associated contacts...
          </Message>

          <Message
            v-else-if="associatedContacts.length === 0"
            severity="info"
            size="small"
          >
            No contacts are associated with this company yet.
          </Message>

          <div
            v-else
            class="overflow-x-auto rounded-lg border border-surface-200"
          >
            <table class="min-w-full divide-y divide-surface-200 text-sm">
              <thead class="bg-surface-50 text-left text-surface-600">
                <tr>
                  <th class="px-3 py-2 font-medium">Name</th>
                  <th class="px-3 py-2 font-medium">Type</th>
                  <th class="px-3 py-2 font-medium">Email</th>
                  <th class="px-3 py-2 font-medium">Phone</th>
                  <th class="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody
                class="divide-y divide-surface-200 bg-surface-0 text-surface-700"
              >
                <tr v-for="contact in associatedContacts" :key="contact.id">
                  <td class="px-3 py-2">{{ contact.fullName }}</td>
                  <td class="px-3 py-2 capitalize">{{ contact.type }}</td>
                  <td class="px-3 py-2">{{ contact.email || "-" }}</td>
                  <td class="px-3 py-2">{{ contact.phone || "-" }}</td>
                  <td class="px-3 py-2 text-right">
                    <Button
                      type="button"
                      text
                      size="small"
                      aria-label="Open contact"
                      @click="emit('request-open-contact', contact.id)"
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
          @click="modalVisible = false"
        />
        <Button
          type="submit"
          :label="isEditMode ? 'Save Changes' : 'Create Company'"
          :loading="busy || isResolvingTags"
        />
      </div>
    </Form>
  </Dialog>
</template>
