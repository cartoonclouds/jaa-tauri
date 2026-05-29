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
  import ApplicationDetailsStageDialog from "@modules/applications/presentation/components/dialogs/ApplicationDetailsStageDialog.vue";
  import { useEvent } from "@modules/events/composables/useEvent";
  import {
    EVENT_COPY_BY_STAGE,
    EVENT_FLOW_STAGE_SET,
    INTERACTION_STAGES,
    type InteractionStage,
    isInteractionStage,
  } from "@modules/events/constants";
  import { formatDisplayDateTime } from "@shared/utils/toDate";
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
    refresh: refreshEvents,
    service: eventService,
    isLoading: isMutatingEvent,
  } = useEvent();

  const isStageDialogVisible = ref(false);
  const stageDialogDraftId = ref<string | null>(null);
  const stageDialogMode = ref<"create" | "edit">("create");
  const stageForm = reactive<{
    id: string;
    type: InteractionStage;
  }>({
    id: "",
    type: INTERACTION_STAGES[0],
  });

  const createFlowSteps = ref<(ApplicationDraftFlowStep & { id: string })[]>(
    [],
  );
  const draggedCreateStepId = ref<string | null>(null);
  const draggedEditStepId = ref<string | null>(null);
  const createDropTargetStepId = ref<string | null>(null);
  const editDropTargetEventId = ref<string | null>(null);

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
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }

        return left.id.localeCompare(right.id);
      });
  });

  /**
   * Ensures draft flow steps use contiguous sort order values.
   */
  function normalizeCreateFlowStepSortOrder(): void {
    createFlowSteps.value = createFlowSteps.value.map((step, index) => ({
      ...step,
      sortOrder: index + 1,
    }));
  }

  /**
   * Reorders a list by moving one id before another id.
   */
  function reorderById<T extends { id: string }>(
    items: readonly T[],
    draggedId: string,
    targetId: string,
  ): T[] {
    const sourceIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return [...items];
    }

    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    if (!moved) {
      return [...items];
    }

    next.splice(targetIndex, 0, moved);
    return next;
  }

  /**
   * Persists event sort_order values using the current rendered order.
   */
  async function persistEditableStageSortOrder(
    orderedEvents: readonly Event[],
  ): Promise<void> {
    for (const [index, stageEvent] of orderedEvents.entries()) {
      await eventService.update({
        id: stageEvent.id,
        sortOrder: index + 1,
      });
    }

    await refreshEvents();
  }

  /**
   * Initializes draft flow steps for create mode.
   */
  function initializeCreateFlowSteps(): void {
    createFlowSteps.value = [...EVENT_FLOW_STAGE_SET].map((stage, index) => ({
      id: crypto.randomUUID(),
      type: stage,
      sortOrder: index + 1,
    }));
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
   * Opens stage creation dialog.
   */
  function openCreateStageDialog(): void {
    stageDialogMode.value = "create";
    stageDialogDraftId.value = null;
    stageForm.id = "";
    stageForm.type = INTERACTION_STAGES[0];
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
          sortOrder: createFlowSteps.value.length + 1,
        });
      } else if (stageDialogDraftId.value) {
        const target = createFlowSteps.value.find(
          (step) => step.id === stageDialogDraftId.value,
        );
        if (target) {
          target.type = stageForm.type;
        }
      }

      normalizeCreateFlowStepSortOrder();

      isStageDialogVisible.value = false;
      return;
    }

    if (!applicationId) {
      return;
    }

    if (stageDialogMode.value === "create") {
      await create({
        applicationId,
        type: stageForm.type,
        title: EVENT_COPY_BY_STAGE[stageForm.type].title,
        description: null,
      });
    } else if (stageForm.id) {
      await update({
        id: stageForm.id,
        type: stageForm.type,
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
    normalizeCreateFlowStepSortOrder();
  }

  /**
   * Handles edit-mode stage row drag start.
   */
  function onEditStageDragStart(eventId: string, event: DragEvent): void {
    draggedEditStepId.value = eventId;
    editDropTargetEventId.value = null;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", eventId);
    }
  }

  /**
   * Handles edit-mode stage row drag over to allow dropping.
   */
  function onEditStageDragOver(targetEventId: string, event: DragEvent): void {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const draggedId =
      draggedEditStepId.value ?? event.dataTransfer?.getData("text/plain");
    editDropTargetEventId.value =
      draggedId && draggedId !== targetEventId ? targetEventId : null;
  }

  /**
   * Handles edit-mode stage row drop and persists new sort order.
   */
  async function onEditStageDrop(
    targetEventId: string,
    event: DragEvent,
  ): Promise<void> {
    event.preventDefault();

    const draggedId =
      draggedEditStepId.value ?? event.dataTransfer?.getData("text/plain");
    draggedEditStepId.value = null;
    editDropTargetEventId.value = null;

    if (!draggedId || draggedId === targetEventId || isMutatingEvent.value) {
      return;
    }

    const reordered = reorderById(
      editableStageEvents.value,
      draggedId,
      targetEventId,
    );
    await persistEditableStageSortOrder(reordered);
  }

  /**
   * Handles create-mode stage row drag start.
   */
  function onCreateStageDragStart(stepId: string, event: DragEvent): void {
    draggedCreateStepId.value = stepId;
    createDropTargetStepId.value = null;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", stepId);
    }
  }

  /**
   * Handles create-mode stage row drag over to allow dropping.
   */
  function onCreateStageDragOver(targetStepId: string, event: DragEvent): void {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const draggedId =
      draggedCreateStepId.value ?? event.dataTransfer?.getData("text/plain");
    createDropTargetStepId.value =
      draggedId && draggedId !== targetStepId ? targetStepId : null;
  }

  /**
   * Handles create-mode stage row drop.
   */
  function onCreateStageDrop(targetStepId: string, event: DragEvent): void {
    event.preventDefault();

    const draggedId =
      draggedCreateStepId.value ?? event.dataTransfer?.getData("text/plain");
    draggedCreateStepId.value = null;
    createDropTargetStepId.value = null;

    if (!draggedId || draggedId === targetStepId) {
      return;
    }

    createFlowSteps.value = reorderById(
      createFlowSteps.value,
      draggedId,
      targetStepId,
    );
    normalizeCreateFlowStepSortOrder();
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
          sortOrder: step.sortOrder,
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
          v-for="stageEvent in editableStageEvents"
          :key="stageEvent.id"
          class="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors"
          :class="
            editDropTargetEventId === stageEvent.id
              ? 'border-primary-400 bg-primary-50/20'
              : 'border-surface-200'
          "
          @dragover="onEditStageDragOver(stageEvent.id, $event)"
          @dragleave="editDropTargetEventId = null"
          @drop.prevent="onEditStageDrop(stageEvent.id, $event)"
        >
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="inline-flex h-6 w-6 shrink-0 items-center justify-center text-surface-400 cursor-grab active:cursor-grabbing"
              draggable="true"
              :aria-label="`Drag ${EVENT_COPY_BY_STAGE[stageEvent.type]?.title ?? stageEvent.type}`"
              @dragstart="onEditStageDragStart(stageEvent.id, $event)"
              @dragend="
                draggedEditStepId = null;
                editDropTargetEventId = null;
              "
            >
              <Icon name="heroicons:bars-3" class="h-4 w-4" />
            </button>

            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-surface-900">
                {{
                  EVENT_COPY_BY_STAGE[stageEvent.type]?.title ?? stageEvent.type
                }}
              </p>
              <p class="text-xs text-surface-500">
                {{
                  stageEvent.eventAt
                    ? formatDisplayDateTime(stageEvent.eventAt)
                    : "Pending"
                }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <Button
              type="button"
              severity="secondary"
              text
              size="small"
              :disabled="isMutatingEvent"
              @click="openEditStageDialog(stageEvent)"
            >
              <Icon name="heroicons:pencil-square" class="h-4 w-4" />
            </Button>

            <Button
              type="button"
              severity="danger"
              text
              size="small"
              :disabled="isMutatingEvent"
              @click="deleteStage(stageEvent.id)"
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
            The stage set is prefilled and can be customized before creating.
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
          class="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors"
          :class="
            createDropTargetStepId === step.id
              ? 'border-primary-400 bg-primary-50/20'
              : 'border-surface-200'
          "
          @dragover="onCreateStageDragOver(step.id, $event)"
          @dragleave="createDropTargetStepId = null"
          @drop.prevent="onCreateStageDrop(step.id, $event)"
        >
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="inline-flex h-6 w-6 shrink-0 items-center justify-center text-surface-400 cursor-grab active:cursor-grabbing"
              draggable="true"
              :aria-label="`Drag ${EVENT_COPY_BY_STAGE[step.type].title}`"
              @dragstart="onCreateStageDragStart(step.id, $event)"
              @dragend="
                draggedCreateStepId = null;
                createDropTargetStepId = null;
              "
            >
              <Icon name="heroicons:bars-3" class="h-4 w-4" />
            </button>

            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-surface-900">
                {{ EVENT_COPY_BY_STAGE[step.type].title }}
              </p>
            </div>
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

  <ApplicationDetailsStageDialog
    v-model:visible="isStageDialogVisible"
    v-model:stage-type="stageForm.type"
    :mode="stageDialogMode"
    :is-mutating-event="isMutatingEvent"
    @save="saveStageDialog"
  />
</template>
