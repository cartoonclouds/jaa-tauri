<script setup lang="ts">
  import type { InteractionStage } from "@modules/events/constants";

  import { EVENT_COPY_BY_STAGE } from "@modules/events/constants";
  import { computed, type CSSProperties } from "vue";

  /**
   * Defines props.
   */
  interface Props {
    stages: InteractionStage[];
    futureStages?: InteractionStage[];
    activeStepIndex?: number;
    stageHoverLabels?: Partial<Record<InteractionStage, string>>;
  }

  const props = withDefaults(defineProps<Props>(), {
    futureStages: () => [],
    activeStepIndex: 1,
    stageHoverLabels: () => ({}),
  });
  const emit = defineEmits<{
    "stage-dblclick": [stage: InteractionStage];
  }>();

  const displayedStages = computed<InteractionStage[]>(() => {
    return [
      ...props.stages,
      ...props.futureStages.filter((stage) => !props.stages.includes(stage)),
    ];
  });

  const normalizedActiveStepIndex = computed(() => {
    if (displayedStages.value.length === 0) {
      return 1;
    }

    if (props.activeStepIndex < 1) {
      return 1;
    }

    if (props.activeStepIndex > displayedStages.value.length) {
      return displayedStages.value.length;
    }

    return props.activeStepIndex;
  });

  /**
   * Handles is future step.
   */
  function isFutureStep(stepValue: number): boolean {
    /**
     * Checks whether future step is true.
     */
    return stepValue > props.stages.length;
  }

  /**
   * Handles get step number style.
   */
  function getStepNumberStyle(stepValue: number): CSSProperties {
    /**
     * Gets step number style.
     */
    const isActive = stepValue <= normalizedActiveStepIndex.value;
    const isFuture = isFutureStep(stepValue);

    return {
      backgroundColor: isActive
        ? "var(--p-stepper-step-number-active-background)"
        : "var(--p-stepper-step-number-background)",
      borderColor: isActive
        ? "var(--p-stepper-step-number-active-border-color)"
        : "var(--p-stepper-step-number-border-color)",
      borderStyle: isFuture ? "dashed" : "solid",
      color: isActive
        ? "var(--p-stepper-step-number-active-color)"
        : "var(--p-stepper-step-number-color)",
      opacity: isFuture ? 0.7 : 1,
    };
  }

  /**
   * Handles get step title style.
   */
  function getStepTitleStyle(stepValue: number): CSSProperties {
    /**
     * Gets step title style.
     */
    const isActive = stepValue <= normalizedActiveStepIndex.value;
    const isFuture = isFutureStep(stepValue);

    return {
      color: isActive
        ? "var(--p-stepper-step-title-active-color)"
        : "var(--p-stepper-step-title-color)",
      opacity: isFuture ? 0.75 : 1,
    };
  }

  /**
   * Handles get connector style.
   */
  function getConnectorStyle(stepValue: number): CSSProperties {
    /**
     * Gets connector style.
     */
    const isFuture = stepValue >= props.stages.length;

    return {
      borderTopColor: isFuture
        ? "var(--p-stepper-separator-background)"
        : "var(--p-stepper-step-title-active-color)",
      borderTopStyle: isFuture ? "dashed" : "solid",
      borderTopWidth: "2px",
      opacity: isFuture ? 0.55 : 1,
    };
  }

  /**
   * Handles get hover text.
   */
  function getHoverText(stage: InteractionStage): string {
    const eventAt = props.stageHoverLabels[stage];
    if (!eventAt) {
      return "";
    }

    return `Event at: ${eventAt}`;
  }

  /**
   * Handles on stage double click.
   */
  function onStageDoubleClick(stage: InteractionStage): void {
    emit("stage-dblclick", stage);
  }
</script>

<template>
  <Stepper
    :value="normalizedActiveStepIndex.toString()"
    class="h-auto! min-h-0! w-full"
  >
    <StepList
      class="h-auto! min-h-0! max-h-none! items-start! overflow-x-auto overflow-y-hidden pb-1"
    >
      <Step
        v-for="(stage, index) in displayedStages"
        :key="stage"
        as-child
        :value="index + 1"
      >
        <template #default="{ activateCallback, value, a11yAttrs }">
          <div
            class="flex flex-row flex-auto self-start items-start gap-2"
            v-bind="a11yAttrs.root"
          >
            <button
              v-tooltip.top="{
                value: getHoverText(stage),
                disabled: !getHoverText(stage),
              }"
              class="inline-flex h-auto min-h-20 self-start hover:cursor-pointer flex-col items-center gap-2 border-0 bg-transparent align-top"
              v-bind="a11yAttrs.header"
              @dblclick="onStageDoubleClick(stage)"
              @click="activateCallback"
            >
              <span
                class="rounded-full border-2 w-10 h-10 inline-flex items-center justify-center text-xs font-semibold transition-colors"
                :style="getStepNumberStyle(Number(value))"
              >
                {{ index + 1 }}
              </span>
              <span
                class="text-center text-xs leading-tight max-w-32"
                :style="getStepTitleStyle(Number(value))"
              >
                {{ EVENT_COPY_BY_STAGE[stage]?.title ?? stage }}
              </span>
            </button>
            <div
              v-if="index < displayedStages.length - 1"
              class="hidden w-full self-start border-t sm:block"
              style="margin-top: 1.25rem"
              :style="getConnectorStyle(index + 1)"
            />
          </div>
        </template>
      </Step>
    </StepList>
  </Stepper>
</template>
