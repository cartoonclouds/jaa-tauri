<script setup lang="ts">
  import type { StatisticCardMetricDefinition } from "@/modules/statistics/domain/types/statistic.js";
  import type { IMetric } from "@modules/statistics/domain/types/metric";
  import type { SortableEvent } from "sortablejs";

  import { useStatisticCardVisibility } from "@modules/statistics/composables/useStatisticCardVisibility";
  import {
    moveArrayElement,
    useSortable,
  } from "@vueuse/integrations/useSortable";
  import {
    computed,
    nextTick,
    onMounted,
    ref,
    useTemplateRef,
    watch,
  } from "vue";

  import StatisticAddHiddenStatDialog from "./StatisticAddHiddenStatDialog.vue";
  import StatisticCard from "./StatisticCard.vue";

  /**
   * Defines statistic cards section props.
   */
  interface StatisticCardsSectionProps {
    overview: IMetric[];
  }

  const props = defineProps<StatisticCardsSectionProps>();
  const {
    isEditMode,
    isPersistingVisibility,
    loadStatsVisibility,
    setMetricOrder,
    setMetricVisibility,
    splitByVisibility,
    statsVisibility,
    toggleEditMode,
  } = useStatisticCardVisibility();

  const metricViews = computed<StatisticCardMetricDefinition[]>(() => {
    return props.overview.map(
      (executable: IMetric): StatisticCardMetricDefinition => {
        return executable.toView();
      },
    );
  });

  const metricViewsByVisibility = computed(() =>
    splitByVisibility<StatisticCardMetricDefinition>(metricViews.value),
  );

  const metricIdsOnScreen = computed<string[]>(() =>
    metricViews.value.map((metric) => metric.id),
  );

  const visibleMetricViews = computed<StatisticCardMetricDefinition[]>(
    () => metricViewsByVisibility.value.visible,
  );

  const orderedVisibleMetricIds = ref<string[]>([]);
  const cardsGridEl = useTemplateRef<HTMLElement>("cardsGrid");

  const isAddHiddenStatDialogVisible = ref(false);
  const selectedMetricIds = ref<string[]>([]);

  const metricOptions = computed(() => {
    const labelById = new Map<string, string>(
      metricViews.value.map((metric) => [metric.id, metric.title]),
    );

    const ids = new Set<string>([
      ...metricViews.value.map((metric) => metric.id),
      ...Object.keys(statsVisibility.value),
    ]);

    return Array.from(ids).map((id) => ({
      label: labelById.get(id) ?? id,
      value: id,
    }));
  });

  watch(
    [metricOptions, visibleMetricViews],
    ([options, visibleMetrics]) => {
      const visibleIds = visibleMetrics.map((metric) => metric.id);
      const validSelectedIds = selectedMetricIds.value.filter((selectedId) =>
        options.some((option) => option.value === selectedId),
      );

      const merged = Array.from(new Set([...visibleIds, ...validSelectedIds]));
      selectedMetricIds.value = merged;
    },
    { immediate: true },
  );

  watch(
    visibleMetricViews,
    (metrics) => {
      const nextVisibleIds = metrics.map((metric) => metric.id as string);
      const nextVisibleIdSet = new Set(nextVisibleIds);

      const retainedOrderedIds = orderedVisibleMetricIds.value.filter((id) =>
        nextVisibleIdSet.has(id),
      );

      const appendedIds = nextVisibleIds.filter(
        (id) => !retainedOrderedIds.includes(id),
      );

      orderedVisibleMetricIds.value = [...retainedOrderedIds, ...appendedIds];
    },
    { immediate: true },
  );

  const orderedVisibleMetricViews = computed<StatisticCardMetricDefinition[]>(
    () => {
      const metricById = new Map<string, StatisticCardMetricDefinition>(
        visibleMetricViews.value.map((metric) => [metric.id as string, metric]),
      );

      return orderedVisibleMetricIds.value
        .map((metricId) => metricById.get(metricId))
        .filter((metric): metric is StatisticCardMetricDefinition =>
          Boolean(metric),
        );
    },
  );

  const sortable = useSortable(cardsGridEl, orderedVisibleMetricIds, {
    animation: 150,
    disabled: true,
    filter: ".stat-hide-button",
    forceFallback: true,
    ghostClass: "stat-card-ghost",
    chosenClass: "stat-card-chosen",
    dragClass: "stat-card-drag",
    watchElement: true,
    onUpdate: async (event: SortableEvent) => {
      if (
        !isEditMode.value ||
        isPersistingVisibility.value ||
        event.oldIndex === undefined ||
        event.newIndex === undefined
      ) {
        return;
      }

      moveArrayElement(
        orderedVisibleMetricIds,
        event.oldIndex,
        event.newIndex,
        event,
      );

      await nextTick();

      const reorderedIds = [...orderedVisibleMetricIds.value];
      const remainingMetricIds = metricOptions.value
        .map((option) => option.value)
        .filter((metricId) => !reorderedIds.includes(metricId));

      await setMetricOrder([...reorderedIds, ...remainingMetricIds]);
    },
  });

  watch(
    [isEditMode, isPersistingVisibility],
    ([editMode, persistingVisibility]) => {
      sortable.option("disabled", !editMode || persistingVisibility);
    },
    { immediate: true },
  );

  function openAddHiddenStatDialog(): void {
    const visibleIds = visibleMetricViews.value.map((metric) => metric.id);
    selectedMetricIds.value = Array.from(new Set(visibleIds));

    isAddHiddenStatDialogVisible.value = true;
  }

  async function addSelectedHiddenStat(): Promise<void> {
    const allMetricOptionIds = metricOptions.value.map(
      (option) => option.value,
    );

    if (allMetricOptionIds.length === 0) {
      return;
    }

    const selectedIds = new Set(selectedMetricIds.value);
    const hasAnySelection = allMetricOptionIds.some((metricId) =>
      selectedIds.has(metricId),
    );

    if (!hasAnySelection) {
      return;
    }

    for (const metricId of allMetricOptionIds) {
      await setMetricVisibility(
        metricId,
        selectedIds.has(metricId),
        allMetricOptionIds,
      );
    }

    isAddHiddenStatDialogVisible.value = false;
  }

  onMounted(async () => {
    await loadStatsVisibility();
  });
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-2xl font-semibold">Job Hunt Snapshot</h2>
      <div class="flex items-center gap-2">
        <Button
          v-if="isEditMode"
          type="button"
          size="small"
          severity="secondary"
          outlined
          label="Add Snapshot"
          :disabled="isPersistingVisibility"
          @click="openAddHiddenStatDialog"
        />
        <Button
          type="button"
          size="small"
          :label="isEditMode ? 'Done' : 'Edit Snapshot'"
          :disabled="isPersistingVisibility"
          @click="toggleEditMode"
        />
      </div>
    </div>

    <TransitionGroup
      ref="cardsGrid"
      name="stat-card"
      tag="div"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6"
      :class="{ 'pb-8': isEditMode }"
    >
      <div
        v-for="metric in orderedVisibleMetricViews"
        :key="metric.id"
        class="relative"
        :class="{
          'cursor-grab active:cursor-grabbing': isEditMode,
          'stat-card-jiggle': isEditMode,
        }"
      >
        <div
          v-if="isEditMode"
          class="pointer-events-none absolute -inset-x-7 -top-6 z-10 flex justify-end p-2"
        >
          <Button
            type="button"
            severity="danger"
            rounded
            text
            size="large"
            class="stat-hide-button pointer-events-auto"
            aria-label="Hide stat"
            :disabled="isPersistingVisibility"
            @click.stop="
              setMetricVisibility(metric.id, false, metricIdsOnScreen)
            "
          >
            <Icon name="heroicons:minus-circle" style="font-size: 1.5rem" />
          </Button>
        </div>

        <StatisticCard
          :title="metric.title"
          :value="metric.value"
          :description="metric.description"
          :icon="metric.icon"
          :tone="metric.tone"
          :suffix="metric.suffix ?? ''"
          :trend-label="metric.trendLabel ?? ''"
          :trend-value="metric.trendValue ?? ''"
          :trend-tone="metric.trendTone ?? 'neutral'"
        />
      </div>
    </TransitionGroup>

    <StatisticAddHiddenStatDialog
      v-model:visible="isAddHiddenStatDialogVisible"
      v-model:selected-metric-ids="selectedMetricIds"
      :metric-options="metricOptions"
      :visible-metric-ids="visibleMetricViews.map((metric) => metric.id)"
      :is-persisting-visibility="isPersistingVisibility"
      @add="addSelectedHiddenStat"
    />
  </div>
</template>

<style scoped>
  @keyframes stat-card-jiggle {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-1.2deg);
    }
    50% {
      transform: rotate(0deg);
    }
    75% {
      transform: rotate(1.2deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  .stat-card-jiggle {
    animation: stat-card-jiggle 0.4s ease-in-out infinite;
    transform-origin: center top;
  }

  .stat-card-enter-active,
  .stat-card-leave-active,
  .stat-card-move {
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
  }

  .stat-card-enter-from,
  .stat-card-leave-to {
    opacity: 0;
    transform: scale(0.94);
  }

  :deep(.stat-card-chosen) {
    opacity: 0.95;
    transform: scale(1.01);
    transition: transform 120ms ease;
  }

  :deep(.stat-card-ghost) {
    opacity: 0.45;
    filter: saturate(0.85);
  }

  :deep(.stat-card-drag) {
    cursor: grabbing;
    filter: drop-shadow(0 14px 24px rgba(0, 0, 0, 0.22));
    transform: rotate(-1deg) scale(1.02);
    z-index: 40;
  }
</style>
