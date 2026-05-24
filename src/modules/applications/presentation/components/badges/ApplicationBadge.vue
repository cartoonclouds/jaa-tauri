<script setup lang="ts">
  import type {
    ApplicationAttendanceType,
    ApplicationEmploymentType,
    ApplicationEventFlowStatus,
    ApplicationStatus,
  } from "@modules/applications/types/enums";

  import {
    formatApplicationAttendanceTypeLabel,
    formatApplicationEmploymentTypeLabel,
    formatApplicationEventFlowStatusLabel,
    formatApplicationStatusLabel,
    getApplicationArchivedClass,
    getApplicationAttendanceTypeClass,
    getApplicationEmploymentTypeClass,
    getApplicationEventFlowStatusClass,
    getApplicationPriorityClass,
    getApplicationStatusClass,
  } from "@modules/applications/presentation/utils/applicationVisualTokens";
  import { computed } from "vue";

  type ApplicationBadgeKind =
    | "archived"
    | "attendance"
    | "employment"
    | "event-flow"
    | "priority"
    | "status";

  interface Props {
    kind: ApplicationBadgeKind;
    status?: ApplicationStatus | null;
    eventFlowStatus?: ApplicationEventFlowStatus | null;
    attendanceType?: ApplicationAttendanceType | null;
    employmentType?: ApplicationEmploymentType | null;
    priority?: number | null;
    archived?: boolean;
  }

  const props = defineProps<Props>();

  const badgeLabel = computed(() => {
    if (props.kind === "status") {
      return formatApplicationStatusLabel(props.status);
    }

    if (props.kind === "event-flow") {
      return formatApplicationEventFlowStatusLabel(props.eventFlowStatus);
    }

    if (props.kind === "attendance") {
      return formatApplicationAttendanceTypeLabel(props.attendanceType);
    }

    if (props.kind === "employment") {
      return formatApplicationEmploymentTypeLabel(props.employmentType);
    }

    if (props.kind === "priority") {
      return `P${props.priority ?? 3}`;
    }

    return props.archived ? "Archived" : "Active";
  });

  const badgeClass = computed(() => {
    if (props.kind === "status") {
      return getApplicationStatusClass(props.status);
    }

    if (props.kind === "event-flow") {
      return getApplicationEventFlowStatusClass(props.eventFlowStatus);
    }

    if (props.kind === "attendance") {
      return getApplicationAttendanceTypeClass(props.attendanceType);
    }

    if (props.kind === "employment") {
      return getApplicationEmploymentTypeClass(props.employmentType);
    }

    if (props.kind === "priority") {
      return getApplicationPriorityClass(props.priority ?? 3);
    }

    return getApplicationArchivedClass(Boolean(props.archived));
  });
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
    :class="badgeClass"
  >
    {{ badgeLabel }}
  </span>
</template>
