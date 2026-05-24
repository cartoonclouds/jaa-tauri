<script setup lang="ts">
  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

  interface Props {
    contactName: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    confirm: [];
  }>();
  const visible = defineModel<boolean>("visible", { required: true });

  useBodyScrollLock(visible);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Remove Contact"
    class="w-full! max-w-md"
  >
    <p class="text-sm text-surface-700">
      Remove
      <span class="font-semibold">{{
        props.contactName || "this contact"
      }}</span>
      from this application?
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          severity="secondary"
          text
          label="Cancel"
          @click="visible = false"
        />
        <Button
          type="button"
          severity="danger"
          label="Remove"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </Dialog>
</template>
