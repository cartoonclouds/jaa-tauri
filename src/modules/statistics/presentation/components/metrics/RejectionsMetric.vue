<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";

  interface RejectionsMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<RejectionsMetricProps>();
</script>

<template>
  <StatisticCard
    title="Rejections"
    :value="overview.totalRejectedApplications"
    description="Applications closed as rejected"
    icon="heroicons:x-circle"
    tone="danger"
  />
</template>
