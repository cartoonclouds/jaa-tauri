<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";

  interface OffersMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<OffersMetricProps>();
</script>

<template>
  <StatisticCard
    title="Offers"
    :value="overview.totalOffers"
    description="Current opportunities at offer stage"
    icon="heroicons:star"
    tone="success"
  />
</template>
