<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import { Icon } from "#components";

  interface StatisticsMomentumSummaryProps {
    overview: StatisticsOverview;
  }

  defineProps<StatisticsMomentumSummaryProps>();
</script>

<template>
  <div
    class="rounded-xl border border-surface-200 bg-surface-0 p-4 text-sm text-surface-600 shadow-sm"
  >
    <p class="font-medium text-surface-900">30-day momentum</p>
    <p class="mt-2 flex items-center gap-2">
      <Icon name="heroicons:calendar-days" class="h-4 w-4 text-surface-500" />
      <span>Applications created:</span>
      <span class="font-semibold">{{
        overview.applicationsCreatedLast30Days
      }}</span>
      ({{ overview.applicationsCreatedDelta30Days >= 0 ? "+" : ""
      }}{{ overview.applicationsCreatedDelta30Days }} vs previous 30 days)
    </p>
    <p class="mt-2 flex items-center gap-2">
      <Icon name="heroicons:calendar" class="h-4 w-4 text-surface-500" />
      <span>Applications applied:</span>
      <span class="font-semibold">{{
        overview.applicationsAppliedLast30Days
      }}</span>
      ({{ overview.applicationsAppliedDelta30Days >= 0 ? "+" : ""
      }}{{ overview.applicationsAppliedDelta30Days }} vs previous 30 days)
    </p>
  </div>
</template>
