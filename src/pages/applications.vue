<script setup lang="ts">
  import ApplicationComponent from "@modules/applications/presentation/components/Application.vue";

  import { definePageMeta } from "#imports";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });
</script>

<template>
  <ApplicationComponent />
</template>
