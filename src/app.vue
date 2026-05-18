<script setup lang="ts">
  import { checkForUpdates } from "@modules/updates";
  import { initializeSettingsStore } from "@shared/settings";
  import {
    BaseDirectory,
    readTextFile,
    writeTextFile,
  } from "@tauri-apps/plugin-fs";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { onBeforeUnmount, onMounted } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import { setupNativeContextMenu } from "@/composables/useNativeContextMenu";

  let cleanupContextMenu: (() => void | Promise<void>) | null = null;

  const open = async (url: string) => {
    try {
      await openUrl(url);
      console.log(`Opened URL: ${url}`);
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  const readFile = async (filePath: string) => {
    try {
      const content = await readTextFile(filePath, {
        baseDir: BaseDirectory.Home,
      });
      console.log("File content:", content);
    } catch (error) {
      console.error("Failed to read file:", error);
    }
  };

  const writeFile = async (filePath: string, content: string) => {
    try {
      await writeTextFile(filePath, content, {
        baseDir: BaseDirectory.Home,
      });
      console.log("File written successfully:", filePath);
    } catch (error) {
      console.error("Failed to write file:", error);
    }
  };

  onMounted(async () => {
    // Initialize app settings from Tauri Store
    try {
      await initializeSettingsStore();
    } catch (error) {
      console.error("Failed to initialize settings:", error);
    }

    cleanupContextMenu = await setupNativeContextMenu();
    await checkForUpdates();
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
