<script setup lang="ts">
  import type { Company } from "@modules/companies/domain/entities/Company";
  import type {
    CompanyAssociatedApplication,
    CompanyAssociatedContact,
    CompanyCreatePayload,
    CompanyUpdatePayload,
  } from "@modules/companies/types";

  import { useCompany } from "@modules/companies";
  import { useTag } from "@modules/tags";
  import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
  import TagMultiSelect from "@modules/tags/presentation/components/TagMultiSelect.vue";
  import { resolveTagIdsWithPendingTags } from "@modules/tags/utils/pendingTagResolution";
  import { Form, type FormSubmitEvent } from "@primevue/forms";
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import { computed, ref, watch } from "vue";
  import { z } from "zod";

  import CreateEditDialog from "@/components/ui/CreateEditDialog.vue";
  import NumberFormField from "@/components/ui/forms/NumberFormField.vue";
  import ReadonlyField from "@/components/ui/forms/ReadonlyField.vue";
  import TextFormField from "@/components/ui/forms/TextFormField.vue";
  import NotesMarkdownEditor from "@/components/ui/NotesMarkdownEditor.client.vue";
  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
  import { useCreateEditMode } from "@/composables/useCreateEditMode";

  import CompanyAssociatedContactsSection from "./CompanyAssociatedContactsSection.vue";
  import CompanyJobsAppliedSection from "./CompanyJobsAppliedSection.vue";

  const props = withDefaults(defineProps<Props>(), {
    busy: false,
    showJobsAppliedForSection: true,
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
    showJobsAppliedForSection?: boolean;
  }

  const { service: tagService } = useTag();
  const { service: companyService } = useCompany();
  const isResolvingTags = ref(false);
  const selectedTagIds = ref<string[]>([]);
  const pendingTagNames = ref<string[]>([]);
  const associatedContacts = ref<CompanyAssociatedContact[]>([]);
  const associatedApplications = ref<CompanyAssociatedApplication[]>([]);
  const isLoadingAssociatedContacts = ref(false);
  const associatedContactsError = ref<string | null>(null);
  const isLoadingAssociatedApplications = ref(false);
  const associatedApplicationsError = ref<string | null>(null);
  const notesMarkdown = ref("");

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  useBodyScrollLock(dialogVisible);

  const { isEditMode, dialogMode } = useCreateEditMode(() => props.company);

  const initialValues = computed(() => ({
    name: props.company?.name ?? "",
    locationText: props.company?.locationText ?? "",
    locationLat: props.company?.locationLat ?? null,
    locationLng: props.company?.locationLng ?? null,
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
    () => props.company,
    (company) => {
      selectedTagIds.value = [...(company?.tagIds ?? [])];
      pendingTagNames.value = [];
      notesMarkdown.value = company?.notes ?? "";
    },
    { immediate: true },
  );

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) {
        return;
      }

      notesMarkdown.value = props.company?.notes ?? "";
    },
  );

  watch(
    () => [props.visible, props.company?.id, props.showJobsAppliedForSection],
    async ([visible, companyId, showJobsAppliedForSection]) => {
      if (!visible || typeof companyId !== "string") {
        associatedContacts.value = [];
        associatedApplications.value = [];
        associatedContactsError.value = null;
        associatedApplicationsError.value = null;
        isLoadingAssociatedContacts.value = false;
        isLoadingAssociatedApplications.value = false;
        return;
      }

      isLoadingAssociatedContacts.value = true;
      isLoadingAssociatedApplications.value = Boolean(
        showJobsAppliedForSection,
      );
      associatedContactsError.value = null;
      associatedApplicationsError.value = null;

      try {
        const contactsPromise =
          companyService.listAssociatedContacts(companyId);
        const applicationsPromise = showJobsAppliedForSection
          ? companyService.listAssociatedApplications(companyId)
          : Promise.resolve<CompanyAssociatedApplication[]>([]);

        const [contactsResult, applicationsResult] = await Promise.allSettled([
          contactsPromise,
          applicationsPromise,
        ]);

        if (contactsResult.status === "fulfilled") {
          associatedContacts.value = contactsResult.value;
        } else {
          associatedContacts.value = [];
          const message =
            contactsResult.reason instanceof Error
              ? contactsResult.reason.message
              : "Unknown error";
          associatedContactsError.value = `Unable to load associated contacts: ${message}`;
        }

        if (showJobsAppliedForSection) {
          if (applicationsResult.status === "fulfilled") {
            associatedApplications.value = applicationsResult.value;
          } else {
            associatedApplications.value = [];
            const message =
              applicationsResult.reason instanceof Error
                ? applicationsResult.reason.message
                : "Unknown error";
            associatedApplicationsError.value = `Unable to load jobs applied for: ${message}`;
          }
        } else {
          associatedApplications.value = [];
        }
      } finally {
        isLoadingAssociatedContacts.value = false;
        isLoadingAssociatedApplications.value = false;
      }
    },
    { immediate: true },
  );

  /**
   * Handles on form submit.
   */
  async function onFormSubmit(event: unknown): Promise<void> {
    if (isFormSubmitEvent(event) && !event.valid) {
      return;
    }

    const values = resolveSubmittedValues(event);
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
        modelType: TagModelType.Company,
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
        notes: notesMarkdown.value.trim() ? notesMarkdown.value : null,
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
  <CreateEditDialog
    v-model:visible="dialogVisible"
    :mode="dialogMode"
    create-title="Create Company"
    edit-title="Edit Company"
    create-save-label="Create Company"
    edit-save-label="Save Changes"
    cancel-label="Cancel"
    :is-saving="busy || isResolvingTags"
    save-form-id="company-editor-form"
    class="w-full! max-w-2xl"
  >
    <Form
      id="company-editor-form"
      v-slot="$form"
      :initial-values="initialValues"
      :resolver="zodResolver(CompanyEditorFormSchema)"
      class="space-y-4"
      @submit="onFormSubmit"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <TextFormField
          label="Name"
          name="name"
          placeholder="Company name"
          wrapper-class="space-y-1 md:col-span-2"
          :invalid="$form.name?.invalid"
          :error-message="$form.name?.error?.message"
        />

        <TextFormField
          label="Location"
          name="locationText"
          placeholder="Location"
          wrapper-class="space-y-1 md:col-span-2"
        />

        <template v-if="!isEditMode">
          <NumberFormField label="Latitude" name="locationLat" />
          <NumberFormField label="Longitude" name="locationLng" />
        </template>

        <template v-else>
          <ReadonlyField label="Latitude" :value="props.company?.locationLat" />
          <ReadonlyField
            label="Longitude"
            :value="props.company?.locationLng"
          />
        </template>

        <div class="space-y-1 md:col-span-2">
          <label class="text-sm font-medium text-surface-700">Tags</label>
          <TagMultiSelect
            v-model="selectedTagIds"
            v-model:pending-tag-names="pendingTagNames"
            placeholder="Select tags"
            :tag-model-type="TagModelType.Company"
            class="w-full"
          />
        </div>

        <div class="space-y-2 md:col-span-2 border-t border-surface-200 pt-4">
          <h4 class="text-sm font-semibold text-surface-900">Company Notes</h4>
          <p class="text-xs text-surface-500">Notes are stored as Markdown.</p>

          <NotesMarkdownEditor
            v-model="notesMarkdown"
            editor-style="height: 12rem"
            placeholder="Write company notes in Markdown..."
          />
        </div>

        <CompanyAssociatedContactsSection
          :is-edit-mode="isEditMode"
          :associated-contacts="associatedContacts"
          :associated-contacts-error="associatedContactsError"
          :is-loading-associated-contacts="isLoadingAssociatedContacts"
          @request-open-contact="emit('request-open-contact', $event)"
        />

        <CompanyJobsAppliedSection
          :is-edit-mode="isEditMode"
          :show-jobs-applied-for-section="showJobsAppliedForSection"
          :associated-applications="associatedApplications"
          :associated-applications-error="associatedApplicationsError"
          :is-loading-associated-applications="isLoadingAssociatedApplications"
        />
      </div>
    </Form>
  </CreateEditDialog>
</template>
