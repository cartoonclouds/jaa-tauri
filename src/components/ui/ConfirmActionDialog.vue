<script setup lang="ts">
  interface Props {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmSeverity?:
      | "secondary"
      | "success"
      | "info"
      | "warn"
      | "help"
      | "danger"
      | "contrast";
    busy?: boolean;
    widthClass?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    confirmSeverity: "danger",
    busy: false,
    widthClass: "w-full! max-w-md",
  });

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    confirm: [];
    cancel: [];
  }>();

  function onCancel(): void {
    emit("cancel");
    emit("update:visible", false);
  }

  function onConfirm(): void {
    emit("confirm");
  }
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="title"
    :class="widthClass"
    @update:visible="emit('update:visible', $event)"
  >
    <p class="text-sm text-surface-700">
      {{ message }}
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          :label="cancelLabel"
          severity="secondary"
          text
          :disabled="busy"
          @click="onCancel"
        />
        <Button
          type="button"
          :label="confirmLabel"
          :severity="confirmSeverity"
          :loading="busy"
          @click="onConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>
