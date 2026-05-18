<script setup lang="ts">
  import { useNotification } from "@modules/notifications";
  import { useUpdateChecker } from "@modules/updates";

  import { Icon } from "#components";

  const { success, error, showWindowsDevToastNotice } = useNotification();
  const { check, isChecking, lastResult } = useUpdateChecker();

  async function saveData() {
    try {
      // ... save logic
      await success("Saved!", "Your data has been saved");
    } catch {
      await error("Save Failed", "Could not save your data");
    }
  }

  async function checkForAppUpdates() {
    await check();
  }
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
    <div class="mx-auto max-w-3xl space-y-6">
      <h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight">
        <Icon name="heroicons:briefcase" class="text-emerald-400" />
        Job Application Auditor
      </h1>

      <p class="text-slate-300">Nuxt + Tauri is running correctly.</p>

      <p
        v-if="showWindowsDevToastNotice"
        class="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
      >
        Windows dev mode may send notifications to Notification Center only.
        Build and install the app to validate native popup toast banners.
      </p>

      <p
        class="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
      >
        <Icon name="heroicons:computer-desktop" />

        Device detection {{ $device.isMobile ? "Mobile" : "Desktop" }}
      </p>

      <div class="flex flex-wrap gap-3">
        <button @click="saveData">Save Data</button>
        <button :disabled="isChecking" @click="checkForAppUpdates">
          {{ isChecking ? "Checking..." : "Check for Updates" }}
        </button>
      </div>

      <p v-if="lastResult?.hasUpdate" class="text-sm text-emerald-300">
        Update available: {{ lastResult.update?.version }}
      </p>
      <p v-else-if="lastResult?.error" class="text-sm text-rose-300">
        Update check failed: {{ lastResult.error }}
      </p>
      <p
        v-else-if="lastResult && !lastResult.hasUpdate"
        class="text-sm text-slate-300"
      >
        You're up to date.
      </p>
    </div>
  </main>
</template>
