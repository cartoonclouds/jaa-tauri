<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";

  interface RejectionRateMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<RejectionRateMetricProps>();
</script>

<template>
  <StatisticCard
    title="Rejection rate"
    :value="overview.rejectionRate"
    suffix="%"
    description="Rejections as a share of applied applications"
    icon="heroicons:chart-bar"
    tone="danger"
  />
</template>
