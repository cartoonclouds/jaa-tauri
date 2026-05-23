<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";
  import {
    toTrendPercentLabel,
    toTrendTone,
  } from "@modules/statistics/presentation/utils/statisticCardUtils";

  interface AppliedLast30DaysMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<AppliedLast30DaysMetricProps>();
</script>

<template>
  <StatisticCard
    title="Applied last 30 days"
    :value="overview.applicationsAppliedLast30Days"
    description="Recent application cadence"
    icon="heroicons:calendar"
    tone="info"
    :trend-value="toTrendPercentLabel(overview.applicationsAppliedDeltaPercent)"
    trend-label="vs previous 30 days"
    :trend-tone="toTrendTone(overview.applicationsAppliedDelta30Days)"
  />
</template>
