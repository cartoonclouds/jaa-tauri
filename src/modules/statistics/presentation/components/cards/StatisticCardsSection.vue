<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/cards/StatisticCard.vue";
  import { statisticMetricDefinitions } from "@modules/statistics/presentation/utils/statisticMetricUtils";

  /**
   * Defines statistic cards section props.
   */
  interface StatisticCardsSectionProps {
    overview: StatisticsOverview;
  }

  defineProps<StatisticCardsSectionProps>();
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatisticCard
      v-for="metric in statisticMetricDefinitions"
      :key="metric.id"
      :title="metric.title"
      :value="metric.value(overview)"
      :description="metric.description"
      :icon="metric.icon"
      :tone="metric.tone"
      :suffix="metric.suffix ?? ''"
      :trend-label="metric.trendLabel ?? ''"
      :trend-value="metric.trendValue ? metric.trendValue(overview) : ''"
      :trend-tone="metric.trendTone ? metric.trendTone(overview) : 'neutral'"
    />
  </div>
</template>









