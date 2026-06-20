<script setup lang="ts">
  import { computed } from "vue";

  interface MetricOption {
    label: string;
    value: string;
    description?: string;
  }

  /**
   * Defines add hidden insight dialog props.
   */
  interface InsightAddHiddenInsightDialogProps {
    visible: boolean;
    selectedMetricIds: string[];
    metricOptions: MetricOption[];
    visibleMetricIds: string[];
    isPersistingVisibility: boolean;
  }

  const props = defineProps<InsightAddHiddenInsightDialogProps>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    "update:selectedMetricIds": [value: string[]];
    add: [];
  }>();

  const visibleModel = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const selectedMetricIdsModel = computed({
    get: () => props.selectedMetricIds,
    set: (value: string[]) => {
      emit("update:selectedMetricIds", value);
    },
  });
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :block-scroll="true"
    :draggable="true"
    dismissable-mask
    header="Add Insight"
    :style="{ width: 'min(34rem, 92vw)' }"
  >
    <div class="space-y-3">
      <p class="text-sm text-surface-600">
        Visible insights are already selected. Choose one or more hidden
        insights to add.
      </p>

      <MultiSelect
        v-model="selectedMetricIdsModel"
        :options="props.metricOptions"
        option-label="label"
        option-value="value"
        selected-items-label="{0} insights selected"
        placeholder="Select insights to show"
        display="chip"
        class="hidden-insights-multiselect w-full"
      >
        <template #option="{ option }: { option: MetricOption }">
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-medium">{{ option.label }}</span>
            <span v-if="option.description" class="text-xs text-surface-500">{{
              option.description
            }}</span>
          </div>
        </template>
      </MultiSelect>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          text
          @click="emit('update:visible', false)"
        />
        <Button
          type="button"
          label="Add Selected"
          :disabled="props.isPersistingVisibility"
          :loading="props.isPersistingVisibility"
          @click="emit('add')"
        />
      </div>
    </template>
  </Dialog>
</template>
