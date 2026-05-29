<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type { Event } from "@modules/events/domain/entities/Event";

  import ApplicationBadge from "@modules/applications/presentation/components/badges/ApplicationBadge.vue";
  import ApplicationDetailsCard from "@modules/applications/presentation/components/cards/ApplicationDetailsCard.vue";
  import { useEvent } from "@modules/events/composables/useEvent";
  import {
    EVENT_COPY_BY_STAGE,
    INTERACTION_STAGES,
    type InteractionStage,
    isInteractionStage,
  } from "@modules/events/constants";
  import EventFlowStepper from "@modules/events/presentation/components/EventFlowStepper.vue";
  import { computed, reactive, ref } from "vue";

  import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog.vue";
  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

  /**
   * Defines props.
   */
  interface Props {
    application: Application | null;
    companyName: string;
    appliedAtLabel: string;
  }

  const props = defineProps<Props>();
  const {
    items: eventItems,
    create,
    remove,
    update,
    isLoading: isMutatingEvent,
  } = useEvent();
  const isEditDialogVisible = ref(false);
  const isDeleteConfirmVisible = ref(false);
  const editForm = reactive<{
    id: string;
    type: InteractionStage;
    eventAt: Date | null;
  }>({
    id: "",
    type: INTERACTION_STAGES[0],
    eventAt: null,
  });

  useBodyScrollLock(isEditDialogVisible);

  /**
   * Formats stage timestamp in a short, readable form.
   */
  function formatStageDate(value: Date): string {
    return value.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const applicationStageEvents = computed<Event[]>(() => {
    const application = props.application;
    if (!application) {
      return [];
    }

    return eventItems.value
      .filter(
        (event) =>
          event.applicationId === application.id &&
          isInteractionStage(event.type),
      )
      .sort((left, right) => {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }

        return left.id.localeCompare(right.id);
      });
  });

  const summaryFlowStages = computed<InteractionStage[]>(() => {
    const stagesFromEvents: InteractionStage[] = [];
    for (const event of applicationStageEvents.value) {
      if (!isInteractionStage(event.type)) {
        continue;
      }

      if (!stagesFromEvents.includes(event.type)) {
        stagesFromEvents.push(event.type);
      }
    }

    return stagesFromEvents;
  });

  const completedFlowStages = computed<InteractionStage[]>(() => {
    const completedStages = new Set<InteractionStage>();
    for (const event of applicationStageEvents.value) {
      if (event.eventAt && isInteractionStage(event.type)) {
        completedStages.add(event.type);
      }
    }

    const completedPrefix: InteractionStage[] = [];
    for (const stage of summaryFlowStages.value) {
      if (!completedStages.has(stage)) {
        break;
      }

      completedPrefix.push(stage);
    }

    return completedPrefix;
  });

  const futureFlowStages = computed<InteractionStage[]>(() => {
    const completedPrefixStages = new Set(completedFlowStages.value);
    return summaryFlowStages.value.filter(
      (stage) => !completedPrefixStages.has(stage),
    );
  });

  const editableFlowStages = computed<InteractionStage[]>(() => {
    const editableStages = [...completedFlowStages.value];
    const firstFutureStage = futureFlowStages.value[0];

    if (firstFutureStage) {
      editableStages.push(firstFutureStage);
    }

    return editableStages;
  });

  const displayedFlowStages = computed(() => {
    const application = props.application;
    const stageEventByType = new Map<InteractionStage, Event>();

    if (application) {
      for (const event of applicationStageEvents.value) {
        if (!isInteractionStage(event.type)) {
          continue;
        }

        if (!stageEventByType.has(event.type)) {
          stageEventByType.set(event.type, event);
        }
      }
    }

    return summaryFlowStages.value.map((stage) => {
      const event = stageEventByType.get(stage) ?? null;
      const eventAt = event?.eventAt ?? null;
      return {
        eventId: event?.id ?? null,
        stage,
        isFuture: !eventAt,
        eventAtLabel: eventAt ? formatStageDate(eventAt) : null,
      };
    });
  });

  const stageHoverLabels = computed<Partial<Record<InteractionStage, string>>>(
    () => {
      const labels: Partial<Record<InteractionStage, string>> = {};

      for (const item of displayedFlowStages.value) {
        if (item.eventAtLabel) {
          labels[item.stage] = item.eventAtLabel;
        }
      }

      return labels;
    },
  );

  const summaryTimelineActiveStepIndex = computed(() => {
    const displayedCount = displayedFlowStages.value.length;
    if (displayedCount === 0) {
      return 1;
    }

    const completedCount = completedFlowStages.value.length;
    return Math.min(Math.max(completedCount, 1), displayedCount);
  });

  const selectedStageEventId = computed<string | null>(() => {
    const applicationId = props.application?.id;
    if (!applicationId) {
      return null;
    }

    const selectedEvent = eventItems.value.find(
      (entry) =>
        entry.applicationId === applicationId && entry.type === editForm.type,
    );

    return selectedEvent?.id ?? null;
  });

  /**
   * Handles open stage edit by step double-click.
   */
  function onStageDoubleClick(stage: InteractionStage): void {
    if (!editableFlowStages.value.includes(stage)) {
      return;
    }

    const applicationId = props.application?.id;
    const event = applicationId
      ? eventItems.value.find(
          (entry) =>
            entry.applicationId === applicationId && entry.type === stage,
        )
      : null;

    if (event) {
      editForm.id = event.id;
      editForm.type = event.type;
      editForm.eventAt = event.eventAt ? new Date(event.eventAt) : null;
    } else {
      editForm.id = "";
      editForm.type = stage;
      editForm.eventAt = null;
    }

    isEditDialogVisible.value = true;
  }

  /**
   * Handles save stage edit.
   */
  async function saveStageEdit(): Promise<void> {
    const eventAtIso = editForm.eventAt ? editForm.eventAt.toISOString() : null;

    if (editForm.id) {
      await update({
        id: editForm.id,
        type: editForm.type,
        eventAt: eventAtIso,
      });
    } else if (props.application) {
      await create({
        applicationId: props.application.id,
        type: editForm.type,
        title: EVENT_COPY_BY_STAGE[editForm.type].title,
        description: null,
        eventAt: eventAtIso,
      });
    }

    isEditDialogVisible.value = false;
  }

  /**
   * Handles delete current stage event from this application flow.
   */
  async function deleteStageEdit(): Promise<void> {
    if (!props.application || !selectedStageEventId.value) {
      return;
    }

    const event = eventItems.value.find(
      (entry) => entry.id === selectedStageEventId.value,
    );
    if (event?.applicationId !== props.application.id) {
      return;
    }

    await remove(selectedStageEventId.value);
    isDeleteConfirmVisible.value = false;
    isEditDialogVisible.value = false;
  }

  /**
   * Handles request delete stage edit.
   */
  function requestDeleteStageEdit(): void {
    if (!selectedStageEventId.value) {
      return;
    }

    isDeleteConfirmVisible.value = true;
  }
