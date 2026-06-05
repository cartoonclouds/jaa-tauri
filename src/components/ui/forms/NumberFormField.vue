<script setup lang="ts">
  import FormFieldGroup from "@/components/ui/forms/FormFieldGroup.vue";

  interface Props {
    label: string;
    name: string;
    wrapperClass?: string;
    minFractionDigits?: number;
    maxFractionDigits?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    wrapperClass: "space-y-1",
    minFractionDigits: 0,
    maxFractionDigits: 8,
  });
</script>

<template>
  <FormFieldGroup :label="props.label" :wrapper-class="props.wrapperClass">
    <InputNumber
      :name="props.name"
      :min-fraction-digits="props.minFractionDigits"
      :max-fraction-digits="props.maxFractionDigits"
      fluid
    />
  </FormFieldGroup>
</template>
