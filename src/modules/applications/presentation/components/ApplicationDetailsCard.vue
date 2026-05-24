<script setup lang="ts">
  import Card from "primevue/card";
  import { computed } from "vue";

  /**
   * Defines props for the application details card wrapper.
   */
  interface Props {
    title: string;
    compact?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    compact: false,
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
      <span class="text-xs uppercase tracking-wide text-surface-500">
        {{ title }}
      </span>
    </template>

    <template #content>
      <slot />
    </template>
  </Card>
</template>
