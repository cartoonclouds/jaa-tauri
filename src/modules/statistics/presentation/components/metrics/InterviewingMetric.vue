<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import StatisticCard from "@modules/statistics/presentation/components/StatisticCard.vue";

  interface InterviewingMetricProps {
    overview: StatisticsOverview;
  }

  defineProps<InterviewingMetricProps>();
</script>

<template>
  <StatisticCard
    title="Interviewing"
    :value="overview.totalInterviewingApplications"
    description="Phone screening, technical, and interview"
    icon="heroicons:chat-bubble-left-right"
    tone="warning"
  />
</template>
