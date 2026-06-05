<script setup lang="ts">
  import type { InteractionStage } from "@modules/events/constants";

  import { computed } from "vue";

  import CreateEditDialog from "@/components/ui/CreateEditDialog.vue";

  interface Props {
    visible: boolean;
    mode: "create" | "edit";
    applicationId: string;
    eventType: InteractionStage | "";
    title: string;
    description: string;
    isSaving: boolean;
    errorMessage: string;
    stageSuggestions: readonly InteractionStage[];
    mutedTextStyle: Record<string, string>;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    "update:applicationId": [value: string];
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

  const applicationIdModel = computed({
    get: () => props.applicationId,
    set: (value: string) => {
      emit("update:applicationId", value);
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
  <CreateEditDialog
    v-model:visible="visibleModel"
    :mode="mode"
    create-title="Add interaction"
    edit-title="Edit interaction"
    create-save-label="Add event"
    edit-save-label="Save"
    cancel-label="Cancel"
    delete-label="Delete"
    :show-delete="mode === 'edit'"
    :is-saving="isSaving"
    :dialog-style="{ width: '38rem' }"
    :breakpoints="{ '1199px': '70vw', '575px': '95vw' }"
    @save="emit('save')"
    @delete="emit('delete')"
  >
    <Message v-if="errorMessage" severity="error" class="mb-4">
      {{ errorMessage }}
    </Message>

    <div class="grid gap-3 md:grid-cols-2">
      <div v-if="mode === 'create'" class="space-y-1 md:col-span-2">
        <label
          class="text-sm font-medium"
          :style="mutedTextStyle"
          for="event-application-id"
        >
          Application ID
        </label>
        <InputText
          id="event-application-id"
          v-model="applicationIdModel"
          fluid
          placeholder="Application UUID"
        />
      </div>

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

    <datalist id="interaction-stage-options">
      <option v-for="stage in stageSuggestions" :key="stage" :value="stage" />
    </datalist>
  </CreateEditDialog>
</template>
