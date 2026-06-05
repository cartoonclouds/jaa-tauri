<script setup lang="ts">
  import type {
    StatisticCardTone,
    StatisticTrendTone,
  } from "@/modules/statistics/domain/types/statistic";

  import { computed } from "vue";

  import { Icon } from "#components";

  /**
   * Defines statistic card props.
   */
  interface StatisticCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: string;
    tone?: StatisticCardTone;
    suffix?: string;
    trendLabel?: string;
    trendValue?: string;
    trendTone?: StatisticTrendTone;
  }

  const props = withDefaults(defineProps<StatisticCardProps>(), {
    description: "",
    icon: "heroicons:chart-bar",
    tone: "default",
    suffix: "",
    trendLabel: "",
    trendValue: "",
    trendTone: "neutral",
  });

  const toneClasses = computed(() => {
    switch (props.tone) {
      case "success":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "warning":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "danger":
        return "border-rose-200 bg-rose-50 text-rose-700";
      case "info":
        return "border-sky-200 bg-sky-50 text-sky-700";
      default:
        return "border-surface-200 bg-surface-100 text-surface-700";
    }
  });

  const trendClasses = computed(() => {
    switch (props.trendTone) {
      case "positive":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "negative":
        return "border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border-surface-200 bg-surface-100 text-surface-700";
    }
  });

  const trendSeverity = computed(() => {
    switch (props.trendTone) {
      case "positive":
        return "success" as const;
      case "negative":
        return "danger" as const;
      default:
        return "secondary" as const;
    }
  });
</script>

<template>
  <Card
    class="h-full rounded-xl border border-surface-200 bg-surface-0 p-5 shadow-sm"
    :pt="{
      root: 'h-full',
      body: 'h-full flex flex-col',
      content: 'h-full flex flex-col',
    }"
  >
    <template #content>
      <div class="flex h-full flex-col">
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-medium text-surface-500">{{ title }}</p>
          <Avatar shape="circle" class="h-9 w-9 border" :class="toneClasses">
            <Icon :name="icon" class="h-5 w-5" />
          </Avatar>
        </div>

        <p class="mt-3 text-3xl font-semibold leading-tight text-surface-900">
          {{ value }}<span v-if="suffix">{{ suffix }}</span>
        </p>

        <p v-if="description" class="mt-2 text-sm text-surface-500">
          {{ description }}
        </p>

        <p
          v-if="trendValue"
          class="mt-auto inline-flex items-center gap-2 pt-3 text-xs"
        >
          <Tag
            :value="trendValue"
            :severity="trendSeverity"
            rounded
            class="border px-2 py-1 font-medium"
            :class="trendClasses"
          />
          <span class="text-surface-500">{{ trendLabel }}</span>
        </p>
      </div>
    </template>
  </Card>
</template>
