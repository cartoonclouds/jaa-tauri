<script setup lang="ts">
  import { useApplicationsQuery } from "@modules/applications/queries/applicationQueries";
  import { useApplicationUiStore } from "@modules/applications/stores/applicationUiStore";

  const { data: applications, asyncStatus, error } = useApplicationsQuery();
  const ui = useApplicationUiStore();
</script>

<template>
  <section class="p-6 space-y-4">
    <header>
      <h1 class="text-2xl font-semibold">Applications</h1>
      <p class="text-sm opacity-70">
        DDD module scaffold with CRUD-ready query layer.
      </p>
    </header>

    <Message v-if="error" severity="error">
      {{ error?.message || "Unable to load applications." }}
    </Message>

    <ProgressSpinner
      v-if="asyncStatus === 'loading'"
      style="width: 28px; height: 28px"
    />

    <ul v-else class="space-y-2">
      <li
        v-for="application in applications || []"
        :key="application.id"
        class="border rounded px-3 py-2 cursor-pointer hover:bg-surface-100"
        @click="ui.selectApplication(application.id)"
      >
        <p class="font-medium">{{ application.jobTitle }}</p>
        <p class="text-sm opacity-70">
          {{ application.companyNameSnapshot }} • {{ application.status }}
        </p>
      </li>
    </ul>
  </section>
</template>
