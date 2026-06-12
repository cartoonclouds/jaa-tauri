<script setup lang="ts">
  interface Props {
    contactName: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    confirm: [];
  }>();
  const visible = defineModel<boolean>("visible", { required: true });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :block-scroll="true"
    :draggable="true"
    header="Remove Contact"
    class="w-full max-w-md"
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
