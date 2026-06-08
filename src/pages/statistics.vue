<script setup lang="ts">
  import StatisticsPage from "@modules/statistics/presentation/components/StatisticsPage.vue";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });
</script>

<template>
  <StatisticsPage />
</template>
