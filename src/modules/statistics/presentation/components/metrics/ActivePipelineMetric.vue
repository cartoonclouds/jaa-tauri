<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";

  interface ActivePipelineMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<ActivePipelineMetricProps>();
</script>

<template>
  <StatisticCard
    title="Active pipeline"
    :value="overview.activePipelineApplications"
    description="Open opportunities excluding offer/rejected"
    icon="heroicons:queue-list"
    tone="success"
  />
</template>
