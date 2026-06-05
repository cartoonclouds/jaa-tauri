<script setup lang="ts">
  import {
    INTERACTION_STAGES,
    type InteractionStage,
  } from "@modules/events/constants";
  import { computed } from "vue";

  import CreateEditDialog from "@/components/ui/CreateEditDialog.vue";
  import NotesMarkdownEditor from "@/components/ui/NotesMarkdownEditor.client.vue";
  import { useCreateEditModeByFlag } from "@/composables/useCreateEditMode";

  interface Props {
    visible: boolean;
    mode?: "create" | "edit";
    stageType: InteractionStage;
    eventAt?: Date | null;
    notes?: string;
    showDetails?: boolean;
    selectedStageEventId?: string | null;
    isMutatingEvent: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: "edit",
    eventAt: null,
    notes: "",
    showDetails: false,
    selectedStageEventId: null,
  });

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

  const isDetailedMode = computed(() => props.showDetails);
  const { dialogMode: baseDialogMode } = useCreateEditModeByFlag(
    () => props.mode === "edit",
  );
  const dialogMode = computed<"create" | "edit">(() =>
    isDetailedMode.value ? "edit" : baseDialogMode.value,
  );
</script>

<template>
  <CreateEditDialog
    v-model:visible="visibleModel"
    :mode="dialogMode"
    create-title="Add Flow Step"
    edit-title="Edit Flow Step"
    create-save-label="Add Step"
    edit-save-label="Save"
    cancel-label="Cancel"
    delete-label="Delete"
    :show-delete="isDetailedMode && Boolean(selectedStageEventId)"
    :is-saving="isMutatingEvent"
    class="w-full! max-w-lg"
    @save="emit('save')"
    @delete="emit('request-delete')"
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

      <template v-if="isDetailedMode">
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
          <label class="text-sm font-medium text-surface-700"
            >Stage Notes</label
          >
          <NotesMarkdownEditor
            v-model="notesModel"
            editor-style="height: 10rem"
            placeholder="Write stage notes in Markdown..."
          />
        </div>
      </template>
    </div>
  </CreateEditDialog>
</template>
