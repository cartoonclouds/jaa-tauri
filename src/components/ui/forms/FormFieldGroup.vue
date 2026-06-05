<script setup lang="ts">
  interface Props {
    label: string;
    invalid?: boolean;
    errorMessage?: string | null;
    wrapperClass?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    invalid: false,
    errorMessage: null,
    wrapperClass: "space-y-1",
  });
</script>

<template>
  <div :class="props.wrapperClass">
    <label class="text-sm font-medium text-surface-700">{{
      props.label
    }}</label>
    <slot />
    <Message
      v-if="props.invalid && props.errorMessage"
      severity="error"
      size="small"
      variant="simple"
    >
      {{ props.errorMessage }}
    </Message>
  </div>
</template>
