<script setup lang="ts">
  import { computed } from "vue";

  interface Props {
    label: string;
    compact?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    compact: false,
  });

  const cardClass = computed(() =>
    props.compact
      ? "rounded-xl border border-surface-200 bg-surface-0/90 p-3 shadow-sm"
      : "rounded-xl border border-surface-200 bg-surface-0/90 p-4 shadow-sm",
  );
</script>

<template>
  <div :class="cardClass">
    <p class="text-xs uppercase tracking-wide text-surface-500">{{ label }}</p>
    <slot />
  </div>
</template>
