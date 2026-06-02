<script setup lang="ts">
  import { useStatistic } from "@modules/statistics/composables/useStatistic";
  import StatisticCardsSection from "@modules/statistics/presentation/components/cards/StatisticCardsSection.vue";

  import { Icon } from "#components";

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

  const { overview, isLoading, refresh } = useStatistic();
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-2xl font-semibold">{{ title }}</h2>
      <Button label="Refresh" :loading="isLoading" @click="refresh">
        <template #icon>
          <Icon name="heroicons:arrow-path" class="h-4 w-4" />
        </template>
      </Button>
    </div>

    <StatisticCardsSection :overview="overview" />
    <StatisticsMomentumSummary :overview="overview" />
  </section>
</template>