</script>

<template>
  <div v-if="application" class="space-y-4">
    <ApplicationDetailsCard
      title="Application Flow"
      info="To add or remove events from the timeline, edit the application."
    >
      <div class="rounded-lg border border-surface-200 bg-surface-0 px-3 py-2">
        <p
          class="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500"
        >
          Timeline
        </p>

        <div
          v-if="displayedFlowStages.length === 0"
          class="text-sm text-surface-500"
        >
          No flow stages available.
        </div>

        <div v-else class="space-y-3">
          <EventFlowStepper
            :stages="completedFlowStages"
            :future-stages="futureFlowStages"
            :active-step-index="summaryTimelineActiveStepIndex"
            :editable-stages="editableFlowStages"
            :stage-hover-labels="stageHoverLabels"
            @stage-dblclick="onStageDoubleClick"
          />

          <p class="text-xs text-surface-500">
            Tip: Double-click completed steps or the next upcoming step to set
            the date/time.
          </p>
        </div>
      </div>
    </ApplicationDetailsCard>

    <div class="grid gap-3 md:grid-cols-2">
      <ApplicationDetailsCard title="Title" compact>
        <p class="text-sm font-medium text-surface-900">
          {{ application.title }}
        </p>
      </ApplicationDetailsCard>

      <ApplicationDetailsCard title="Status" compact>
        <ApplicationBadge kind="status" :status="application.status" />
      </ApplicationDetailsCard>

      <ApplicationDetailsCard title="Event Flow" compact>
        <ApplicationBadge
          kind="event-flow"
          :event-flow-status="application.eventFlowStatus"
        />
      </ApplicationDetailsCard>

      <ApplicationDetailsCard title="Company" compact>
        <p class="text-sm font-medium text-surface-900">
          {{ companyName }}
        </p>
      </ApplicationDetailsCard>

      <ApplicationDetailsCard title="Applied At" compact>
        <p class="text-sm font-medium text-surface-900">
          {{ appliedAtLabel }}
        </p>
      </ApplicationDetailsCard>
    </div>
  </div>

  <Message v-else severity="info">
    Summary details are available after selecting or saving an application.
  </Message>

  <Dialog
    v-model:visible="isEditDialogVisible"
    modal
    header="Edit Flow Step"
    class="w-full! max-w-lg"
  >
    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium text-surface-700">Stage</label>
        <Select
          v-model="editForm.type"
          :options="[...INTERACTION_STAGES]"
          fluid
        />
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-surface-700"
          >Event Date/Time</label
        >
        <DatePicker
          v-model="editForm.eventAt"
          show-time
          hour-format="24"
          show-icon
          show-clear
          fluid
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <Button
          v-if="selectedStageEventId"
          type="button"
          label="Delete"
          severity="danger"
          text
          :disabled="isMutatingEvent"
          class="mr-auto"
          @click="requestDeleteStageEdit"
        />
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          text
          :disabled="isMutatingEvent"
          @click="isEditDialogVisible = false"
        />
        <Button
          type="button"
          label="Save"
          :loading="isMutatingEvent"
          @click="saveStageEdit"
        />
      </div>
    </template>
  </Dialog>

  <ConfirmActionDialog
    v-model:visible="isDeleteConfirmVisible"
    title="Delete Flow Step"
    message="Are you sure you want to delete this flow step from the current application?"
    confirm-label="Delete"
    confirm-severity="danger"
    :busy="isMutatingEvent"
    @confirm="deleteStageEdit"
  />
</template>
