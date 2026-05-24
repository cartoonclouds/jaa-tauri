<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDraftFlowStep,
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
    ApplicationSelectOption,
  } from "@modules/applications/types/presentation";
  import type { Event } from "@modules/events/domain/entities/Event";

  import ApplicationDetailsView from "@modules/applications/presentation/components/ApplicationDetailsView.vue";
  import ApplicationForm from "@modules/applications/presentation/components/ApplicationForm.vue";
  import { useEvent } from "@modules/events/presentation/composables/useEvent";
  import {
    type ApplicationFlowStatus,
    EVENT_COPY_BY_STAGE,
    EVENT_FLOW_BY_APPLICATION_STATUS,
    INTERACTION_STAGES,
    type InteractionStage,
    isInteractionStage,
  } from "@modules/events/presentation/constants/interactionStages";
  import { computed, reactive, ref, watch } from "vue";

  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

  /**
   * Defines props.
   */
  interface Props {
    mode: ApplicationDrawerMode;
    application: Application | null;
    initialValues: ApplicationFormValues;
    companies: ApplicationSelectOption[];
    busy?: boolean;
    isDeleting?: boolean;
    companyName: string;
    appliedAtLabel: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    busy: false,
    isDeleting: false,
  });

  const emit = defineEmits<{
    submit: [payload: ApplicationFormSubmitPayload];
    "request-delete": [id: string];
    "request-open-company": [companyId: string];
    "cancel-edit": [];
  }>();

  const {
    items: eventItems,
    create,
    update,
    remove,
    isLoading: isMutatingEvent,
  } = useEvent();

  const isStageDialogVisible = ref(false);
  const stageDialogDraftId = ref<string | null>(null);
  const stageDialogMode = ref<"create" | "edit">("create");
  const stageForm = reactive<{
    id: string;
    type: InteractionStage;
    eventAt: Date | null;
  }>({
    id: "",
    type: INTERACTION_STAGES[0],
    eventAt: null,
  });

  const createFlowSteps = ref<(ApplicationDraftFlowStep & { id: string })[]>(
    [],
  );

  useBodyScrollLock(isStageDialogVisible);

  const editableStageEvents = computed<Event[]>(() => {
    const applicationId = props.application?.id;
    if (!applicationId) {
      return [];
    }

    return eventItems.value
      .filter(
        (event) =>
          event.applicationId === applicationId &&
          isInteractionStage(event.type),
      )
      .sort((left, right) => {
        const leftTime = left.eventAt?.getTime() ?? left.createdAt.getTime();
        const rightTime = right.eventAt?.getTime() ?? right.createdAt.getTime();
        return leftTime - rightTime;
      });
  });

  /**
   * Maps event flow status values to stage defaults.
   */
  function mapEventFlowValueToFlowStatus(
    value: string | null | undefined,
  ): ApplicationFlowStatus {
    if (value === "saved") {
      return "saved";
    }

    if (value === "applied") {
      return "applied";
    }

    if (value === "interview") {
      return "interview";
    }

    if (value === "offer") {
      return "offer";
    }

    if (value === "rejected") {
      return "rejected";
    }

    return "saved";
  }

  /**
   * Initializes draft flow steps for create mode.
   */
  function initializeCreateFlowSteps(): void {
    const flowStatus = mapEventFlowValueToFlowStatus(
      props.initialValues.eventFlowStatus.value,
    );
    createFlowSteps.value = EVENT_FLOW_BY_APPLICATION_STATUS[flowStatus].map(
      (stage) => ({
        id: crypto.randomUUID(),
        type: stage,
        eventAt: null,
      }),
    );
  }

  watch(
    () => props.mode,
    (mode) => {
      if (mode === "create") {
        initializeCreateFlowSteps();
      }
    },
    { immediate: true },
  );

  /**
   * Formats event datetime for stage rows.
   */
  function formatEventAt(value: Date | null): string {
    if (!value) {
      return "Not set";
    }

    return value.toLocaleString();
  }

  /**
   * Opens stage creation dialog.
   */
  function openCreateStageDialog(): void {
    stageDialogMode.value = "create";
    stageDialogDraftId.value = null;
    stageForm.id = "";
    stageForm.type = INTERACTION_STAGES[0];
    stageForm.eventAt = null;
    isStageDialogVisible.value = true;
  }

  /**
   * Opens stage edit dialog for an existing event.
   */
  function openEditStageDialog(event: Event): void {
    stageDialogMode.value = "edit";
    stageDialogDraftId.value = null;
    stageForm.id = event.id;
    stageForm.type = event.type;
    stageForm.eventAt = event.eventAt;
    isStageDialogVisible.value = true;
  }

  /**
   * Opens draft stage edit dialog in create mode.
   */
  function openEditDraftStageDialog(
    step: ApplicationDraftFlowStep & { id: string },
  ): void {
    stageDialogMode.value = "edit";
    stageDialogDraftId.value = step.id;
    stageForm.id = "";
    stageForm.type = step.type;
    stageForm.eventAt = step.eventAt;
    isStageDialogVisible.value = true;
  }

  /**
   * Persists a stage create or edit action.
   */
  async function saveStageDialog(): Promise<void> {
    const applicationId = props.application?.id;
    if (props.mode === "create") {
      if (stageDialogMode.value === "create") {
        createFlowSteps.value.push({
          id: crypto.randomUUID(),
          type: stageForm.type,
          eventAt: stageForm.eventAt,
        });
      } else if (stageDialogDraftId.value) {
        const target = createFlowSteps.value.find(
          (step) => step.id === stageDialogDraftId.value,
        );
        if (target) {
          target.type = stageForm.type;
          target.eventAt = stageForm.eventAt;
        }
      }

      isStageDialogVisible.value = false;
      return;
    }

    if (!applicationId) {
      return;
    }

    if (stageDialogMode.value === "create") {
      await create({
        applicationId,
        contactId: null,
        type: stageForm.type,
        title: EVENT_COPY_BY_STAGE[stageForm.type].title,
        description: null,
        eventAt: stageForm.eventAt,
      });
    } else if (stageForm.id) {
      await update({
        id: stageForm.id,
        type: stageForm.type,
        eventAt: stageForm.eventAt,
      });
    }

    isStageDialogVisible.value = false;
  }

  /**
   * Removes an existing stage event from this application.
   */
  async function deleteStage(eventId: string): Promise<void> {
    await remove(eventId);
  }

  /**
   * Removes a draft stage step in create mode.
   */
  function deleteDraftStage(stepId: string): void {
    createFlowSteps.value = createFlowSteps.value.filter(
      (step) => step.id !== stepId,
    );
  }

  /**
   * Handles on submit.
   */
  function onSubmit(payload: ApplicationFormSubmitPayload): void {
    if (props.mode === "create") {
      emit("submit", {
        ...payload,
        flowSteps: createFlowSteps.value.map((step) => ({
          type: step.type,
          eventAt: step.eventAt,
        })),
      });
      return;
    }

    emit("submit", payload);
  }

  /**
   * Handles on delete.
   */
  function onDelete(application: Application): void {
    emit("request-delete", application.id);
  }
