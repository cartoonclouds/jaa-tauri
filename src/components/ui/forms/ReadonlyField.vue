<script setup lang="ts">
  interface Props {
    label: string;
    value?: string | number | null;
    wrapperClass?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    value: null,
    wrapperClass: "space-y-1",
  });
</script>

<template>
  <div :class="props.wrapperClass">
    <label class="text-sm font-medium text-surface-700">{{
      props.label
    }}</label>
    <p
      class="rounded-md border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700"
    >
      {{ props.value ?? "-" }}
    </p>
  </div>
</template>
