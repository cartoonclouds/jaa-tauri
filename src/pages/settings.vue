<script setup lang="ts">
  import { onMounted } from "vue";

  import { definePageMeta, useRouter } from "#imports";
  import { useSettingsDialog } from "@/composables/useSettingsDialog";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  const router = useRouter();

  const { openSettingsDialog } = useSettingsDialog();

  onMounted(() => {
    openSettingsDialog();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    void router.replace("/");
  });
</script>

<template>
  <div class="p-6 text-sm text-flow-muted">Opening settings...</div>
</template>