</script>

<template>
  <div v-if="mode !== 'view'" class="space-y-4">
    <ApplicationForm
      :mode="mode === 'create' ? 'create' : 'edit'"
      :initial-values="initialValues"
      :busy="busy"
      :companies="companies"
      :show-cancel="mode === 'edit'"
      @submit="onSubmit"
      @cancel="emit('cancel-edit')"
    />

    <section
      v-if="mode === 'edit' && application"
      class="rounded-2xl border border-surface-200 bg-surface-0 p-4 shadow-sm"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 class="text-sm font-semibold text-surface-900">Flow Steps</h3>
          <p class="text-xs text-surface-500">
            Edit this application's stage timeline while updating core details.
          </p>
        </div>

        <Button
          type="button"
          size="small"
          :disabled="isMutatingEvent"
          @click="openCreateStageDialog"
        >
          <Icon name="heroicons:plus" class="h-4 w-4" />
          <span>Add Step</span>
        </Button>
      </div>

      <div
        v-if="editableStageEvents.length === 0"
        class="text-sm text-surface-500"
      >
        No flow steps yet.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="event in editableStageEvents"
          :key="event.id"
          class="flex items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-surface-900">
              {{ EVENT_COPY_BY_STAGE[event.type]?.title ?? event.type }}
            </p>
            <p class="text-xs text-surface-500">
              {{ formatEventAt(event.eventAt) }}
            </p>
          </div>

          <div class="flex items-center gap-1">
            <Button
              type="button"
              severity="secondary"
              text
              size="small"
              :disabled="isMutatingEvent"
              @click="openEditStageDialog(event)"
            >
              <Icon name="heroicons:pencil-square" class="h-4 w-4" />
            </Button>

            <Button
              type="button"
              severity="danger"
              text
              size="small"
              :disabled="isMutatingEvent"
              @click="deleteStage(event.id)"
            >
              <Icon name="heroicons:trash" class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>

    <section
      v-else-if="mode === 'create'"
      class="rounded-2xl border border-surface-200 bg-surface-0 p-4 shadow-sm"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 class="text-sm font-semibold text-surface-900">Flow Steps</h3>
          <p class="text-xs text-surface-500">
            Default flow is prefilled and can be customized before creating.
          </p>
        </div>

        <Button type="button" size="small" @click="openCreateStageDialog">
          <Icon name="heroicons:plus" class="h-4 w-4" />
          <span>Add Step</span>
        </Button>
      </div>

      <div v-if="createFlowSteps.length === 0" class="text-sm text-surface-500">
        No flow steps configured.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="step in createFlowSteps"
          :key="step.id"
          class="flex items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-surface-900">
              {{ EVENT_COPY_BY_STAGE[step.type].title }}
            </p>
            <p class="text-xs text-surface-500">
              {{ formatEventAt(step.eventAt) }}
            </p>
          </div>

          <div class="flex items-center gap-1">
            <Button
              type="button"
              severity="secondary"
              text
              size="small"
              @click="openEditDraftStageDialog(step)"
            >
              <Icon name="heroicons:pencil-square" class="h-4 w-4" />
            </Button>

            <Button
              type="button"
              severity="danger"
              text
              size="small"
              @click="deleteDraftStage(step.id)"
            >
              <Icon name="heroicons:trash" class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  </div>

  <ApplicationDetailsView
    v-else-if="application"
    :application="application"
    :company-name="companyName"
    :applied-at-label="appliedAtLabel"
    :is-deleting="isDeleting"
    @request-delete="onDelete(application)"
    @request-open-company="emit('request-open-company', $event)"
  />

  <Message v-else severity="info">
    No application details are currently available.
  </Message>

  <Dialog
    v-model:visible="isStageDialogVisible"
    modal
    :header="stageDialogMode === 'create' ? 'Add Flow Step' : 'Edit Flow Step'"
    class="w-full! max-w-lg"
  >
    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium text-surface-700">Stage</label>
        <Select
          v-model="stageForm.type"
          :options="[...INTERACTION_STAGES]"
          fluid
        />
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-surface-700">Event At</label>
        <DatePicker
          v-model="stageForm.eventAt"
          show-time
          hour-format="24"
          date-format="yy-mm-dd"
          fluid
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          text
          :disabled="isMutatingEvent"
          @click="isStageDialogVisible = false"
        />
        <Button
          type="button"
          :label="stageDialogMode === 'create' ? 'Add Step' : 'Save'"
          :loading="isMutatingEvent"
          @click="saveStageDialog"
        />
      </div>
    </template>
  </Dialog>
</template>
