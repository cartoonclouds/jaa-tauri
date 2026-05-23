<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";

  interface TotalApplicationsMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<TotalApplicationsMetricProps>();
</script>

<template>
  <StatisticCard
    title="Total applications"
    :value="overview.totalApplications"
    description="All active records in your tracker"
    icon="heroicons:briefcase"
    tone="info"
  />
</template>
