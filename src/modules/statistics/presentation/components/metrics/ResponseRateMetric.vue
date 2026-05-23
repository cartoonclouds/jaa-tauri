<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";
  import {
    toTrendPointLabel,
    toTrendTone,
  } from "@modules/statistics/presentation/utils/statisticCardUtils";

  interface ResponseRateMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<ResponseRateMetricProps>();
</script>

<template>
  <StatisticCard
    title="Response rate"
    :value="overview.responseRate"
    suffix="%"
    description="Interview or final outcome after applying"
    icon="heroicons:presentation-chart-line"
    tone="success"
    :trend-value="toTrendPointLabel(overview.responseRateDeltaPercent)"
    trend-label="vs previous 30-day response rate"
    :trend-tone="toTrendTone(overview.responseRateDeltaPercent)"
  />
</template>
