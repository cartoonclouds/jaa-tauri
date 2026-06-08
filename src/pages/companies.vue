<script setup lang="ts">
  import { onMounted } from "vue";

  import { useRouter } from "#imports";
  import { useCompaniesDialog } from "@/composables/useCompaniesDialog";

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
