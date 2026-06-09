<script setup lang="ts">
  import ApplicationComponent from "@modules/applications/presentation/components/Application.vue";
  import { computed } from "vue";

  import { useRoute } from "#imports";

  const route = useRoute();
  const initialApplicationId = computed(() =>
    typeof route.query.applicationId === "string"
      ? route.query.applicationId
      : null,
  );
</script>

<template>
  <ApplicationComponent :initial-application-id="initialApplicationId" />
</template>
