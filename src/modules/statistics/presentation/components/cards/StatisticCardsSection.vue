<script setup lang="ts">
  import type { IMetric } from "@/modules/statistics/domain/types/metric.js";
  import type { StatisticCardMetricDefinition } from "@/modules/statistics/domain/types/statistic.js";

  import { computed } from "vue";

  import StatisticCard from "./StatisticCard.vue";

  /**
   * Defines statistic cards section props.
   */
  interface StatisticCardsSectionProps {
    overview: IMetric[];
  }

  const props = defineProps<StatisticCardsSectionProps>();

  const metricViews = computed<StatisticCardMetricDefinition[]>(() => {
    return props.overview.map(
      (executable: IMetric): StatisticCardMetricDefinition => {
        return executable.toView();
      },
    );
  });
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatisticCard
      v-for="metric in metricViews"
      :key="metric.id"
      :title="metric.title"
      :value="metric.value"
      :description="metric.description"
      :icon="metric.icon"
      :tone="metric.tone"
      :suffix="metric.suffix ?? ''"
      :trend-label="metric.trendLabel ?? ''"
      :trend-value="metric.trendValue ?? ''"
      :trend-tone="metric.trendTone ?? 'neutral'"
    />
  </div>
</template>
