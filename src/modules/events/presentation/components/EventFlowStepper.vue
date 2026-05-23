<script setup lang="ts">
  import type { InteractionStage } from "@modules/events/presentation/constants/interactionStages";

  import { EVENT_COPY_BY_STAGE } from "@modules/events/presentation/constants/interactionStages";
  import { computed, type CSSProperties } from "vue";

  interface Props {
    stages: InteractionStage[];
    futureStages?: InteractionStage[];
    activeStepIndex?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    futureStages: () => [],
    activeStepIndex: 1,
  });

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

  function isFutureStep(stepValue: number): boolean {
    return stepValue > props.stages.length;
  }

  function getStepNumberStyle(stepValue: number): CSSProperties {
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

  function getStepTitleStyle(stepValue: number): CSSProperties {
    const isActive = stepValue <= normalizedActiveStepIndex.value;
    const isFuture = isFutureStep(stepValue);

    return {
      color: isActive
        ? "var(--p-stepper-step-title-active-color)"
        : "var(--p-stepper-step-title-color)",
      opacity: isFuture ? 0.75 : 1,
    };
  }

  function getConnectorStyle(stepValue: number): CSSProperties {
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
</script>

<template>
  <Stepper :value="normalizedActiveStepIndex.toString()" class="w-full">
    <StepList class="overflow-x-auto pb-1">
      <Step
        v-for="(stage, index) in displayedStages"
        :key="stage"
        as-child
        :value="index + 1"
      >
        <template #default="{ activateCallback, value, a11yAttrs }">
          <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
            <button
              class="bg-transparent border-0 inline-flex flex-col items-center gap-2"
              v-bind="a11yAttrs.header"
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
              <span
                v-if="isFutureStep(Number(value))"
                class="rounded-full border border-dashed border-surface-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-surface-500"
              >
                Future
              </span>
            </button>
            <div
              v-if="index < displayedStages.length - 1"
              class="hidden sm:block w-full self-center border-t"
              :style="getConnectorStyle(index + 1)"
            />
          </div>
        </template>
      </Step>
    </StepList>
  </Stepper>
</template>
