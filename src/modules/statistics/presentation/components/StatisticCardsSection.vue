<script setup lang="ts">
  import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

  import ActivePipelineMetric from "@modules/statistics/presentation/components/metrics/ActivePipelineMetric.vue";
  import AppliedApplicationsMetric from "@modules/statistics/presentation/components/metrics/AppliedApplicationsMetric.vue";
  import AppliedLast30DaysMetric from "@modules/statistics/presentation/components/metrics/AppliedLast30DaysMetric.vue";
  import CreatedLast30DaysMetric from "@modules/statistics/presentation/components/metrics/CreatedLast30DaysMetric.vue";
  import InterviewingMetric from "@modules/statistics/presentation/components/metrics/InterviewingMetric.vue";
  import OfferRateMetric from "@modules/statistics/presentation/components/metrics/OfferRateMetric.vue";
  import OffersMetric from "@modules/statistics/presentation/components/metrics/OffersMetric.vue";
  import RejectionRateMetric from "@modules/statistics/presentation/components/metrics/RejectionRateMetric.vue";
  import RejectionsMetric from "@modules/statistics/presentation/components/metrics/RejectionsMetric.vue";
  import ResponseRateMetric from "@modules/statistics/presentation/components/metrics/ResponseRateMetric.vue";
  import TotalApplicationsMetric from "@modules/statistics/presentation/components/metrics/TotalApplicationsMetric.vue";

  interface StatisticCardsSectionProps {
    overview: StatisticsOverview;
  }

  defineProps<StatisticCardsSectionProps>();
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <TotalApplicationsMetric :overview="overview" />
    <AppliedApplicationsMetric :overview="overview" />
    <ActivePipelineMetric :overview="overview" />
    <InterviewingMetric :overview="overview" />
    <OffersMetric :overview="overview" />
    <RejectionsMetric :overview="overview" />
    <CreatedLast30DaysMetric :overview="overview" />
    <AppliedLast30DaysMetric :overview="overview" />
    <ResponseRateMetric :overview="overview" />
    <OfferRateMetric :overview="overview" />
    <RejectionRateMetric :overview="overview" />
  </div>
</template>
