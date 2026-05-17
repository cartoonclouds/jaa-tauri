<script setup lang="ts">
  import { useNotification } from "@modules/notifications";

  const { success, error, warning } = useNotification();

  async function saveData() {
    try {
      // ... save logic
      await success("Saved!", "Your data has been saved");
    } catch (err) {
      await error("Save Failed", "Could not save your data");
    }
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
        class="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
      >
        <Icon name="heroicons:computer-desktop" />

        Device detection {{ $device.isMobile ? "Mobile" : "Desktop" }}
      </p>

      <button @click="saveData">Save Data</button>
    </div>
  </main>
</template>
