<script setup lang="ts">
  import { onBeforeUnmount, onMounted } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import { setupNativeContextMenu } from "@/composables/useNativeContextMenu";

  let cleanupContextMenu: (() => void | Promise<void>) | null = null;

  onMounted(async () => {
    cleanupContextMenu = await setupNativeContextMenu();
  });

  onBeforeUnmount(async () => {
    if (cleanupContextMenu) {
      await cleanupContextMenu();
      cleanupContextMenu = null;
    }
  });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <Toast />
  </NuxtLayout>
</template>
