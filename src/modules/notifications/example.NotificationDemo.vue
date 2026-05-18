<script setup lang="ts">
  import { useNotification } from "@modules/notifications";

  const {
    info,
    success,
    warning,
    error,
    send,
    isSupported,
    isLoading,
    showWindowsDevToastNotice,
  } = useNotification();

  async function sendInfoExample() {
    await info("Information", "This is an info notification");
  }

  async function sendSuccessExample() {
    await success("Success!", "Operation completed successfully");
  }

  async function sendWarningExample() {
    await warning("Warning", "This is a warning notification");
  }

  async function sendErrorExample() {
    await error("Error Occurred", "Something went wrong");
  }

  async function sendCustomExample() {
    await send({
      title: "Custom Notification",
      body: "This is a custom notification with all available properties",
      icon: "/icons/app.png",
      tag: "custom-example",
    });
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <div
      v-if="showWindowsDevToastNotice"
      class="rounded border border-amber-500/40 bg-amber-500/10 p-3"
    >
      <p class="text-sm text-amber-200">
        Windows dev mode may show notifications in Notification Center only.
        Install a built app to validate native popup toast banners.
      </p>
    </div>

    <div v-if="!isSupported" class="rounded bg-yellow-100 p-3">
      <p class="text-sm text-yellow-800">
        Notifications are not supported in this environment.
      </p>
    </div>

    <div v-else class="space-y-2">
      <h3 class="text-lg font-semibold">Notification Examples</h3>

      <button
        class="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        :disabled="isLoading"
        @click="sendInfoExample"
      >
        Info Notification
      </button>

      <button
        class="rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
        :disabled="isLoading"
        @click="sendSuccessExample"
      >
        Success Notification
      </button>

      <button
        class="rounded bg-amber-500 px-4 py-2 text-white disabled:opacity-50"
        :disabled="isLoading"
        @click="sendWarningExample"
      >
        Warning Notification
      </button>

      <button
        class="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
        :disabled="isLoading"
        @click="sendErrorExample"
      >
        Error Notification
      </button>

      <button
        class="rounded bg-purple-500 px-4 py-2 text-white disabled:opacity-50"
        :disabled="isLoading"
        @click="sendCustomExample"
      >
        Custom Notification
      </button>
    </div>
  </div>
</template>
