<script setup lang="ts">
  import { useStatistic } from "@modules/statistics/presentation/composables/useStatistic";

  import { definePageMeta } from "#imports";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  const { overview, isLoading, refresh } = useStatistic();
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Statistics</h1>

    <div
      class="rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm"
    >
      <p class="text-sm text-surface-500">Total applied applications</p>
      <p class="mt-2 text-4xl font-semibold text-surface-900">
        {{ overview.totalAppliedApplications }}
      </p>
      <div class="mt-4">
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          :loading="isLoading"
          @click="refresh"
        />
      </div>
    </div>
  </div>
</template>
