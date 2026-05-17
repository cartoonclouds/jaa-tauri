<script setup lang="ts">
  import { onMounted } from "vue";
  import { checkForUpdates } from "@modules/updates";

  onMounted(async () => {
    await checkForUpdates();
  });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <Toast />
  </NuxtLayout>
</template>
