<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";
  import {
    toTrendPercentLabel,
    toTrendTone,
  } from "@modules/statistics/presentation/utils/statisticCardUtils";

  interface CreatedLast30DaysMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<CreatedLast30DaysMetricProps>();
</script>

<template>
  <StatisticCard
    title="Created last 30 days"
    :value="overview.applicationsCreatedLast30Days"
    description="New opportunities added this month"
    icon="heroicons:calendar-days"
    tone="info"
    :trend-value="toTrendPercentLabel(overview.applicationsCreatedDeltaPercent)"
    trend-label="vs previous 30 days"
    :trend-tone="toTrendTone(overview.applicationsCreatedDelta30Days)"
  />
</template>
