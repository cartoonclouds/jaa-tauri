<script setup lang="ts">
  import { onMounted } from "vue";

  import { definePageMeta, useRouter } from "#imports";
  import { useCompaniesModal } from "@/composables/useCompaniesModal";

  definePageMeta({ ssr: false });

  const router = useRouter();
  const { openCompaniesModal } = useCompaniesModal();

  onMounted(() => {
    openCompaniesModal();
    void router.replace("/");
  });
</script>

<template>
  <div class="p-6 text-sm text-flow-muted">Opening companies...</div>
</template>
