<script setup lang="ts">
  import { onMounted } from "vue";

  import { definePageMeta, useRouter } from "#imports";
  import { useCompaniesDialog } from "@/composables/useCompaniesDialog";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const router = useRouter();

  const { openCompaniesDialog } = useCompaniesDialog();

  onMounted(() => {
    openCompaniesDialog();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    void router.replace("/");
  });
</script>

<template>
  <div class="p-6 text-sm text-flow-muted">Opening companies...</div>
</template>
