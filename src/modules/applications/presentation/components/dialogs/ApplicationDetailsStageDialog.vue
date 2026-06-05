<script setup lang="ts">
  import {
    INTERACTION_STAGES,
    type InteractionStage,
  } from "@modules/events/constants";
  import { computed } from "vue";

  interface Props {
    visible: boolean;
    mode: "create" | "edit";
    stageType: InteractionStage;
    isMutatingEvent: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    "update:stageType": [value: InteractionStage];
    save: [];
  }>();

  const visibleModel = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const stageTypeModel = computed({
    get: () => props.stageType,
    set: (value: InteractionStage) => {
      emit("update:stageType", value);
    },
  });

  const dialogHeader = computed(() =>
    props.mode === "create" ? "Add Flow Step" : "Edit Flow Step",
  );

  const saveLabel = computed(() =>
    props.mode === "create" ? "Add Step" : "Save",
  );
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :header="dialogHeader"
    class="w-full! max-w-lg"
  >
    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium text-surface-700">Stage</label>
        <Select
          v-model="stageTypeModel"
          :options="[...INTERACTION_STAGES]"
          fluid
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          text
          :disabled="isMutatingEvent"
          @click="visibleModel = false"
        />
        <Button
          type="button"
          :label="saveLabel"
          :loading="isMutatingEvent"
          @click="emit('save')"
        />
      </div>
    </template>
  </Dialog>
</template>
