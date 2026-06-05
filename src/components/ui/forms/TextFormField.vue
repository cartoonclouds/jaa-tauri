<script setup lang="ts">
  import FormFieldGroup from "@/components/ui/forms/FormFieldGroup.vue";

  interface Props {
    label: string;
    name: string;
    placeholder?: string;
    invalid?: boolean;
    errorMessage?: string | null;
    wrapperClass?: string;
    type?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    placeholder: "",
    invalid: false,
    errorMessage: null,
    wrapperClass: "space-y-1",
    type: "text",
  });
</script>

<template>
  <FormFieldGroup
    :label="props.label"
    :invalid="props.invalid"
    :error-message="props.errorMessage"
    :wrapper-class="props.wrapperClass"
  >
    <InputText
      :name="props.name"
      :type="props.type"
      :placeholder="props.placeholder"
      fluid
      :invalid="props.invalid"
    />
  </FormFieldGroup>
</template>
