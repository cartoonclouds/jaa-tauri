<script setup lang="ts">
  import Card from "primevue/card";
  import { computed } from "vue";

  /**
   * Defines props for the application details card wrapper.
   */
  interface Props {
    title: string;
    compact?: boolean;
    /** Tooltip text shown on the info icon in the card header. */
    info?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    compact: false,
    info: undefined,
  });

  const cardPt = computed(() => {
    if (props.compact) {
      return { root: "p-3" };
    }

    return undefined;
  });
</script>

<template>
  <Card :pt="cardPt">
    <template #title>
      <div class="flex items-center justify-between">
        <span class="text-xs uppercase tracking-wide text-surface-500">
          {{ title }}
        </span>
        <Icon
          v-if="info"
          v-tooltip.left="info"
          name="heroicons:information-circle"
          class="size-4 cursor-default text-surface-400"
        />
      </div>
    </template>

    <template #content>
      <slot />
    </template>
  </Card>
</template>
