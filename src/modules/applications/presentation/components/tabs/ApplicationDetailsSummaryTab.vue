<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type { Event } from "@modules/events/domain/entities/Event";

  import {
    formatApplicationEventFlowStatusLabel,
    formatApplicationStatusLabel,
    getApplicationEventFlowStatusClass,
    getApplicationStatusClass,
  } from "@modules/applications/presentation/utils/applicationVisualTokens";
  import { useEvent } from "@modules/events/presentation/composables/useEvent";
  import {
    type ApplicationFlowStatus,
    EVENT_COPY_BY_STAGE,
    EVENT_FLOW_BY_APPLICATION_STATUS,
    getFutureEventFlowStages,
    INTERACTION_STAGES,
    type InteractionStage,
    isApplicationProgressStatus,
    isInteractionStage,
  } from "@modules/events/presentation/constants/interactionStages";
  import { computed, reactive, ref } from "vue";

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
    update,
    remove,
    isLoading: isMutatingEvent,
  } = useEvent();

  const isEditDialogVisible = ref(false);
  const editForm = reactive<{
    id: string;
    type: InteractionStage;
    eventAt: Date | null;
  }>({
    id: "",
    type: INTERACTION_STAGES[0],
    eventAt: null,
  });

  /**
   * Formats timeline stage date in a short, readable form.
   */
  function formatTimelineStageDate(value: Date): string {
    return value.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Handles map event-flow value to flow status.
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

  const summaryFlowStages = computed<InteractionStage[]>(() => {
    const application = props.application;
    if (!application) {
      return [];
    }

    const sortedApplicationEvents = eventItems.value
      .filter((event) => event.applicationId === application.id)
      .sort((left, right) => {
        const leftTime = left.eventAt?.getTime() ?? left.createdAt.getTime();
        const rightTime = right.eventAt?.getTime() ?? right.createdAt.getTime();
        return leftTime - rightTime;
      });

    const stagesFromEvents: InteractionStage[] = [];
    for (const event of sortedApplicationEvents) {
      if (!isInteractionStage(event.type)) {
        continue;
      }

      if (!stagesFromEvents.includes(event.type)) {
        stagesFromEvents.push(event.type);
      }
    }

    if (stagesFromEvents.length > 0) {
      return stagesFromEvents;
    }

    const flowStatus = mapEventFlowValueToFlowStatus(
      application.eventFlowStatus.value,
    );
    return EVENT_FLOW_BY_APPLICATION_STATUS[flowStatus];
  });

  const futureFlowStages = computed<InteractionStage[]>(() => {
    const statusValue = props.application?.status.value;

    return isApplicationProgressStatus(statusValue)
      ? getFutureEventFlowStages(statusValue)
      : [];
  });

  const displayedFlowStages = computed(() => {
    const application = props.application;
    const stageEventByType = new Map<InteractionStage, Event>();

    if (application) {
      const sortedApplicationEvents = eventItems.value
        .filter((event) => event.applicationId === application.id)
        .sort((left, right) => {
          const leftTime = left.eventAt?.getTime() ?? left.createdAt.getTime();
          const rightTime =
            right.eventAt?.getTime() ?? right.createdAt.getTime();
          return leftTime - rightTime;
        });

      for (const event of sortedApplicationEvents) {
        if (!isInteractionStage(event.type)) {
          continue;
        }

        if (!stageEventByType.has(event.type)) {
          stageEventByType.set(event.type, event);
        }
      }
    }

    return [
      ...summaryFlowStages.value.map((stage) => {
        const event = stageEventByType.get(stage) ?? null;
        const eventAt = event?.eventAt ?? null;
        return {
          eventId: event?.id ?? null,
          stage,
          isFuture: false,
          eventAtLabel: eventAt ? formatTimelineStageDate(eventAt) : null,
        };
      }),
      ...futureFlowStages.value
        .filter((stage) => !summaryFlowStages.value.includes(stage))
        .map((stage) => ({
          eventId: null,
          stage,
          isFuture: true,
          eventAtLabel: null,
        })),
    ];
  });

  const summaryTimelineActiveValue = computed(() => {
    const displayedCount = displayedFlowStages.value.length;
    if (displayedCount === 0) {
      return "1";
    }

    const completedCount = summaryFlowStages.value.length;
    const activeIndex = Math.min(Math.max(completedCount, 1), displayedCount);
    return String(activeIndex);
  });

  /**
   * Opens flow step edit for the selected stage.
   */
  function openStageEdit(item: {
    eventId: string | null;
    stage: InteractionStage;
  }): void {
    if (!item.eventId) {
      return;
    }

    const event = eventItems.value.find((entry) => entry.id === item.eventId);
    if (!event) {
      return;
    }

    editForm.id = event.id;
    editForm.type = event.type;
    editForm.eventAt = event.eventAt;
    isEditDialogVisible.value = true;
  }

  /**
   * Saves flow step edits for this application.
   */
  async function saveStageEdit(): Promise<void> {
    if (!editForm.id) {
      return;
    }

    await update({
      id: editForm.id,
      type: editForm.type,
      eventAt: editForm.eventAt,
    });

    isEditDialogVisible.value = false;
  }

  /**
   * Removes a flow step from the current application timeline.
   */
  async function deleteStage(item: { eventId: string | null }): Promise<void> {
    if (!item.eventId) {
      return;
    }

    await remove(item.eventId);
  }
</script>

<template>
  <div v-if="application" class="space-y-4">
    <Card>
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Application Flow</span
        >
      </template>
      <template #content>
        <div
          class="rounded-lg border border-surface-200 bg-surface-0 px-3 py-2"
        >
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

          <Stepper v-else :value="summaryTimelineActiveValue">
            <StepItem
              v-for="(item, index) in displayedFlowStages"
              :key="`${item.stage}-${index}`"
              :value="String(index + 1)"
            >
              <Step class="pointer-events-none">
                <div class="flex w-full justify-start gap-3 text-left">
                  <div class="min-w-0">
                    <span class="block text-sm font-semibold text-surface-900">
                      {{ EVENT_COPY_BY_STAGE[item.stage]?.title ?? item.stage }}
                    </span>
                    <p
                      v-if="item.eventAtLabel"
                      class="pt-0.5 text-[11px] font-medium uppercase tracking-wide text-surface-500"
                    >
                      {{ item.eventAtLabel }}
                    </p>
                  </div>

                  <div
                    v-if="!item.isFuture && item.eventId"
                    class="pointer-events-auto ml-auto flex items-center gap-1"
                  >
                    <Button
                      type="button"
                      severity="secondary"
                      text
                      size="small"
                      :disabled="isMutatingEvent"
                      @click="openStageEdit(item)"
                    >
                      <Icon name="heroicons:pencil-square" class="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      severity="danger"
                      text
                      size="small"
                      :disabled="isMutatingEvent"
                      @click="deleteStage(item)"
                    >
                      <Icon name="heroicons:trash" class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Step>
            </StepItem>
          </Stepper>
        </div>
      </template>
    </Card>

    <div class="grid gap-3 md:grid-cols-2">
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Title</span
          >
        </template>
        <template #content>
          <p class="text-sm font-medium text-surface-900">
            {{ application.title }}
          </p>
        </template>
      </Card>

      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Status</span
          >
        </template>
        <template #content>
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
            :class="getApplicationStatusClass(application.status)"
          >
            {{ formatApplicationStatusLabel(application.status) }}
          </span>
        </template>
      </Card>

      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Event Flow</span
          >
        </template>
        <template #content>
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
            :class="
              getApplicationEventFlowStatusClass(application.eventFlowStatus)
            "
          >
            {{
              formatApplicationEventFlowStatusLabel(application.eventFlowStatus)
            }}
          </span>
        </template>
      </Card>

      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Company</span
          >
        </template>
        <template #content>
          <p class="text-sm font-medium text-surface-900">
            {{ companyName }}
          </p>
        </template>
      </Card>

      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Applied At</span
          >
        </template>
        <template #content>
          <p class="text-sm font-medium text-surface-900">
            {{ appliedAtLabel }}
          </p>
        </template>
      </Card>
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
        <label class="text-sm font-medium text-surface-700">Event At</label>
        <DatePicker
          v-model="editForm.eventAt"
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
</template>
