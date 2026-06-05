<script setup lang="ts">
  import FormFieldGroup from "@/components/ui/forms/FormFieldGroup.vue";

  interface Props {
    label: string;
    name: string;
    options: unknown[];
    optionLabel?: string;
    optionValue?: string;
    wrapperClass?: string;
    invalid?: boolean;
    errorMessage?: string | null;
  }

  const props = withDefaults(defineProps<Props>(), {
    optionLabel: "label",
    optionValue: "value",
    wrapperClass: "space-y-1",
    invalid: false,
    errorMessage: null,
  });
</script>

<template>
  <FormFieldGroup
    :label="props.label"
    :invalid="props.invalid"
    :error-message="props.errorMessage"
    :wrapper-class="props.wrapperClass"
  >
    <Select
      :name="props.name"
      :options="props.options"
      :option-label="props.optionLabel"
      :option-value="props.optionValue"
      fluid
    />
  </FormFieldGroup>
</template>
