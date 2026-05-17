/** * Example: Notification Demo Component * * This component demonstrates how
to use the notifications module * in a Vue component. Copy and adapt for your
own use cases. */

<template>
  <div class="space-y-4 p-4">
    <div v-if="!isSupported" class="rounded bg-yellow-100 p-3">
      <p class="text-sm text-yellow-800">
        Notifications are not supported in this environment.
      </p>
    </div>

    <div v-else class="space-y-2">
      <h3 class="text-lg font-semibold">Notification Examples</h3>

      <button
        @click="sendInfoExample"
        :disabled="isLoading"
        class="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
      >
        Info Notification
      </button>

      <button
        @click="sendSuccessExample"
        :disabled="isLoading"
        class="rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
      >
        Success Notification
      </button>

      <button
        @click="sendWarningExample"
        :disabled="isLoading"
        class="rounded bg-amber-500 px-4 py-2 text-white disabled:opacity-50"
      >
        Warning Notification
      </button>

      <button
        @click="sendErrorExample"
        :disabled="isLoading"
        class="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
      >
        Error Notification
      </button>

      <button
        @click="sendCustomExample"
        :disabled="isLoading"
        class="rounded bg-purple-500 px-4 py-2 text-white disabled:opacity-50"
      >
        Custom Notification
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useNotification } from "@modules/notifications";

  const { info, success, warning, error, send, isSupported, isLoading } =
    useNotification();

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
