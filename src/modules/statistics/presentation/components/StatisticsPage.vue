<script setup lang="ts">
  import StatisticsSection from "@modules/statistics/presentation/components/StatisticsSection.vue";

  import { definePageMeta } from "#imports";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });
</script>

<template>
  <div class="p-6">
    <StatisticsSection />
  </div>
</template>



