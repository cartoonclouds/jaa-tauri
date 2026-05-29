<script setup lang="ts">
  import type { InteractionStage } from "@modules/events/constants";

  import { computed } from "vue";

  interface Props {
    visible: boolean;
    eventType: InteractionStage | "";
    title: string;
    description: string;
    isSaving: boolean;
    errorMessage: string;
    mutedTextStyle: Record<string, string>;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    "update:eventType": [value: InteractionStage | ""];
    "update:title": [value: string];
    "update:description": [value: string];
    save: [];
    delete: [];
  }>();

  const visibleModel = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const typeModel = computed({
    get: () => props.eventType,
    set: (value: InteractionStage | "") => {
      emit("update:eventType", value);
    },
  });

  const titleModel = computed({
    get: () => props.title,
    set: (value: string) => {
      emit("update:title", value);
    },
  });

  const descriptionModel = computed({
    get: () => props.description,
    set: (value: string) => {
      emit("update:description", value);
    },
  });
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Edit interaction"
    :style="{ width: '38rem' }"
    :breakpoints="{ '1199px': '70vw', '575px': '95vw' }"
  >
    <Message v-if="errorMessage" severity="error" class="mb-4">
      {{ errorMessage }}
    </Message>

    <div class="grid gap-3 md:grid-cols-2">
      <div class="space-y-1 md:col-span-2">
        <label
          class="text-sm font-medium"
          :style="mutedTextStyle"
          for="edit-event-type"
        >
          Interaction stage
        </label>
        <InputText
          id="edit-event-type"
          v-model="typeModel"
          fluid
          list="interaction-stage-options"
          placeholder="Interview/Technical"
        />
      </div>

      <div class="space-y-1 md:col-span-2">
        <label
          class="text-sm font-medium"
          :style="mutedTextStyle"
          for="edit-event-title"
        >
          Title
        </label>
        <InputText id="edit-event-title" v-model="titleModel" fluid />
      </div>

      <div class="space-y-1 md:col-span-2">
        <label
          class="text-sm font-medium"
          :style="mutedTextStyle"
          for="edit-event-description"
        >
          Description
        </label>
        <Textarea
          id="edit-event-description"
          v-model="descriptionModel"
          fluid
          auto-resize
          rows="3"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex w-full justify-between gap-2">
        <Button
          type="button"
          severity="danger"
          outlined
          label="Delete"
          :loading="isSaving"
          @click="emit('delete')"
        />
        <div class="flex gap-2">
          <Button
            type="button"
            severity="secondary"
            label="Cancel"
            :disabled="isSaving"
            @click="visibleModel = false"
          />
          <Button
            type="button"
            label="Save"
            :loading="isSaving"
            @click="emit('save')"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>
