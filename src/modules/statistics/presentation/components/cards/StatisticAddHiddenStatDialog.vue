<script setup lang="ts">
  import { computed } from "vue";

  interface MetricOption {
    label: string;
    value: string;
  }

  /**
   * Defines add hidden stat dialog props.
   */
  interface StatisticAddHiddenStatDialogProps {
    visible: boolean;
    selectedMetricIds: string[];
    metricOptions: MetricOption[];
    visibleMetricIds: string[];
    isPersistingVisibility: boolean;
  }

  const props = defineProps<StatisticAddHiddenStatDialogProps>();

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
    header="Add Hidden Stat"
    :style="{ width: 'min(34rem, 92vw)' }"
  >
    <div class="space-y-3">
      <p class="text-sm text-surface-600">
        Visible stats are already selected. Choose one or more hidden stats to
        add.
      </p>

      <MultiSelect
        v-model="selectedMetricIdsModel"
        :options="props.metricOptions"
        option-label="label"
        option-value="value"
        selected-items-label="{0} stats selected"
        placeholder="Select stats to show"
        display="chip"
        class="hidden-stats-multiselect w-full"
      />
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
