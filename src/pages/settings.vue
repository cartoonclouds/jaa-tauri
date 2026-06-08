<script setup lang="ts">
  import { onMounted } from "vue";

  import { useRouter } from "#imports";
  import { useSettingsDialog } from "@/composables/useSettingsDialog";

  const router = useRouter();

  const { openSettingsDialog } = useSettingsDialog();

  onMounted(() => {
    openSettingsDialog();
    void router.replace("/");
  });
</script>

<template>
  <div class="p-6 text-sm text-flow-muted">Opening settings...</div>
</template>
