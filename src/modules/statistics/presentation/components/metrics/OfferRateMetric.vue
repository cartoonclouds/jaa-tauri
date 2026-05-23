<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";
  import {
    toTrendPointLabel,
    toTrendTone,
  } from "@modules/statistics/presentation/utils/statisticCard.utils";

  interface OfferRateMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<OfferRateMetricProps>();
</script>

<template>
  <StatisticCard
    title="Offer rate"
    :value="overview.offerRate"
    suffix="%"
    description="Offers as a share of applied applications"
    icon="heroicons:hand-thumb-up"
    tone="success"
    :trend-value="toTrendPointLabel(overview.offerRateDeltaPercent)"
    trend-label="vs previous 30-day offer rate"
    :trend-tone="toTrendTone(overview.offerRateDeltaPercent)"
  />
</template>
