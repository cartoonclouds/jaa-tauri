<script setup lang="ts">
  import Card from "primevue/card";

  /**
   * Defines props.
   */
  interface Props {
    label: string;
    compact?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    compact: false,
  });
</script>

<template>
  <Card :pt="{ root: props.compact ? 'p-3' : 'p-4' }">
    <template #title>
      <span class="text-xs uppercase tracking-wide text-surface-500">{{
        label
      }}</span>
    </template>
    <template #content>
      <slot />
    </template>
  </Card>
</template>









