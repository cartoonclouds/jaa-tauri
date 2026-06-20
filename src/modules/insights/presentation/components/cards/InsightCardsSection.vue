<script setup lang="ts">
  import type { IMetric } from "@modules/insights/domain/types/metric";
  import type { InsightCardMetricDefinition } from "@modules/insights/domain/types/insight";
  import type { SortableEvent } from "sortablejs";

  import { useInsightCardVisibility } from "@modules/insights/composables/useInsightCardVisibility";
  import { SETTINGS_REFRESHED_TOPIC } from "@shared/constants/pubsubTopics";
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

  import { useKeyBinding } from "@/composables/useKeyBinding";
  import { usePubSub } from "@/composables/usePubSub";

  import InsightAddHiddenInsightDialog from "./InsightAddHiddenInsightDialog.vue";
  import InsightCard from "./InsightCard.vue";

  /**
   * Defines insight cards section props.
   */
  interface InsightCardsSectionProps {
    overview: IMetric[];
  }

  const props = defineProps<InsightCardsSectionProps>();
  const { subscribe } = usePubSub();
  const {
    isEditMode,
    isPersistingVisibility,
    loadInsightsVisibility,
    setMetricOrder,
    setMetricVisibility,
    splitByVisibility,
    insightsVisibility,
    toggleEditMode,
  } = useInsightCardVisibility();

  const metricViews = computed<InsightCardMetricDefinition[]>(() => {
    return props.overview.map(
      (executable: IMetric): InsightCardMetricDefinition => {
        return executable.toView();
      },
    );
  });

  const metricViewsByVisibility = computed(() =>
    splitByVisibility<InsightCardMetricDefinition>(metricViews.value),
  );

  const metricIdsOnScreen = computed<string[]>(() =>
    metricViews.value.map((metric) => metric.id),
  );

  const visibleMetricViews = computed<InsightCardMetricDefinition[]>(
    () => metricViewsByVisibility.value.visible,
  );

  const orderedVisibleMetricIds = ref<string[]>([]);
  const cardsGridEl = useTemplateRef<HTMLElement>("cardsGrid");

  const isAddHiddenInsightDialogVisible = ref(false);
  const selectedMetricIds = ref<string[]>([]);

  const metricOptions = computed(() => {
    const metaById = new Map<string, { title: string; description: string }>(
      metricViews.value.map((metric) => [
        metric.id,
        { title: metric.title, description: metric.description },
      ]),
    );

    const ids = new Set<string>([
      ...metricViews.value.map((metric) => metric.id),
      ...Object.keys(insightsVisibility.value),
    ]);

    return Array.from(ids).map((id) => ({
      label: metaById.get(id)?.title ?? id,
      description: metaById.get(id)?.description,
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

  const orderedVisibleMetricViews = computed<InsightCardMetricDefinition[]>(
    () => {
      const metricById = new Map<string, InsightCardMetricDefinition>(
        visibleMetricViews.value.map((metric) => [metric.id as string, metric]),
      );

      return orderedVisibleMetricIds.value
        .map((metricId) => metricById.get(metricId))
        .filter((metric): metric is InsightCardMetricDefinition =>
          Boolean(metric),
        );
    },
  );

  const sortable = useSortable(cardsGridEl, orderedVisibleMetricIds, {
    animation: 150,
    disabled: true,
    filter: ".insight-hide-button",
    forceFallback: true,
    ghostClass: "insight-card-ghost",
    chosenClass: "insight-card-chosen",
    dragClass: "insight-card-drag",
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

  function openAddHiddenInsightDialog(): void {
    const visibleIds = visibleMetricViews.value.map((metric) => metric.id);
    selectedMetricIds.value = Array.from(new Set(visibleIds));

    isAddHiddenInsightDialogVisible.value = true;
  }

  async function addSelectedHiddenInsight(): Promise<void> {
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

    isAddHiddenInsightDialogVisible.value = false;
  }

  useKeyBinding({
    bindings: [{ key: "Escape", onTrigger: toggleEditMode }],
    isEnabled: isEditMode,
  });

  onMounted(async () => {
    await loadInsightsVisibility();
  });

  subscribe(SETTINGS_REFRESHED_TOPIC, async () => {
    await loadInsightsVisibility();
  });
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-2xl font-semibold">Job Hunt Overview</h2>
      <div class="flex items-center gap-2">
        <Button
          v-if="isEditMode"
          type="button"
          size="small"
          severity="secondary"
          outlined
          label="Add Snapshot"
          :disabled="isPersistingVisibility"
          @click="openAddHiddenInsightDialog"
        />
        <Button
          type="button"
          size="small"
          :label="isEditMode ? 'Done' : 'Edit Snapshots'"
          :disabled="isPersistingVisibility"
          @click="toggleEditMode"
        />
      </div>
    </div>

    <TransitionGroup
      ref="cardsGrid"
      name="insight-card"
      tag="div"
      class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
      :class="{ 'pb-8': isEditMode }"
    >
      <div
        v-for="metric in orderedVisibleMetricViews"
        :key="metric.id"
        class="relative"
        :class="{
          'insight-card-jiggle cursor-grab active:cursor-grabbing': isEditMode,
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
            class="insight-hide-button pointer-events-auto"
            aria-label="Hide insight"
            :disabled="isPersistingVisibility"
            @click.stop="
              setMetricVisibility(metric.id, false, metricIdsOnScreen)
            "
          >
            <Icon name="heroicons:minus-circle" style="font-size: 1.5rem" />
          </Button>
        </div>

        <InsightCard
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

    <InsightAddHiddenInsightDialog
      v-model:visible="isAddHiddenInsightDialogVisible"
      v-model:selected-metric-ids="selectedMetricIds"
      :metric-options="metricOptions"
      :visible-metric-ids="visibleMetricViews.map((metric) => metric.id)"
      :is-persisting-visibility="isPersistingVisibility"
      @add="addSelectedHiddenInsight"
    />
  </div>
</template>

<style scoped>
  @keyframes insight-card-jiggle {
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

  .insight-card-jiggle {
    animation: insight-card-jiggle 0.4s ease-in-out infinite;
    transform-origin: center top;
  }

  .insight-card-enter-active,
  .insight-card-leave-active,
  .insight-card-move {
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
  }

  .insight-card-enter-from,
  .insight-card-leave-to {
    opacity: 0;
    transform: scale(0.94);
  }

  :deep(.insight-card-chosen) {
    opacity: 0.95;
    transform: scale(1.01);
    transition: transform 120ms ease;
  }

  :deep(.insight-card-ghost) {
    opacity: 0.45;
    filter: saturate(0.85);
  }

  :deep(.insight-card-drag) {
    cursor: grabbing;
    filter: drop-shadow(0 14px 24px rgba(0, 0, 0, 0.22));
    transform: rotate(-1deg) scale(1.02);
    z-index: 40;
  }
</style>


