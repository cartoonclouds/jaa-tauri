<script setup lang="ts">
  import { onMounted } from "vue";

  import { definePageMeta, useRouter } from "#imports";
  import { useSettingsModal } from "@/composables/useSettingsModal";

  definePageMeta({ ssr: false });

  const router = useRouter();
  const { openSettingsModal } = useSettingsModal();

  onMounted(() => {
    openSettingsModal();
    void router.replace("/");
  });
</script>

<template>
  <div class="p-6 text-sm text-flow-muted">Opening settings...</div>
</template>



