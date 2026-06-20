<script setup lang="ts">
  import { useInsight } from "@modules/insights/composables/useInsight";
  import InsightCardsSection from "@modules/insights/presentation/components/cards/InsightCardsSection.vue";

  import InsightsMomentumSummary from "./InsightsMomentumSummary.vue";

  /**
   * Defines insights section props.
   */
  interface InsightsSectionProps {
    title?: string;
  }

  withDefaults(defineProps<InsightsSectionProps>(), {
    title: "Insights",
  });

  const { overview } = useInsight();
</script>

<template>
  <section class="space-y-6">
    <InsightCardsSection :overview="overview" />
    <InsightsMomentumSummary :overview="overview" />
  </section>
</template>

