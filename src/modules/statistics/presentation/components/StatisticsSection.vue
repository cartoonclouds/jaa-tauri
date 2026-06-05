<script setup lang="ts">
  import { useStatistic } from "@modules/statistics/composables/useStatistic";
  import StatisticCardsSection from "@modules/statistics/presentation/components/cards/StatisticCardsSection.vue";

  import StatisticsMomentumSummary from "./StatisticsMomentumSummary.vue";

  /**
   * Defines statistics section props.
   */
  interface StatisticsSectionProps {
    title?: string;
  }

  withDefaults(defineProps<StatisticsSectionProps>(), {
    title: "Statistics",
  });

  const { overview } = useStatistic();
</script>

<template>
  <section class="space-y-6">
    <StatisticCardsSection :overview="overview" />
    <StatisticsMomentumSummary :overview="overview" />
  </section>
</template>
