<script setup lang="ts">
  import { onMounted } from "vue";

  import { definePageMeta, useRouter } from "#imports";
  import { useCompaniesDialog } from "@/composables/useCompaniesDialog";

  definePageMeta({ ssr: false });

  const router = useRouter();

  const { openCompaniesDialog } = useCompaniesDialog();

  onMounted(() => {
    openCompaniesDialog();
    void router.replace("/");
  });
</script>

<template>
  <div class="p-6 text-sm text-flow-muted">Opening companies...</div>
</template>
