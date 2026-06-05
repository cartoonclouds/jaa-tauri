<script setup lang="ts">
  import { computed } from "vue";

  /**
   * Reusable shell for create/edit dialogs.
   *
   * Usage patterns:
   * - Form submit mode: pass `saveFormId` and place your `<Form id="...">` in the default slot.
   * - Imperative save mode: omit `saveFormId` and handle the `save` event.
   * - Optional delete action: set `showDelete` and handle the `delete` event.
   */
  interface Props {
    visible: boolean;
    mode: "create" | "edit";
    createTitle: string;
    editTitle: string;
    createSaveLabel?: string;
    editSaveLabel?: string;
    cancelLabel?: string;
    deleteLabel?: string;
    showDelete?: boolean;
    isSaving?: boolean;
    saveFormId?: string;
    widthClass?: string;
    dialogStyle?: Record<string, string>;
    breakpoints?: Record<string, string>;
  }

  const props = withDefaults(defineProps<Props>(), {
    createSaveLabel: "Create",
    editSaveLabel: "Save",
    cancelLabel: "Cancel",
    deleteLabel: "Delete",
    showDelete: false,
    isSaving: false,
    saveFormId: "",
    widthClass: "w-full! max-w-lg",
    dialogStyle: () => ({}),
    breakpoints: () => ({}),
  });

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    save: [];
    delete: [];
  }>();

  const visibleModel = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const dialogHeader = computed(() =>
    props.mode === "create" ? props.createTitle : props.editTitle,
  );

  const saveLabel = computed(() =>
    props.mode === "create" ? props.createSaveLabel : props.editSaveLabel,
  );

  function onSaveClick(): void {
    if (props.saveFormId) {
      return;
    }

    emit("save");
  }
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :header="dialogHeader"
    :class="widthClass"
    :style="dialogStyle"
    :breakpoints="breakpoints"
  >
    <slot />

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <Button
          v-if="showDelete"
          type="button"
          :label="deleteLabel"
          severity="danger"
          text
          :disabled="isSaving"
          class="mr-auto"
          @click="emit('delete')"
        />
        <Button
          type="button"
          :label="cancelLabel"
          severity="secondary"
          text
          :disabled="isSaving"
          @click="visibleModel = false"
        />
        <Button
          :type="saveFormId ? 'submit' : 'button'"
          :form="saveFormId || undefined"
          :label="saveLabel"
          :loading="isSaving"
          @click="onSaveClick"
        />
      </div>
    </template>
  </Dialog>
</template>
