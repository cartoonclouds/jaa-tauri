<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDraftFlowStep,
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
    ApplicationSelectOption,
  } from "@modules/applications/types";
  import type { Event } from "@modules/events/domain/entities/Event";
  import type { SortableEvent } from "sortablejs";

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
  import {
    moveArrayElement,
    useSortable,
  } from "@vueuse/integrations/useSortable";
  import {
    computed,
    nextTick,
    reactive,
    ref,
    shallowRef,
    useTemplateRef,
    watch,
  } from "vue";

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
    notes: string;
  }>({
    id: "",
    type: INTERACTION_STAGES[0],
    notes: "",
  });

  const createFlowSteps = ref<(ApplicationDraftFlowStep & { id: string })[]>(
    [],
  );

  const editStageListEl = useTemplateRef<HTMLElement>("editStageList");
  const createStageListEl = useTemplateRef<HTMLElement>("createStageList");
  const editableStageSortedList = shallowRef<Event[]>([]);

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

  watch(
    editableStageEvents,
    (events) => {
      editableStageSortedList.value = [...events];
    },
    { immediate: true },
  );

  useSortable(editStageListEl, editableStageSortedList, {
    handle: ".stage-drag-handle",
    animation: 150,
    watchElement: true,
    onUpdate: async (e: SortableEvent) => {
      if (e.oldIndex === undefined || e.newIndex === undefined) {
        return;
      }
      moveArrayElement(editableStageSortedList, e.oldIndex, e.newIndex, e);
      await nextTick();
      await persistEditableStageSortOrder(editableStageSortedList.value);
    },
  });

  useSortable(createStageListEl, createFlowSteps, {
    handle: ".stage-drag-handle",
    animation: 150,
    watchElement: true,
    onUpdate: async (e: SortableEvent) => {
      if (e.oldIndex === undefined || e.newIndex === undefined) {
        return;
      }
      moveArrayElement(createFlowSteps, e.oldIndex, e.newIndex, e);
      await nextTick();
      normalizeCreateFlowStepSortOrder();
    },
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
      notes: null,
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
    stageForm.notes = "";
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
    stageForm.notes = event.notes ?? "";
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
    stageForm.notes = step.notes ?? "";
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
          notes: stageForm.notes.trim() ? stageForm.notes : null,
        });
      } else if (stageDialogDraftId.value) {
        const target = createFlowSteps.value.find(
          (step) => step.id === stageDialogDraftId.value,
        );
        if (target) {
          target.type = stageForm.type;
          target.notes = stageForm.notes.trim() ? stageForm.notes : null;
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
        notes: stageForm.notes.trim() ? stageForm.notes : null,
      });
    } else if (stageForm.id) {
      await update({
        id: stageForm.id,
        type: stageForm.type,
        notes: stageForm.notes.trim() ? stageForm.notes : null,
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
   * Handles on submit.
   */
  function onSubmit(payload: ApplicationFormSubmitPayload): void {
    if (props.mode === "create") {
      emit("submit", {
        ...payload,
        flowSteps: createFlowSteps.value.map((step) => ({
          type: step.type,
          sortOrder: step.sortOrder,
          notes: step.notes ?? null,
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
        v-if="editableStageSortedList.length === 0"
        class="text-sm text-surface-500"
      >
        No flow steps yet.
      </div>

      <div v-else ref="editStageList" class="space-y-2">
        <div
          v-for="stageEvent in editableStageSortedList"
          :key="stageEvent.id"
          class="flex items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2 transition-colors"
        >
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="stage-drag-handle inline-flex h-6 w-6 shrink-0 items-center justify-center text-surface-400 cursor-grab active:cursor-grabbing"
              :aria-label="`Drag ${EVENT_COPY_BY_STAGE[stageEvent.type]?.title ?? stageEvent.type}`"
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

      <div v-else ref="createStageList" class="space-y-2">
        <div
          v-for="step in createFlowSteps"
          :key="step.id"
          class="flex items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2 transition-colors"
        >
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="stage-drag-handle inline-flex h-6 w-6 shrink-0 items-center justify-center text-surface-400 cursor-grab active:cursor-grabbing"
              :aria-label="`Drag ${EVENT_COPY_BY_STAGE[step.type].title}`"
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
