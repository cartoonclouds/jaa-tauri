<script setup lang="ts">
  import {
    INTERACTION_STAGES,
    type InteractionStage,
  } from "@modules/events/constants";
  import { computed } from "vue";

  import NotesMarkdownEditor from "@/components/ui/NotesMarkdownEditor.client.vue";

  interface Props {
    visible: boolean;
    stageType: InteractionStage;
    eventAt: Date | null;
    notes: string;
    selectedStageEventId: string | null;
    isMutatingEvent: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    "update:stageType": [value: InteractionStage];
    "update:eventAt": [value: Date | null];
    "update:notes": [value: string];
    save: [];
    "request-delete": [];
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

  const eventAtModel = computed({
    get: () => props.eventAt,
    set: (value: Date | null) => {
      emit("update:eventAt", value);
    },
  });

  const notesModel = computed({
    get: () => props.notes,
    set: (value: string) => {
      emit("update:notes", value);
    },
  });
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Edit Flow Step"
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

      <div class="space-y-1">
        <label class="text-sm font-medium text-surface-700"
          >Event Date/Time</label
        >
        <DatePicker
          v-model="eventAtModel"
          show-time
          hour-format="24"
          show-icon
          show-clear
          fluid
        />
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-surface-700">Stage Notes</label>
        <p class="text-xs text-surface-500">Stored as Markdown.</p>
        <NotesMarkdownEditor
          v-model="notesModel"
          editor-style="height: 10rem"
          placeholder="Write stage notes in Markdown..."
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <Button
          v-if="selectedStageEventId"
          type="button"
          label="Delete"
          severity="danger"
          text
          :disabled="isMutatingEvent"
          class="mr-auto"
          @click="emit('request-delete')"
        />
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
          label="Save"
          :loading="isMutatingEvent"
          @click="emit('save')"
        />
      </div>
    </template>
  </Dialog>
</template>
