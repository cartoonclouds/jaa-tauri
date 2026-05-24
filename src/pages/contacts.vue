<script setup lang="ts">
  import { onMounted } from "vue";

  import { definePageMeta, useRouter } from "#imports";
  import { useContactsModal } from "@/composables/useContactsModal";

  definePageMeta({ ssr: false });

  const router = useRouter();
  const { openContactsModal } = useContactsModal();

  onMounted(() => {
    openContactsModal();
    void router.replace("/");
  });
</script>

<template>
  <div class="p-6 text-sm text-flow-muted">Opening contacts...</div>
</template>
