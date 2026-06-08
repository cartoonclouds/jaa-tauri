<script setup lang="ts">
  import { onMounted } from "vue";

  import { definePageMeta, useRouter } from "#imports";
  import { useContactsDialog } from "@/composables/useContactsDialog";

  definePageMeta({ ssr: false });

  const router = useRouter();

  const { openContactsDialog } = useContactsDialog();

  onMounted(() => {
    openContactsDialog();

    void router.replace("/");
  });
</script>

<template>
  <div class="p-6 text-sm text-flow-muted">Opening contacts...</div>
</template>
