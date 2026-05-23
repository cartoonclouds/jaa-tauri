<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type { ApplicationStatus } from "@modules/applications/types/enums";

  import {
    formatApplicationStatusLabel,
    getApplicationStatusClass,
  } from "@modules/applications/presentation/utils/applicationVisualTokens";
  import EventFlowStepper from "@modules/events/presentation/components/EventFlowStepper.vue";
  import {
    type ApplicationFlowStatus,
    EVENT_FLOW_BY_APPLICATION_STATUS,
    getFutureEventFlowStages,
    isApplicationProgressStatus,
  } from "@modules/events/presentation/constants/interactionStages";
  import { computed } from "vue";

  interface Props {
    application: Application | null;
    companyName: string;
    appliedAtLabel: string;
  }

  const props = defineProps<Props>();

  function mapStatusToFlowStatus(
    status: ApplicationStatus,
  ): ApplicationFlowStatus {
    const statusValue = status.value;

    if (statusValue === "saved") {
      return "saved";
    }

    if (statusValue === "applied") {
      return "applied";
    }

    if (
      statusValue === "phone-screening" ||
      statusValue === "technical" ||
      statusValue === "interview"
    ) {
      return "interview";
    }

    if (statusValue === "offer") {
      return "offer";
    }

    if (statusValue === "rejected") {
      return "rejected";
    }

    return "saved";
  }

  const summaryFlowStages = computed(() => {
    const status = props.application?.status;
    if (!status) {
      return [] as string[];
    }

    const flowStatus = mapStatusToFlowStatus(status);
    return EVENT_FLOW_BY_APPLICATION_STATUS[flowStatus];
  });

  const futureFlowStages = computed(() => {
    const statusValue = props.application?.status.value;

    return isApplicationProgressStatus(statusValue)
      ? getFutureEventFlowStages(statusValue)
      : [];
  });

  const activeFlowStepIndex = computed(() => {
    const stageCount = summaryFlowStages.value.length;
    if (stageCount === 0) {
      return 1;
    }

    return stageCount;
  });
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
        <EventFlowStepper
          :stages="summaryFlowStages"
          :future-stages="futureFlowStages"
          :active-step-index="activeFlowStepIndex"
        />
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
</template>
