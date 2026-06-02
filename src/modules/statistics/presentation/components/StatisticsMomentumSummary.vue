<script setup lang="ts">
  import type { IMetric } from "@/modules/statistics/domain/types/metric";
  import type { StatisticCardMetricDefinition } from "@/modules/statistics/domain/types/statistic";

  import { computed } from "vue";

  import { Icon } from "#components";

  /**
   * Defines statistics momentum summary props.
   */
  interface StatisticsMomentumSummaryProps {
    overview: IMetric[];
  }

  const props = defineProps<StatisticsMomentumSummaryProps>();

  const metricViewsById = computed(() => {
    const result = new Map<string, StatisticCardMetricDefinition>();

    props.overview.forEach((executable) => {
      const metric = executable.toView();
      result.set(metric.id, metric);
    });

    return result;
  });

  const applicationsCreatedMetric = computed(() =>
    metricViewsById.value.get("applicationsCreatedLast30Days"),
  );

  const applicationsAppliedMetric = computed(() =>
    metricViewsById.value.get("applicationsAppliedLast30Days"),
  );

  const createdTrendValue = computed(
    () => applicationsCreatedMetric.value?.trendValue ?? "0%",
  );

  const appliedTrendValue = computed(
    () => applicationsAppliedMetric.value?.trendValue ?? "0%",
  );
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
        applicationsCreatedMetric?.value ?? 0
      }}</span>
      ({{ createdTrendValue }} vs previous 30 days)
    </p>
    <p class="mt-2 flex items-center gap-2">
      <Icon name="heroicons:calendar" class="h-4 w-4 text-surface-500" />
      <span>Applications applied:</span>
      <span class="font-semibold">{{
        applicationsAppliedMetric?.value ?? 0
      }}</span>
      ({{ appliedTrendValue }} vs previous 30 days)
    </p>
  </div>
</template>
