<script setup lang="ts">
  import ApplicationComponent from "@modules/applications/presentation/components/Application.vue";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });
</script>

<template>
  <ApplicationComponent />
</template>
