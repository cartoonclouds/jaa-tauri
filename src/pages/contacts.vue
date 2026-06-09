<script setup lang="ts">
  import { onMounted } from "vue";

  import { useRoute, useRouter } from "#imports";
  import { useContactsDialog } from "@/composables/useContactsDialog";

  const route = useRoute();
  const router = useRouter();

  const { openContactsDialog } = useContactsDialog();

  onMounted(() => {
    const contactId =
      typeof route.query.contactId === "string" ? route.query.contactId : null;

    openContactsDialog(contactId);

    void router.replace("/");
  });
</script>

<template>
  <div class="p-6 text-sm text-flow-muted">Opening contacts...</div>
</template>
