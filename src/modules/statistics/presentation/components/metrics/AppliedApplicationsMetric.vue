<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";

  interface AppliedApplicationsMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<AppliedApplicationsMetricProps>();
</script>

<template>
  <StatisticCard
    title="Applied applications"
    :value="overview.totalAppliedApplications"
    description="Applications currently in applied stage"
    icon="heroicons:paper-airplane"
    tone="default"
  />
</template>
